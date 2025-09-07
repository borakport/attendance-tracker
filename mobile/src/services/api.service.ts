/**
 * API Service
 * 
 * This service provides a centralized HTTP client for communicating with backend services.
 * It handles authentication, token refresh, request/response interceptors, and error handling
 * for both auth and attendance microservices.
 * 
 * Key Features:
 * - Automatic JWT token injection into requests
 * - Token refresh mechanism with retry logic
 * - Request/response logging for debugging
 * - Centralized error handling with user notifications
 * - Support for multiple backend services
 * 
 * Architecture:
 * - Separate Axios instances for auth and attendance services
 * - Interceptors for authentication and error handling
 * - AsyncStorage integration for token persistence
 * - Navigation integration for authentication redirects
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import { ApiResponse, Course, Session, Attendance, User, AuthTokens, CourseSettings } from '@/types';
import Toast from 'react-native-toast-message';
import { NavigationContainerRef } from '@react-navigation/native';

// Navigation reference for handling authentication redirects
let navigationRef: NavigationContainerRef<any> | null = null;

// Store reference for dispatching logout actions
let storeRef: any = null;

/**
 * Set navigation reference for API service
 * Allows API service to navigate users when tokens expire
 * 
 * @param ref - React Navigation container reference
 */
export const setNavigationRef = (ref: NavigationContainerRef<any>) => {
  navigationRef = ref;
};

/**
 * Set store reference for API service
 * Allows API service to dispatch logout actions when needed
 * 
 * @param store - Redux store reference
 */
export const setStoreRef = (store: any) => {
  storeRef = store;
};

/**
 * API Service Class
 * 
 * Provides HTTP client functionality with automatic authentication,
 * token management, and error handling for the mobile application.
 */
class ApiService {
  private authApi: AxiosInstance;           // Axios instance for auth service
  private attendanceApi: AxiosInstance;     // Axios instance for attendance service
  private isRefreshing = false;             // Flag to prevent multiple token refresh attempts
  private refreshSubscribers: ((token: string | null) => void)[] = []; // Queue for requests waiting for token refresh

  constructor() {
    // Initialize Auth Service API client
    this.authApi = axios.create({
      baseURL: Config.API.AUTH_URL,
      timeout: Config.API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Initialize Attendance Service API client
    this.attendanceApi = axios.create({
      baseURL: Config.API.ATTENDANCE_URL,
      timeout: Config.API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup request and response interceptors for both clients
    this.setupInterceptors();
  }

  /**
   * Setup Request and Response Interceptors
   * 
   * Configures automatic token injection, request logging,
   * and token refresh handling for both API clients.
   */
  private setupInterceptors() {
    // Request interceptor - adds authentication token and logging
    const requestInterceptor = async (config: InternalAxiosRequestConfig) => {
      // Inject JWT token into request headers
      const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log API requests in debug mode
      if (Config.APP.DEBUG) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }
      
      return config;
    };

    /**
     * Response error interceptor - handles token refresh and error logging
     * Automatically refreshes expired tokens and retries failed requests
     */
    const responseErrorInterceptor = async (error: AxiosError) => {
      const originalRequest: any = error.config;

      if (Config.APP.DEBUG) {
        console.error('❌ API Error:', error.response?.data || error.message);
      }

      // Handle 401 (Unauthorized) errors - token expired
      if (error.response?.status === 401 && !originalRequest._retry) {
        
        // If we're already refreshing a token, queue this request
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.refreshSubscribers.push((token: string | null) => {
              if (token) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(axios(originalRequest));
              } else {
                reject(error);
              }
            });
          });
        }

        // Mark this request as retried to prevent infinite loops
        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          console.log('🔄 Access token expired, attempting automatic refresh...');
          
          // Attempt to refresh the access token
          const newToken = await this.refreshToken();
          
          // Notify all queued requests about the new token
          this.onRefreshSuccess(newToken);
          
          // Retry the original request with the new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
          
        } catch (refreshError: any) {
          console.error('❌ Token refresh failed:', refreshError.message);
          
          // Notify all queued requests that refresh failed
          this.onRefreshFailed();
          
          // Clear authentication data
          await this.clearAuth();
          
          // Check if the refresh token has expired (7 days)
          if (refreshError.response?.status === 401 || refreshError.message?.includes('refresh token')) {
            // Refresh token expired - automatic logout
            Toast.show({
              type: 'info',
              text1: 'Session Expired',
              text2: 'Please login again to continue',
              visibilityTime: 4000,
            });
          } else {
            // Other refresh errors
            Toast.show({
              type: 'error',
              text1: 'Authentication Error',
              text2: 'Please login again',
              visibilityTime: 4000,
            });
          }
          
          // Navigate to login screen
          if (navigationRef && navigationRef.isReady()) {
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }
          
          // Re-throw the original error
          throw error;
        } finally {
          this.isRefreshing = false;
        }
      }

