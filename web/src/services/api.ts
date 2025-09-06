import { API_CONFIG, APP_CONFIG } from '@/constants';
import { ApiResponse, PaginatedResponse, LoginCredentials, User } from '@/types';

class ApiService {
  private baseURL: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
  }

  private getHeaders(includeAuth: boolean = true): HeadersInit {
    const headers: Record<string, string> = { ...this.defaultHeaders as Record<string, string> };
    
    if (includeAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        // Handle unauthorized - redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
          localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
          window.location.href = '/login';
        }
      }
      
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      return await this.handleResponse<T>(response);
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  async post<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async put<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async patch<T>(
    endpoint: string,
    data?: any,
    includeAuth: boolean = true
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  async delete<T>(endpoint: string, includeAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }

  // Authentication methods
  async login(credentials: LoginCredentials): Promise<ApiResponse<User>> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, credentials, false);
  }

  async logout(): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
  }

  async refreshToken(): Promise<ApiResponse<{ token: string }>> {
    return this.post(API_CONFIG.ENDPOINTS.AUTH.REFRESH);
  }

  async verifyToken(): Promise<ApiResponse<User>> {
    return this.get(API_CONFIG.ENDPOINTS.AUTH.VERIFY);
  }

  // User methods
  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
  }): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role) searchParams.append('role', params.role);

    const query = searchParams.toString();
    return this.get(`${API_CONFIG.ENDPOINTS.USERS.LIST}${query ? `?${query}` : ''}`);
  }

  async getUserProfile(): Promise<ApiResponse<User>> {
    return this.get(API_CONFIG.ENDPOINTS.USERS.PROFILE);
  }

  async updateUserProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.put(API_CONFIG.ENDPOINTS.USERS.PROFILE, data);
  }

  async createUser(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    phoneNumber?: string;
  }): Promise<ApiResponse<User>> {
    return this.post(API_CONFIG.ENDPOINTS.USERS.CREATE, userData);
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.put(API_CONFIG.ENDPOINTS.USERS.UPDATE.replace(':id', userId), userData);
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.USERS.DELETE.replace(':id', userId));
  }

  // Course methods
  async getCourses(params?: {
    page?: number;
    limit?: number;
    search?: string;
    instructorId?: string;
  }): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.search) searchParams.append('search', params.search);
    if (params?.instructorId) searchParams.append('instructorId', params.instructorId);

    const query = searchParams.toString();
    return this.get(`${API_CONFIG.ENDPOINTS.COURSES.LIST}${query ? `?${query}` : ''}`);
  }

  async createCourse(data: any): Promise<ApiResponse<any>> {
    return this.post(API_CONFIG.ENDPOINTS.COURSES.CREATE, data);
  }

  async updateCourse(id: string, data: any): Promise<ApiResponse<any>> {
    return this.put(API_CONFIG.ENDPOINTS.COURSES.UPDATE.replace(':id', id), data);
  }

  async deleteCourse(id: string): Promise<ApiResponse> {
    return this.delete(API_CONFIG.ENDPOINTS.COURSES.DELETE.replace(':id', id));
  }

  async getCourseMembers(courseId: string): Promise<ApiResponse<User[]>> {
    return this.get(`/courses/${courseId}/members`);
  }

  async addCourseMembers(courseId: string, userIds: string[]): Promise<ApiResponse> {
    return this.post(`/courses/${courseId}/members`, { userIds });
  }

  // Session Management  
  async getSessions(params?: { 
    courseId?: string; 
    page?: number; 
    limit?: number;
    isActive?: boolean;
  }): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params?.courseId) searchParams.append('courseId', params.courseId);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.isActive !== undefined) searchParams.append('isActive', params.isActive.toString());
    
    return this.get(`/sessions${searchParams.toString() ? `?${searchParams}` : ''}`);
  }

  async createSession(sessionData: {
    courseId: string;
    name: string;
    description?: string;
    startTime: string;
    endTime: string;
    latitude: number;
    longitude: number;
    radiusMeters?: number;
    locationName?: string;
  }): Promise<ApiResponse<any>> {
    return this.post('/sessions', sessionData);
  }

  async updateSession(sessionId: string, sessionData: Partial<any>): Promise<ApiResponse<any>> {
    return this.put(`/sessions/${sessionId}`, sessionData);
  }

  async deleteSession(sessionId: string): Promise<ApiResponse> {
    return this.delete(`/sessions/${sessionId}`);
  }

  // Attendance methods
  async getAttendance(params?: {
    page?: number;
    limit?: number;
    courseId?: string;
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.courseId) searchParams.append('courseId', params.courseId);
    if (params?.studentId) searchParams.append('studentId', params.studentId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);

    const query = searchParams.toString();
    return this.get(`${API_CONFIG.ENDPOINTS.ATTENDANCE.LIST}${query ? `?${query}` : ''}`);
  }

  async markAttendance(data: {
    courseId: string;
    studentIds: string[];
    status: string;
    notes?: string;
  }): Promise<ApiResponse> {
    return this.post(API_CONFIG.ENDPOINTS.ATTENDANCE.MARK, data);
  }

  async getAttendanceReports(params: {
    courseId?: string;
    startDate: string;
    endDate: string;
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params.courseId) searchParams.append('courseId', params.courseId);
    searchParams.append('startDate', params.startDate);
    searchParams.append('endDate', params.endDate);

    return this.get(`${API_CONFIG.ENDPOINTS.ATTENDANCE.REPORTS}?${searchParams.toString()}`);
  }

  async updateAttendance(attendanceId: string, data: {
    status?: string;
    notes?: string;
    verifiedBy?: string;
  }): Promise<ApiResponse<any>> {
    return this.put(`/attendances/${attendanceId}`, data);
  }

  // Reports and Analytics
  async getAttendanceStats(params?: {
    courseId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params?.courseId) searchParams.append('courseId', params.courseId);
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.startDate) searchParams.append('startDate', params.startDate);
    if (params?.endDate) searchParams.append('endDate', params.endDate);
    
    return this.get(`/reports/attendance-stats${searchParams.toString() ? `?${searchParams}` : ''}`);
  }

  async generateReport(reportType: string, params: any): Promise<ApiResponse<any>> {
    return this.post('/reports/generate', { reportType, params });
  }

  // System Logs
  async getSystemLogs(params?: {
    userId?: string;
    action?: string;
    entity?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params?.userId) searchParams.append('userId', params.userId);
    if (params?.action) searchParams.append('action', params.action);
    if (params?.entity) searchParams.append('entity', params.entity);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    return this.get(`/system-logs${searchParams.toString() ? `?${searchParams}` : ''}`);
  }

  // File upload method
  async uploadFile(file: File, endpoint: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<ApiResponse<{ url: string }>>(
      endpoint,
      {
        method: 'POST',
        body: formData,
        headers: {
          // Don't set Content-Type for FormData - let browser set it
          Authorization: `Bearer ${this.getAuthToken()}`,
        },
      },
      false
    );
  }
}

// Export singleton instance
export const apiService = new ApiService();

// Export class for testing or custom instances
export { ApiService };
