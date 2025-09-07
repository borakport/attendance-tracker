/**
 * Attendance Service Types
 * 
 * Type definitions for attendance-related operations including attendance marking,
 * session management, course enrollment, and GPS verification.
 */

import { AttendanceStatus } from '@prisma/client';

// Base response interface for all API responses
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

// GPS coordinate interface for location-based operations
export interface GPSCoordinates {
  latitude: number;
  longitude: number;
}

// Attendance marking request data
export interface MarkAttendanceData {
  sessionId: string;
  latitude: number;
  longitude: number;
  selfieUrl?: string;
}

// Session creation data
export interface CreateSessionData {
  courseId: string;
  instructorId: string;
  name: string;
  description?: string;
  startTime: Date | string;
  endTime: Date | string;
  startInMinutes?: number; // Minutes from now to start the session
  latitude: number;
  longitude: number;
  radiusMeters?: number;
  locationName?: string;
  requireSelfie?: boolean;
  allowLateEntry?: boolean;
  lateMinutes?: number;
  notes?: string;
}

// Session update data
export interface UpdateSessionData {
  name?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  locationName?: string;
  requireSelfie?: boolean;
  allowLateEntry?: boolean;
  lateMinutes?: number;
  isActive?: boolean;
  notes?: string;
}

// Course creation data
export interface CreateCourseData {
  name: string;
  description?: string;
  instructorId: string;
  inviteCode?: string;
}

// Course update data
export interface UpdateCourseData {
  name?: string;
  description?: string;
  inviteCode?: string;
  endDate?: string; // ISO date string
  settings?: {
    gpsRadius?: number;
    allowLateEntry?: boolean;
    lateEntryMinutes?: number;
    requireSelfie?: boolean;
    autoEndSession?: boolean;
    autoEndMinutes?: number;
  };
}

// Course enrollment data
export interface EnrollCourseData {
  inviteCode: string;
}

// Attendance statistics interface
export interface AttendanceStats {
  totalSessions: number;
  attendedSessions: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
  attendancePercentage: number;
}

// Session with attendance count
export interface SessionWithStats {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  totalAttendees: number;
  presentCount: number;
  lateCount: number;
  absentCount: number;
}

// User attendance record
export interface UserAttendanceRecord {
  id: string;
  sessionId: string;
  userId: string;
  status: AttendanceStatus;
  markedAt: Date;
  latitude: number;
  longitude: number;
  distanceFromSession: number;
  selfieUrl?: string;
  session: {
    title: string;
    startTime: Date;
    course: {
      name: string;
    };
  };
}

// GPS verification result
export interface GPSVerificationResult {
  isValid: boolean;
  distance: number;
  message: string;
}

// Attendance filter options
export interface AttendanceFilters {
  courseId?: string;
  userId?: string;
  status?: AttendanceStatus;
  startDate?: Date;
  endDate?: Date;
  sessionId?: string;
}

// Pagination options
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Paginated response
export interface PaginatedResponse<T> {
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

// Real-time notification data
export interface AttendanceNotification {
  type: 'ATTENDANCE_MARKED' | 'SESSION_STARTED' | 'SESSION_ENDED';
  sessionId: string;
  courseId: string;
  userId?: string;
  userName?: string;
  courseName: string;
  sessionTitle: string;
  status?: AttendanceStatus;
  timestamp: Date;
}

// Session filter options
export interface SessionFilters {
  courseId?: string;
  instructorId?: string;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}

// Session with course and relations
export interface SessionWithCourse {
  id: string;
  courseId: string;
  createdById: string;
  name: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  locationName?: string;
  isActive: boolean;
  allowLateEntry: boolean;
  lateMinutes: number;
  requireSelfie: boolean;
  qrCode?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  course: {
    id: string;
    name: string;
    code: string;
    ownerId: string;
  };
  createdBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  attendances: {
    id: string;
    userId: string;
    status: AttendanceStatus;
    markedAt: Date;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }[];
}
