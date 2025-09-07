import { User, UserRole } from '@prisma/client';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  jti?: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenData {
  userId: string;
  tokenId: string;
  createdAt: string;
}

// User Types
export interface UserProfile extends Omit<User, 'password'> {}

export interface UserRegistrationData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface UserLoginData {
  email: string;
  password: string;
}

export interface UserUpdateData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetData {
  token: string;
  password: string;
  confirmPassword: string;
}

// Email Types
export interface EmailVerificationData {
  token: string;
}

export interface ForgotPasswordData {
  email: string;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  errors?: ValidationError[];
}

// Request Types (for middleware)
export interface AuthenticatedRequest {
  user: {
    userId: string;
    email: string;
    role: UserRole;
  };
}

// Pagination Types
export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  email?: string;
  role?: UserRole;
  emailVerified?: boolean;
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
}

// Utility Types
export type CreateUserPayload = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'lastLogin' | 'loginAttempts' | 'accountLocked'>;
export type UpdateUserPayload = Partial<Pick<User, 'firstName' | 'lastName' | 'phoneNumber'>>;
export type UserRoleFilter = UserRole | 'ALL';

// Event Types (for future use with event emitters)
export interface UserEvent {
  type: 'USER_CREATED' | 'USER_UPDATED' | 'USER_DELETED' | 'EMAIL_VERIFIED' | 'PASSWORD_CHANGED';
  userId: string;
  data?: any;
  timestamp: Date;
}

// Cache Types
export interface CacheConfig {
  ttl: number; // Time to live in seconds
  key: string;
}

// Rate Limiting Types
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  message: string;
  skipOnSuccess?: boolean;
}

// Session Types (for future session management)
export interface UserSession {
  sessionId: string;
  userId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  expiresAt: Date;
  isActive: boolean;
}

// Constants for type safety
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  INSTRUCTOR: 'INSTRUCTOR',
  STUDENT: 'STUDENT',
} as const;

export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    SIGNIN: '/auth/signin',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh-token',
    VERIFY_EMAIL: '/auth/verify-email',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
    PROFILE: '/auth/profile',
  },
} as const;

// Export commonly used Prisma types
export { User, UserRole } from '@prisma/client';
