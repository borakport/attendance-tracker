import { Role, Permission, AttendanceStatus, ClassStatus } from '@/constants';

// Re-export types from constants for convenience
export type { Role, Permission, AttendanceStatus, ClassStatus };

// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  permissions: Permission[];
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser extends User {
  token: string;
  refreshToken?: string;
  expiresAt?: string;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Course Types
export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  instructorId: string;
  instructorName: string;
  studentCount: number;
  schedule: ClassSchedule[];
  createdAt: string;
  updatedAt: string;
}

export interface ClassSchedule {
  id: string;
  courseId: string;
  dayOfWeek: number; // 0-6, Sunday to Saturday
  startTime: string; // HH:mm format
  endTime: string;   // HH:mm format
  room: string;
}

// Attendance Types
export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  courseId: string;
  courseName: string;
  classDate: string;
  status: AttendanceStatus;
  markedAt: string;
  markedBy: string;
  notes?: string;
}

export interface AttendanceSession {
  id: string;
  courseId: string;
  courseName: string;
  instructorId: string;
  classDate: string;
  startTime: string;
  endTime: string;
  room: string;
  status: ClassStatus;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  lateStudents: number;
}

export interface AttendanceStats {
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

// Dashboard Types
export interface DashboardStats {
  title: string;
  value: string | number;
  change: string;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
}

export interface ActivityItem {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  type: 'user' | 'course' | 'attendance' | 'system';
}

export interface SystemAlert {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  timestamp: string;
  dismissed?: boolean;
}

// Schedule Types
export interface ScheduleItem {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  startTime: string;
  endTime: string;
  room: string;
  instructor: string;
  status: ClassStatus;
  attendanceId?: string;
  studentCount?: number;
}

export interface TodaySchedule {
  date: string;
  classes: ScheduleItem[];
  totalClasses: number;
  completedClasses: number;
  upcomingClasses: number;
}

// Report Types
export interface AttendanceReport {
  courseId: string;
  courseName: string;
  totalSessions: number;
  averageAttendance: number;
  trends: AttendanceTrend[];
  studentBreakdown: StudentAttendanceBreakdown[];
}

export interface AttendanceTrend {
  date: string;
  percentage: number;
  present: number;
  total: number;
}

export interface StudentAttendanceBreakdown {
  studentId: string;
  studentName: string;
  totalClasses: number;
  attendedClasses: number;
  percentage: number;
  status: AttendanceStats['status'];
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Types
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  validation?: Array<(value: string) => { isValid: boolean; error?: string }>;
}

// Component Props Types
export interface DashboardLayoutProps {
  children: React.ReactNode;
  user: User;
  activeView: string;
  onViewChange: (view: string) => void;
  navigationItems: NavigationItem[];
}

export interface NavigationItem {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  description: string;
  href?: string;
  onClick?: () => void;
}

export interface StatCardProps {
  stat: DashboardStats;
  isLoading?: boolean;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
  onRowClick?: (row: T) => void;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export interface TableColumn<T = any> {
  key: keyof T;
  header: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

// Hook Return Types
export interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export interface UseFormReturn<T = any> {
  formData: T;
  errors: Record<string, string>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (name: string, value: any) => void;
  handleSubmit: (onSubmit: (data: T) => Promise<void>) => (e: React.FormEvent) => Promise<void>;
  setError: (field: string, error: string) => void;
  clearErrors: () => void;
  reset: () => void;
}

// Utility Types
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };
export type XOR<T, U> = (T | U) extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
export type Prettify<T> = { [K in keyof T]: T[K] } & {};
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
