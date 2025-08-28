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
      }

      if (error.response?.status === 401) {
        // Token expired, try to refresh
        await this.refreshToken();
      }

      return Promise.reject(error);
    };

    // Apply interceptors to both instances
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

  private async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem(Config.STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) throw new Error('No refresh token');

      const response = await this.authApi.post(Config.ROUTES.AUTH.REFRESH, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;
      
      await AsyncStorage.setItem(Config.STORAGE_KEYS.AUTH_TOKEN, accessToken);
      await AsyncStorage.setItem(Config.STORAGE_KEYS.REFRESH_TOKEN, newRefreshToken);
      
      return accessToken;
    } catch (error) {
      // Refresh failed, logout user
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

  // Auth methods
  async signIn(email: string, password: string): Promise<ApiResponse> {
    const response = await this.authApi.post(Config.ROUTES.AUTH.SIGNIN, {
      email,
      password,
    });
    return response.data;
  }

  async signUp(data: any): Promise<ApiResponse> {
    const response = await this.authApi.post(Config.ROUTES.AUTH.SIGNUP, data);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse> {
    const response = await this.authApi.get(Config.ROUTES.AUTH.PROFILE);
    return response.data;
  }

  // Course methods
  async getCourses(): Promise<ApiResponse> {
    const response = await this.attendanceApi.get(Config.ROUTES.ATTENDANCE.COURSES);
    return response.data;
  }

  async getCourse(id: string): Promise<ApiResponse> {
    const response = await this.attendanceApi.get(`${Config.ROUTES.ATTENDANCE.COURSES}/${id}`);
    return response.data;
  }

  async joinCourse(code: string): Promise<ApiResponse> {
    const response = await this.attendanceApi.post(
      `${Config.ROUTES.ATTENDANCE.COURSES}/join`,
      { code }
    );
    return response.data;
  }

  // Session methods
  async getActiveSessions(): Promise<ApiResponse> {
    const response = await this.attendanceApi.get(
      `${Config.ROUTES.ATTENDANCE.SESSIONS}/active`
    );
    return response.data;
  }

  async getSession(id: string): Promise<ApiResponse> {
    const response = await this.attendanceApi.get(
      `${Config.ROUTES.ATTENDANCE.SESSIONS}/${id}`
    );
    return response.data;
  }

  // Attendance methods
  async markAttendance(data: {
    sessionId: string;
    latitude: number;
    longitude: number;
    deviceInfo?: any;
  }): Promise<ApiResponse> {
    const response = await this.attendanceApi.post(
      `${Config.ROUTES.ATTENDANCE.ATTENDANCE}/mark`,
      data
    );
    return response.data;
  }

  async getMyAttendance(): Promise<ApiResponse> {
    const response = await this.attendanceApi.get(
      `${Config.ROUTES.ATTENDANCE.ATTENDANCE}/user`
    );
    return response.data;
  }
}

export default new ApiService();
