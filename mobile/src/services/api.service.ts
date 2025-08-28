import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import { ApiResponse, Course, Session, Attendance, User } from '@/types';
import Toast from 'react-native-toast-message';

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
          const newToken = await this.refreshToken();
          this.onRefreshSuccess(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          this.onRefreshFailed();
          await this.clearAuth();
          // Navigate to login screen
          Toast.show({
            type: 'error',
            text1: 'Session Expired',
            text2: 'Please login again',
          });
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

    const response = await this.authApi.post('/auth/refresh', {
      refreshToken,
    });

    const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
    
    await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, accessToken);
    await AsyncStorage.setItem(Config.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
    
    return accessToken;
  }

  private async clearAuth() {
    await AsyncStorage.multiRemove([
      Config.STORAGE_KEYS.AUTH_TOKEN,
      Config.STORAGE_KEYS.REFRESH_TOKEN,
      Config.STORAGE_KEYS.USER_DATA,
    ]);
  }

  // Auth methods
  async signIn(email: string, password: string): Promise<ApiResponse> {
    const response = await this.authApi.post('/auth/signin', {
      email,
      password,
    });
    return response.data;
  }

  async signUp(data: any): Promise<ApiResponse> {
    const response = await this.authApi.post('/auth/signup', data);
    return response.data;
  }

  async signOut(): Promise<void> {
    try {
      const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
      if (token) {
        // Use the correct endpoint path
        try {
          await this.authApi.post('/auth/logout', { refreshToken: token });
        } catch (error: any) {
          // If logout endpoint doesn't exist, just clear local auth
          if (error.response?.status === 404) {
            console.log('Logout endpoint not found, clearing local auth');
          } else {
            console.error('Logout error:', error);
          }
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

  // Course methods
  async getCourses(): Promise<ApiResponse<Course[]>> {
    const response = await this.attendanceApi.get('/courses');
    return response.data;
  }

  async getCourse(id: string): Promise<ApiResponse<Course>> {
    const response = await this.attendanceApi.get(`/courses/${id}`);
    return response.data;
  }

  async createCourse(data: Partial<Course>): Promise<ApiResponse<Course>> {
    const response = await this.attendanceApi.post('/courses', data);
    return response.data;
  }

  async joinCourse(code: string): Promise<ApiResponse<Course>> {
    const response = await this.attendanceApi.post('/courses/join', { code });
    return response.data;
  }

  async leaveCourse(id: string): Promise<ApiResponse> {
    const response = await this.attendanceApi.post(`/courses/${id}/leave`);
    return response.data;
  }

  // Session methods
  async getSessions(courseId?: string): Promise<ApiResponse<Session[]>> {
    const url = courseId ? `/courses/${courseId}/sessions` : '/sessions/active';
    const response = await this.attendanceApi.get(url);
    return response.data;
  }

  async getActiveSessions(): Promise<ApiResponse<Session[]>> {
    const response = await this.attendanceApi.get('/sessions/active');
    return response.data;
  }

  async getSession(id: string): Promise<ApiResponse<Session>> {
    const response = await this.attendanceApi.get(`/sessions/${id}`);
    return response.data;
  }

  async createSession(data: Partial<Session>): Promise<ApiResponse<Session>> {
    const response = await this.attendanceApi.post('/sessions', data);
    return response.data;
  }

  async startSession(id: string, location?: { latitude: number; longitude: number }): Promise<ApiResponse<Session>> {
    const response = await this.attendanceApi.post(`/sessions/${id}/start`, {
      actualLatitude: location?.latitude,
      actualLongitude: location?.longitude,
    });
    return response.data;
  }

  async endSession(id: string): Promise<ApiResponse<Session>> {
    const response = await this.attendanceApi.post(`/sessions/${id}/end`);
    return response.data;
  }

  // Attendance methods
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