      return Promise.reject(error);
    };

    // Apply interceptors
    this.authApi.interceptors.request.use(requestInterceptor);
    this.attendanceApi.interceptors.request.use(requestInterceptor);

    this.authApi.interceptors.response.use(
      (response) => response,
      responseErrorInterceptor
    );

    this.attendanceApi.interceptors.response.use(
      (response) => response,
      responseErrorInterceptor
    );
  }

  private onRefreshSuccess(token: string) {
    console.log('✅ Token refresh successful, retrying queued requests...');
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private onRefreshFailed() {
    console.log('❌ Token refresh failed, rejecting queued requests...');
    this.refreshSubscribers.forEach(callback => callback(null));
    this.refreshSubscribers = [];
  }

  private async refreshToken(): Promise<string> {
    try {
      const refreshToken = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      console.log('🔄 Refreshing access token...');

      // Use the refresh-access-token endpoint that only refreshes the access token
      const response = await this.authApi.post('/auth/refresh-access-token', {
        refreshToken,
      });

      // The endpoint returns a new access token, keep the existing refresh token
      const { accessToken } = response.data.data;
      
      if (!accessToken) {
        throw new Error('No access token received from refresh endpoint');
      }
      
      // Store the new access token
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, accessToken);
      
      console.log('✅ Access token refreshed successfully');
      return accessToken;
      
    } catch (error: any) {
      console.error('❌ Token refresh error:', error.response?.data || error.message);
      
      // If the refresh token is invalid/expired, the backend will return 401
      if (error.response?.status === 401) {
        throw new Error('Refresh token expired');
      }
      
      // Re-throw with more context
      throw new Error(`Token refresh failed: ${error.message}`);
    }
  }

  // Public method for refreshing tokens (now uses refresh-access-token endpoint)
  async refreshAuthToken(): Promise<ApiResponse<AuthTokens>> {
    try {
      const refreshTokenValue = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshTokenValue) {
        throw new Error('No refresh token');
      }

      // Use the new refresh-access-token endpoint that only refreshes the access token
      const response = await this.authApi.post('/auth/refresh-access-token', {
        refreshToken: refreshTokenValue,
      });

      const { accessToken } = response.data.data;
      
      // Only update the access token, keep the existing refresh token
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, accessToken);
      
      return {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken,
          refreshToken: refreshTokenValue, // Return the existing refresh token
        },
      };
    } catch (error) {
      await this.clearAuth();
      throw error;
    }
  }

  // Public method for refreshing both access and refresh tokens (legacy endpoint)
  // Use this only when you need to refresh both tokens (e.g., for long-term sessions)
  async refreshBothTokens(): Promise<ApiResponse<AuthTokens>> {
    try {
      const refreshTokenValue = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshTokenValue) {
        throw new Error('No refresh token');
      }

      // Use the legacy refresh-token endpoint that refreshes both tokens
      const response = await this.authApi.post('/auth/refresh-token', {
        refreshToken: refreshTokenValue,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, accessToken);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      
      return {
        success: true,
        message: 'Both tokens refreshed successfully',
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      };
    } catch (error) {
      await this.clearAuth();
      throw error;
    }
  }

  // Public method for refreshing only access token (new preferred method)
  async refreshAccessToken(): Promise<ApiResponse<{ accessToken: string }>> {
    try {
      const refreshTokenValue = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshTokenValue) {
        throw new Error('No refresh token');
      }

      const response = await this.authApi.post('/auth/refresh-access-token', {
        refreshToken: refreshTokenValue,
      });

      const { accessToken } = response.data.data;
      
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, accessToken);
      
      return {
        success: true,
        message: 'Access token refreshed successfully',
        data: {
          accessToken,
        },
      };
    } catch (error) {
      await this.clearAuth();
      throw error;
    }
  }

  private async clearAuth() {
    // Clear tokens from AsyncStorage
    await AsyncStorage.multiRemove([
      Config.STORAGE_KEYS.AUTH_TOKEN,
      Config.STORAGE_KEYS.REFRESH_TOKEN,
      Config.STORAGE_KEYS.USER_DATA,
    ]);

    // Dispatch logout action to update Redux state
    if (storeRef) {
      const { logout } = await import('@/store/slices/authSlice');
      storeRef.dispatch(logout());
    }
  }

  // Check if user has valid tokens stored
  async hasValidTokens(): Promise<boolean> {
    try {
      const [accessToken, refreshToken] = await AsyncStorage.multiGet([
        Config.STORAGE_KEYS.AUTH_TOKEN,
        Config.STORAGE_KEYS.REFRESH_TOKEN,
      ]);
      
      return !!(accessToken[1] && refreshToken[1]);
    } catch (error) {
      return false;
    }
  }

  // ========== AUTH METHODS ==========
  async signIn(email: string, password: string): Promise<ApiResponse> {
    const response = await this.authApi.post('/auth/signin', {
      email,
      password,
    });
    return response.data;
  }

  async signUp(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    role: string;
  }): Promise<ApiResponse> {
    const response = await this.authApi.post('/auth/signup', data);
    return response.data;
  }

  async signOut(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
      if (token) {
        try {
          await this.authApi.post('/auth/logout', { refreshToken: token });
        } catch (error: any) {
          // Logout endpoint may not exist, just clear local auth
          console.log('Logout endpoint error, clearing local auth');
        }
      }
    } catch (error) {
      console.error('Signout error:', error);
    } finally {
      await this.clearAuth();
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.authApi.get('/auth/profile');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.authApi.put('/auth/profile', data);
    return response.data;
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    const response = await this.authApi.post('/auth/verify-email', { token });
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await this.authApi.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const response = await this.authApi.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  }

  async verifyPassword(password: string): Promise<ApiResponse> {
    const response = await this.authApi.post('/auth/verify-password', { password });
    return response.data;
  }

  // ========== COURSE METHODS ==========
  async getCourses(): Promise<ApiResponse<Course[]>> {
    const response = await this.attendanceApi.get('/courses');
    return response.data;
  }

  // Alias for getting user's enrolled courses (same as getCourses since backend filters by user)
  async getMyCourses(): Promise<ApiResponse<Course[]>> {
    return this.getCourses();
  }

  async getCourse(id: string): Promise<ApiResponse<Course>> {
    const response = await this.attendanceApi.get(`/courses/${id}`);
    return response.data;
  }

  async createCourse(data: Partial<Course>): Promise<ApiResponse<Course>> {
    const response = await this.attendanceApi.post('/courses', data);
    return response.data;
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<ApiResponse<Course>> {
    const response = await this.attendanceApi.put(`/courses/${id}`, data);
    return response.data;
  }

  async editCourse(id: string, data: { name?: string; description?: string; endDate?: string; password: string }): Promise<ApiResponse<Course>> {
    const response = await this.attendanceApi.patch(`/courses/${id}/edit`, data);
    return response.data;
  }

  async updateCourseSettings(id: string, data: { settings: Partial<CourseSettings>; password: string }): Promise<ApiResponse<Course>> {
    const response = await this.attendanceApi.patch(`/courses/${id}/settings`, data);
    return response.data;
  }

  async deleteCourse(id: string, password: string): Promise<ApiResponse> {
    const response = await this.attendanceApi.delete(`/courses/${id}`, { 
      data: { password } 
    });
    return response.data;
  }

  async enrollInCourse(code: string): Promise<ApiResponse<Course>> {
    // Fixed endpoint - uses /enroll not /join
    const response = await this.attendanceApi.post('/courses/enroll', { code });
    return response.data;
  }

  // Alias for backward compatibility
  async joinCourse(code: string): Promise<ApiResponse<Course>> {
    return this.enrollInCourse(code);
  }

  async leaveCourse(id: string, password: string): Promise<ApiResponse> {
    const response = await this.attendanceApi.post(`/courses/${id}/leave`, { password });
    return response.data;
  }

  async getCourseMembers(courseId: string): Promise<ApiResponse<any[]>> {
    const response = await this.attendanceApi.get(`/courses/${courseId}/members`);
    return response.data;
  }

  // ========== SESSION METHODS ==========
  async getActiveSessions(): Promise<ApiResponse<Session[]>> {
    const response = await this.attendanceApi.get('/sessions/active');
    return response.data;
  }

  async getCourseSessions(courseId: string): Promise<ApiResponse<Session[]>> {
    const response = await this.attendanceApi.get(`/sessions/course/${courseId}`);
    return response.data;
  }

  // Alias for backward compatibility
  async getSessions(courseId: string): Promise<ApiResponse<Session[]>> {
    return this.getCourseSessions(courseId);
  }

  async createSession(data: Partial<Session>): Promise<ApiResponse<Session>> {
    const response = await this.attendanceApi.post('/sessions', data);
    return response.data;
  }

  async getSession(id: string): Promise<ApiResponse<Session>> {
    const response = await this.attendanceApi.get(`/sessions/${id}`);
    return response.data;
  }

  async startSession(id: string, location?: { latitude: number; longitude: number }): Promise<ApiResponse<Session>> {
    const data = location ? { location } : {};
    const response = await this.attendanceApi.post(`/sessions/${id}/start`, data);
    return response.data;
  }

  async endSession(id: string): Promise<ApiResponse<Session>> {
    const response = await this.attendanceApi.post(`/sessions/${id}/end`);
    return response.data;
  }

  async updateSession(id: string, data: Partial<Session>): Promise<ApiResponse<Session>> {
    const response = await this.attendanceApi.put(`/sessions/${id}`, data);
    return response.data;
  }

  async deleteSession(id: string): Promise<ApiResponse<void>> {
    const response = await this.attendanceApi.delete(`/sessions/${id}`);
    return response.data;
  }

  // ========== ATTENDANCE METHODS ==========
  async markAttendance(data: {
    sessionId: string;
    latitude: number;
    longitude: number;
    selfieUrl?: string;
    deviceInfo?: any;
  }): Promise<ApiResponse<Attendance>> {
    const response = await this.attendanceApi.post('/attendance/mark', data);
    return response.data;
  }

  async addManualAttendance(data: {
    sessionId: string;
    userId: string;
    status: string;
    markedAt: string;
    latitude: number;
    longitude: number;
  }): Promise<ApiResponse<Attendance>> {
    const response = await this.attendanceApi.post('/attendance/manual', data);
    return response.data;
  }

  async getMyAttendance(): Promise<ApiResponse<Attendance[]>> {
    const response = await this.attendanceApi.get('/attendance/my');
    return response.data;
  }

  async getSessionAttendance(sessionId: string): Promise<ApiResponse<Attendance[]>> {
    const response = await this.attendanceApi.get(`/attendance/session/${sessionId}`);
    return response.data;
  }

  async getAttendanceStats(courseId?: string): Promise<ApiResponse<any>> {
    const url = courseId ? `/attendance/stats?courseId=${courseId}` : '/attendance/stats';
    const response = await this.attendanceApi.get(url);
    return response.data;
  }

  async updateAttendance(attendanceId: string, data: {
    status?: string;
    selfieUrl?: string;
  }): Promise<ApiResponse<Attendance>> {
    const response = await this.attendanceApi.put(`/attendance/${attendanceId}`, data);
    return response.data;
  }

  async deleteAttendance(attendanceId: string): Promise<ApiResponse<void>> {
    const response = await this.attendanceApi.delete(`/attendance/${attendanceId}`);
    return response.data;
  }

  async bulkMarkAttendance(sessionId: string, attendanceData: Array<{
    userId: string;
    status: string;
    notes?: string;
  }>): Promise<ApiResponse<any>> {
    const response = await this.attendanceApi.post('/attendance/bulk', {
      sessionId,
      attendanceData
    });
    return response.data;
  }

  // ========== SESSION MANAGEMENT METHODS ==========
  async extendSessionForManualAttendance(sessionId: string): Promise<ApiResponse<Session>> {
    const response = await this.attendanceApi.post(`/sessions/${sessionId}/extend`);
    return response.data;
  }
}

export default new ApiService();
