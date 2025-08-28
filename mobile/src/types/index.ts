// User types
export enum UserRole {
  STUDENT = 'STUDENT',
  INSTRUCTOR = 'INSTRUCTOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

// Course types
export enum CourseRole {
  OWNER = 'OWNER',
  MODERATOR = 'MODERATOR',
  PARTICIPANT = 'PARTICIPANT',
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  code: string;
  ownerId: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  settings: CourseSettings;
  createdAt: string;
  updatedAt: string;
}

export interface CourseSettings {
  gpsRadius: number;
  allowLateEntry: boolean;
  lateEntryMinutes: number;
  requireSelfie: boolean;
  autoEndSession: boolean;
  autoEndMinutes: number;
}

// Session types
export interface Session {
  id: string;
  courseId: string;
  name: string;
  description?: string;
  startTime: string;
  endTime: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  locationName?: string;
  isActive: boolean;
  allowLateEntry: boolean;
  lateMinutes: number;
  requireSelfie: boolean;
  startedAt?: string;
  endedAt?: string;
}

// Attendance types
export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  LATE = 'LATE',
  ABSENT = 'ABSENT',
  EXCUSED = 'EXCUSED',
}

export interface Attendance {
  id: string;
  sessionId: string;
  userId: string;
  markedAt: string;
  status: AttendanceStatus;
  latitude: number;
  longitude: number;
  distanceFromSession: number;
  selfieUrl?: string;
  deviceInfo?: any;
}

// Location types
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

// API types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
