import { User, Course, AttendanceRecord } from '@/types';
import { APP_CONFIG } from '@/constants';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const AUTH_SERVICE_URL = `${API_BASE_URL}/api/v1/auth`;
const ATTENDANCE_SERVICE_URL = `${API_BASE_URL}/api/v1`;

// API Response Types
interface APIResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface LoginRequest {
  email: string;
  password: string;
}

interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'instructor' | 'admin';
  studentId?: string;
  employeeId?: string;
}

// API Client Class
export class APIClient {
  private baseURL: string;
  private timeout: number;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.timeout = 10000;
  }

  // Helper method to get auth token
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
  }

  // Helper method for unauthenticated API requests
  private async requestNoAuth<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid response format: ${response.statusText}`);
      }

      const data = await response.json() as APIResponse<T>;

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Helper method to handle API requests
  private async request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Invalid response format: ${response.statusText}`);
      }

      const data = await response.json() as APIResponse<T>;

      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || data.message || 'Request failed');
      }

      return data.data as T;
    } catch (error) {
      if (error instanceof Error) {
        // Handle specific error cases
        if (error.message.includes('401')) {
          // Token expired, redirect to login
          if (typeof window !== 'undefined') {
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
            localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
            window.location.href = '/login';
          }
        }
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Authentication API methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.requestNoAuth<AuthResponse>(`${AUTH_SERVICE_URL}/signin`, {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    // Store tokens
    if (typeof window !== 'undefined') {
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.TOKEN, response.tokens.accessToken);
      localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.user));
    }
    
    return response;
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.requestNoAuth<AuthResponse>(`${AUTH_SERVICE_URL}/signup`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    try {
      await this.request<void>(`${AUTH_SERVICE_URL}/logout`, {
        method: 'POST',
      });
    } finally {
      // Always clear local storage, even if API call fails
      if (typeof window !== 'undefined') {
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER);
        localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.TOKEN);
      }
    }
  }

  async refreshToken(): Promise<{ accessToken: string }> {
    const refreshToken = localStorage.getItem('refreshToken'); // Store refresh token separately
    return this.request<{ accessToken: string }>(`${AUTH_SERVICE_URL}/refresh-access-token`, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getProfile(): Promise<User> {
    return this.request<User>(`${AUTH_SERVICE_URL}/profile`);
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>(`${AUTH_SERVICE_URL}/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
    return this.request<void>(`${AUTH_SERVICE_URL}/change-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyPassword(data: { password: string }): Promise<{ valid: boolean }> {
    return this.request<{ valid: boolean }>(`${AUTH_SERVICE_URL}/verify-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: { email: string }): Promise<void> {
    return this.requestNoAuth<void>(`${AUTH_SERVICE_URL}/forgot-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: { token: string; newPassword: string }): Promise<void> {
    return this.requestNoAuth<void>(`${AUTH_SERVICE_URL}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async verifyEmail(data: { token: string }): Promise<void> {
    return this.requestNoAuth<void>(`${AUTH_SERVICE_URL}/verify-email`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Course API methods (Extended)
  async getMyCourses(): Promise<Course[]> {
    return this.request<Course[]>(`${ATTENDANCE_SERVICE_URL}/courses/my`);
  }

  async getCourses(filters?: { search?: string; instructorId?: string }): Promise<Course[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.instructorId) params.append('instructorId', filters.instructorId);
    
    const queryString = params.toString();
    const url = `${ATTENDANCE_SERVICE_URL}/courses${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Course[]>(url);
  }

  async getCourseById(id: string): Promise<Course> {
    return this.request<Course>(`${ATTENDANCE_SERVICE_URL}/courses/${id}`);
  }

  async getCourseByCode(code: string): Promise<Course> {
    return this.request<Course>(`${ATTENDANCE_SERVICE_URL}/courses/code/${code}`);
  }

  async createCourse(data: {
    name: string;
    description?: string;
    code?: string;
    location?: string;
    schedule?: string;
    allowLateSubmissions?: boolean;
    maxLateMinutes?: number;
    requireGPS?: boolean;
    gpsRadius?: number;
    requireSelfie?: boolean;
  }): Promise<Course> {
    return this.request<Course>(`${ATTENDANCE_SERVICE_URL}/courses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCourse(id: string, data: Partial<Course>): Promise<Course> {
    return this.request<Course>(`${ATTENDANCE_SERVICE_URL}/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async editCourse(id: string, data: {
    name?: string;
    description?: string;
    location?: string;
    schedule?: string;
  }): Promise<Course> {
    return this.request<Course>(`${ATTENDANCE_SERVICE_URL}/courses/${id}/edit`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateCourseSettings(id: string, data: {
    allowLateSubmissions?: boolean;
    maxLateMinutes?: number;
    requireGPS?: boolean;
    gpsRadius?: number;
    requireSelfie?: boolean;
  }): Promise<Course> {
    return this.request<Course>(`${ATTENDANCE_SERVICE_URL}/courses/${id}/settings`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteCourse(id: string): Promise<void> {
    return this.request<void>(`${ATTENDANCE_SERVICE_URL}/courses/${id}`, {
      method: 'DELETE',
    });
  }

  async enrollCourse(data: { courseCode: string }): Promise<void> {
    return this.request<void>(`${ATTENDANCE_SERVICE_URL}/courses/enroll`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async leaveCourse(id: string): Promise<void> {
    return this.request<void>(`${ATTENDANCE_SERVICE_URL}/courses/${id}/leave`, {
      method: 'POST',
    });
  }

  async getCourseMembers(courseId: string): Promise<User[]> {
    return this.request<User[]>(`${ATTENDANCE_SERVICE_URL}/courses/${courseId}/members`);
  }

  async removeStudentFromCourse(courseId: string, studentId: string): Promise<void> {
    return this.request<void>(`${ATTENDANCE_SERVICE_URL}/courses/${courseId}/members/${studentId}`, {
      method: 'DELETE',
    });
  }

  // Session API methods (Extended)
  async getSessions(filters?: { courseId?: string }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    
    const queryString = params.toString();
    const url = `${ATTENDANCE_SERVICE_URL}/sessions${queryString ? `?${queryString}` : ''}`;
    
    return this.request<any[]>(url);
  }

  async getActiveSessions(): Promise<any[]> {
    return this.request<any[]>(`${ATTENDANCE_SERVICE_URL}/sessions/active`);
  }

  async getSessionById(id: string): Promise<any> {
    return this.request<any>(`${ATTENDANCE_SERVICE_URL}/sessions/${id}`);
  }

  async getSessionsByQRCode(qrCode: string): Promise<any> {
    return this.request<any>(`${ATTENDANCE_SERVICE_URL}/sessions/qr/${qrCode}`);
  }

  async getSessionsByCourse(courseId: string): Promise<any[]> {
    return this.request<any[]>(`${ATTENDANCE_SERVICE_URL}/sessions/course/${courseId}`);
  }

  async getActiveSessionsByCourse(courseId: string): Promise<any[]> {
    return this.request<any[]>(`${ATTENDANCE_SERVICE_URL}/sessions/course/${courseId}/active`);
  }

  async createSession(data: {
    courseId: string;
    name?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
    scheduledStartTime?: string;
    duration?: number;
    requireGPS?: boolean;
    requireSelfie?: boolean;
  }): Promise<any> {
    return this.request(`${ATTENDANCE_SERVICE_URL}/sessions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSession(id: string, data: any): Promise<any> {
    return this.request<any>(`${ATTENDANCE_SERVICE_URL}/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSession(id: string): Promise<void> {
    return this.request<void>(`${ATTENDANCE_SERVICE_URL}/sessions/${id}`, {
      method: 'DELETE',
    });
  }

  async startSession(id: string): Promise<void> {
    return this.request<void>(`${ATTENDANCE_SERVICE_URL}/sessions/${id}/start`, {
      method: 'POST',
    });
  }

  async endSession(sessionId: string): Promise<void> {
    return this.request<void>(`${ATTENDANCE_SERVICE_URL}/sessions/${sessionId}/end`, {
      method: 'POST',
    });
  }

  async extendSessionForManualAttendance(sessionId: string): Promise<void> {
    return this.request<void>(`${ATTENDANCE_SERVICE_URL}/sessions/${sessionId}/extend`, {
      method: 'POST',
    });
  }

  // Attendance API methods (Extended)
  async markAttendance(data: {
    sessionId: string;
    qrCode?: string;
    latitude?: number;
    longitude?: number;
    selfieUrl?: string;
    manualEntry?: boolean;
  }): Promise<AttendanceRecord> {
    return this.request<AttendanceRecord>(`${ATTENDANCE_SERVICE_URL}/attendance/mark`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addManualAttendance(data: {
    sessionId: string;
    studentId: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    note?: string;
  }): Promise<AttendanceRecord> {
    return this.request<AttendanceRecord>(`${ATTENDANCE_SERVICE_URL}/attendance/manual`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async bulkMarkAttendance(data: {
    sessionId: string;
    attendanceRecords: Array<{
      studentId: string;
      status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
      note?: string;
    }>;
  }): Promise<AttendanceRecord[]> {
    return this.request<AttendanceRecord[]>(`${ATTENDANCE_SERVICE_URL}/attendance/bulk`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyAttendance(filters?: {
    courseId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = `${ATTENDANCE_SERVICE_URL}/attendance/my${queryString ? `?${queryString}` : ''}`;
    
    return this.request<AttendanceRecord[]>(url);
  }

  async getMyAttendanceStats(courseId?: string): Promise<{
    totalSessions: number;
    attendedSessions: number;
    lateCount: number;
    absentCount: number;
    attendanceRate: number;
    recentSessions: AttendanceRecord[];
  }> {
    const params = courseId ? `?courseId=${courseId}` : '';
    return this.request(`${ATTENDANCE_SERVICE_URL}/attendance/my/stats${params}`);
  }

  async getSessionAttendance(sessionId: string): Promise<AttendanceRecord[]> {
    return this.request<AttendanceRecord[]>(`${ATTENDANCE_SERVICE_URL}/attendance/session/${sessionId}`);
  }

  async getSessionAttendanceSummary(sessionId: string): Promise<{
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
    attendanceRecords: AttendanceRecord[];
  }> {
    return this.request(`${ATTENDANCE_SERVICE_URL}/attendance/session/${sessionId}/summary`);
  }

  async updateAttendance(attendanceId: string, data: {
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    note?: string;
    markedAt?: string;
  }): Promise<AttendanceRecord> {
    return this.request<AttendanceRecord>(`${ATTENDANCE_SERVICE_URL}/attendance/${attendanceId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAttendance(attendanceId: string): Promise<void> {
    return this.request<void>(`${ATTENDANCE_SERVICE_URL}/attendance/${attendanceId}`, {
      method: 'DELETE',
    });
  }

  async getAttendanceHistory(filters?: {
    courseId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = `${ATTENDANCE_SERVICE_URL}/attendance${queryString ? `?${queryString}` : ''}`;
    
    return this.request<AttendanceRecord[]>(url);
  }

  async getAttendanceStats(courseId?: string): Promise<{
    totalSessions: number;
    attendedSessions: number;
    attendanceRate: number;
    recentSessions: AttendanceRecord[];
  }> {
    const params = courseId ? `?courseId=${courseId}` : '';
    return this.request(`${ATTENDANCE_SERVICE_URL}/attendance/stats${params}`);
  }

  // Dashboard/Statistics API methods
  async getDashboardStats(): Promise<{
    totalUsers: number;
    totalCourses: number;
    totalStudents: number;
    totalInstructors: number;
    recentActivities: Array<{
      id: string;
      action: string;
      user: string;
      time: string;
      type: 'user' | 'course' | 'attendance' | 'system';
    }>;
  }> {
    // This would be implemented in a stats service
    return this.request(`${ATTENDANCE_SERVICE_URL}/stats/dashboard`);
  }

  // Admin API methods - Auth Service
  async getAdminUsers(filters?: { role?: string; search?: string }): Promise<User[]> {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString();
    const url = `${AUTH_SERVICE_URL}/admin/users${queryString ? `?${queryString}` : ''}`;
    
    return this.request<User[]>(url);
  }

  async getAdminUserStats(): Promise<{
    totalUsers: number;
    totalStudents: number;
    totalInstructors: number;
    totalAdmins: number;
    recentlyRegistered: User[];
  }> {
    return this.request(`${AUTH_SERVICE_URL}/admin/users/stats`);
  }

  async createAdminUser(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
    studentId?: string;
    phoneNumber?: string;
  }): Promise<User> {
    return this.request<User>(`${AUTH_SERVICE_URL}/admin/users`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAdminUser(userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
    studentId?: string;
    phoneNumber?: string;
    isActive?: boolean;
  }): Promise<User> {
    return this.request<User>(`${AUTH_SERVICE_URL}/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAdminUser(userId: string): Promise<void> {
    return this.request<void>(`${AUTH_SERVICE_URL}/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Admin API methods - Attendance Service
  async getAdminDashboardStats(): Promise<{
    totalCourses: number;
    totalSessions: number;
    totalAttendanceRecords: number;
    averageAttendanceRate: number;
    recentActivities: Array<{
      id: string;
      action: string;
      user: string;
      time: string;
      type: 'course' | 'session' | 'attendance';
    }>;
  }> {
    return this.request(`${ATTENDANCE_SERVICE_URL}/admin/dashboard/stats`);
  }

  async getAdminCourses(filters?: { search?: string; instructorId?: string }): Promise<Course[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.instructorId) params.append('instructorId', filters.instructorId);
    
    const queryString = params.toString();
    const url = `${ATTENDANCE_SERVICE_URL}/admin/courses${queryString ? `?${queryString}` : ''}`;
    
    return this.request<Course[]>(url);
  }

  async getAdminSessions(filters?: { courseId?: string; status?: string }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.status) params.append('status', filters.status);
    
    const queryString = params.toString();
    const url = `${ATTENDANCE_SERVICE_URL}/admin/sessions${queryString ? `?${queryString}` : ''}`;
    
    return this.request<any[]>(url);
  }

  async getAdminAttendanceRecords(filters?: { 
    courseId?: string; 
    sessionId?: string; 
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceRecord[]> {
    const params = new URLSearchParams();
    if (filters?.courseId) params.append('courseId', filters.courseId);
    if (filters?.sessionId) params.append('sessionId', filters.sessionId);
    if (filters?.studentId) params.append('studentId', filters.studentId);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = `${ATTENDANCE_SERVICE_URL}/admin/attendance${queryString ? `?${queryString}` : ''}`;
    
    return this.request<AttendanceRecord[]>(url);
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export helper functions for common operations
export const authAPI = {
  login: (credentials: LoginRequest) => apiClient.login(credentials),
  signup: (data: SignupRequest) => apiClient.signup(data),
  logout: () => apiClient.logout(),
  getProfile: () => apiClient.getProfile(),
  updateProfile: (data: Partial<User>) => apiClient.updateProfile(data),
  changePassword: (data: { currentPassword: string; newPassword: string }) => 
    apiClient.changePassword(data),
  verifyPassword: (data: { password: string }) => apiClient.verifyPassword(data),
  forgotPassword: (data: { email: string }) => apiClient.forgotPassword(data),
  resetPassword: (data: { token: string; newPassword: string }) => apiClient.resetPassword(data),
  verifyEmail: (data: { token: string }) => apiClient.verifyEmail(data),
  refreshToken: () => apiClient.refreshToken(),
};

export const courseAPI = {
  getAll: (filters?: { search?: string; instructorId?: string }) => apiClient.getCourses(filters),
  getMy: () => apiClient.getMyCourses(),
  getById: (id: string) => apiClient.getCourseById(id),
  getByCode: (code: string) => apiClient.getCourseByCode(code),
  create: (data: { 
    name: string; 
    description?: string;
    code?: string;
    location?: string;
    schedule?: string;
    allowLateSubmissions?: boolean;
    maxLateMinutes?: number;
    requireGPS?: boolean;
    gpsRadius?: number;
    requireSelfie?: boolean;
  }) => apiClient.createCourse(data),
  update: (id: string, data: Partial<Course>) => apiClient.updateCourse(id, data),
  edit: (id: string, data: { name?: string; description?: string; location?: string; schedule?: string }) => 
    apiClient.editCourse(id, data),
  updateSettings: (id: string, data: any) => apiClient.updateCourseSettings(id, data),
  delete: (id: string) => apiClient.deleteCourse(id),
  enroll: (data: { courseCode: string }) => apiClient.enrollCourse(data),
  leave: (id: string) => apiClient.leaveCourse(id),
  getMembers: (courseId: string) => apiClient.getCourseMembers(courseId),
  removeStudent: (courseId: string, studentId: string) => 
    apiClient.removeStudentFromCourse(courseId, studentId),
};

export const attendanceAPI = {
  mark: (data: { 
    sessionId: string; 
    qrCode?: string;
    latitude?: number; 
    longitude?: number; 
    selfieUrl?: string;
    manualEntry?: boolean;
  }) => apiClient.markAttendance(data),
  addManual: (data: any) => apiClient.addManualAttendance(data),
  bulkMark: (data: any) => apiClient.bulkMarkAttendance(data),
  getMy: (filters?: { courseId?: string; startDate?: string; endDate?: string }) => 
    apiClient.getMyAttendance(filters),
  getMyStats: (courseId?: string) => apiClient.getMyAttendanceStats(courseId),
  getSessionAttendance: (sessionId: string) => apiClient.getSessionAttendance(sessionId),
  getSessionSummary: (sessionId: string) => apiClient.getSessionAttendanceSummary(sessionId),
  update: (attendanceId: string, data: any) => apiClient.updateAttendance(attendanceId, data),
  delete: (attendanceId: string) => apiClient.deleteAttendance(attendanceId),
  getHistory: (filters?: { courseId?: string; startDate?: string; endDate?: string }) => 
    apiClient.getAttendanceHistory(filters),
  getStats: (courseId?: string) => apiClient.getAttendanceStats(courseId),
};

export const sessionAPI = {
  getAll: (filters?: { courseId?: string }) => apiClient.getSessions(filters),
  getActive: () => apiClient.getActiveSessions(),
  getById: (id: string) => apiClient.getSessionById(id),
  getByQR: (qrCode: string) => apiClient.getSessionsByQRCode(qrCode),
  getByCourse: (courseId: string) => apiClient.getSessionsByCourse(courseId),
  getActiveByCourse: (courseId: string) => apiClient.getActiveSessionsByCourse(courseId),
  create: (data: { 
    courseId: string;
    name?: string;
    location?: string; 
    latitude?: number; 
    longitude?: number; 
    radius?: number;
    scheduledStartTime?: string;
    duration?: number;
    requireGPS?: boolean;
    requireSelfie?: boolean;
  }) => apiClient.createSession(data),
  update: (id: string, data: any) => apiClient.updateSession(id, data),
  delete: (id: string) => apiClient.deleteSession(id),
  start: (id: string) => apiClient.startSession(id),
  end: (sessionId: string) => apiClient.endSession(sessionId),
  extend: (sessionId: string) => apiClient.extendSessionForManualAttendance(sessionId),
};

export const adminAPI = {
  // User management (Auth Service)
  getUsers: (filters?: { role?: string; search?: string }) => apiClient.getAdminUsers(filters),
  getUserStats: () => apiClient.getAdminUserStats(),
  createUser: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
    studentId?: string;
    phoneNumber?: string;
  }) => apiClient.createAdminUser(data),
  updateUser: (userId: string, data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
    studentId?: string;
    phoneNumber?: string;
    isActive?: boolean;
  }) => apiClient.updateAdminUser(userId, data),
  deleteUser: (userId: string) => apiClient.deleteAdminUser(userId),
  
  // Dashboard and statistics (Attendance Service)
  getDashboardStats: () => apiClient.getAdminDashboardStats(),
  getCourses: (filters?: { search?: string; instructorId?: string }) => apiClient.getAdminCourses(filters),
  getSessions: (filters?: { courseId?: string; status?: string }) => apiClient.getAdminSessions(filters),
  getAttendanceRecords: (filters?: { 
    courseId?: string; 
    sessionId?: string; 
    studentId?: string;
    startDate?: string;
    endDate?: string;
  }) => apiClient.getAdminAttendanceRecords(filters),
};
