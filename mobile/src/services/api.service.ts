import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import { ApiResponse, Course, Session, Attendance, User, AuthTokens } from '@/types';
import Toast from 'react-native-toast-message';
import { NavigationContainerRef } from '@react-navigation/native';

// Add navigation reference for token expiry handling
let navigationRef: NavigationContainerRef<any> | null = null;

export const setNavigationRef = (ref: NavigationContainerRef<any>) => {
  navigationRef = ref;
};

class ApiService {
  private authApi: AxiosInstance;
  private attendanceApi: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    // Auth Service API
    this.authApi = axios.create({
      baseURL: Config.API.AUTH_URL,
      timeout: Config.API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Attendance Service API
    this.attendanceApi = axios.create({
      baseURL: Config.API.ATTENDANCE_URL,
      timeout: Config.API.TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    const requestInterceptor = async (config: InternalAxiosRequestConfig) => {
      const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      if (Config.APP.DEBUG) {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
      }
      
      return config;
    };

    // Response error interceptor
    const responseErrorInterceptor = async (error: AxiosError) => {
      const originalRequest: any = error.config;

      if (Config.APP.DEBUG) {
        console.error('❌ API Error:', error.response?.data || error.message);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (this.isRefreshing) {
          return new Promise((resolve) => {
            this.refreshSubscribers.push((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axios(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        this.isRefreshing = true;

        try {
          const refreshResponse = await this.refreshAuthToken();
          if (refreshResponse.data) {
            const newToken = refreshResponse.data.accessToken;
            this.onRefreshSuccess(newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axios(originalRequest);
          } else {
            throw new Error('Failed to refresh token');
          }
        } catch (refreshError) {
          this.onRefreshFailed();
          await this.clearAuth();
          
          // Navigate to login and show token expired message
          Toast.show({
            type: 'error',
            text1: 'Session Expired',
            text2: 'Token expired, please login again',
          });
          
          if (navigationRef && navigationRef.isReady()) {
            navigationRef.reset({
              index: 0,
              routes: [{ name: 'Auth' }],
            });
          }
          
          throw refreshError;
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
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private onRefreshFailed() {
    this.refreshSubscribers = [];
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
    if (!refreshToken) throw new Error('No refresh token');

    const response = await this.authApi.post('/auth/refresh-token', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data;
    
    await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, accessToken);
    await AsyncStorage.setItem(Config.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
    
    return accessToken;
  }

  // Public method for refreshing tokens
  async refreshAuthToken(): Promise<ApiResponse<AuthTokens>> {
    try {
      const refreshTokenValue = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshTokenValue) {
        throw new Error('No refresh token');
      }

      const response = await this.authApi.post('/auth/refresh-token', {
        refreshToken: refreshTokenValue,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, accessToken);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      
      return {
        success: true,
        message: 'Token refreshed successfully',
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

  private async clearAuth() {
    await AsyncStorage.multiRemove([
      Config.STORAGE_KEYS.AUTH_TOKEN,
      Config.STORAGE_KEYS.REFRESH_TOKEN,
      Config.STORAGE_KEYS.USER_DATA,
    ]);
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

  async deleteCourse(id: string): Promise<ApiResponse> {
    const response = await this.attendanceApi.delete(`/courses/${id}`);
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

  async leaveCourse(id: string): Promise<ApiResponse> {
    const response = await this.attendanceApi.post(`/courses/${id}/leave`);
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
}

export default new ApiService();
