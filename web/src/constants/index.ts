// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  TIMEOUT: 10000,
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      VERIFY: '/auth/verify'
    },
    USERS: {
      LIST: '/users',
      PROFILE: '/users/profile',
      CREATE: '/users',
      UPDATE: '/users/:id',
      DELETE: '/users/:id'
    },
    COURSES: {
      LIST: '/courses',
      CREATE: '/courses',
      UPDATE: '/courses/:id',
      DELETE: '/courses/:id'
    },
    ATTENDANCE: {
      LIST: '/attendance',
      MARK: '/attendance/mark',
      REPORTS: '/attendance/reports'
    }
  }
};

// Application Constants
export const APP_CONFIG = {
  NAME: 'Smart Attendance',
  VERSION: '1.0.0',
  DESCRIPTION: 'Modern attendance tracking system',
  STORAGE_KEYS: {
    USER: 'smart_attendance_user',
    TOKEN: 'smart_attendance_token',
    THEME: 'smart_attendance_theme'
  }
};

// UI Constants
export const UI_CONFIG = {
  SIDEBAR_WIDTH: 256, // w-64 in Tailwind
  MOBILE_BREAKPOINT: 1024, // lg breakpoint
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500
};

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: {
    PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MESSAGE: 'Please enter a valid email address'
  },
  PASSWORD: {
    MIN_LENGTH: 6,
    MESSAGE: 'Password must be at least 6 characters long'
  },
  REQUIRED_FIELD: 'This field is required'
};

// User Roles and Permissions
export const ROLES = {
  ADMIN: 'admin',
  INSTRUCTOR: 'instructor',
  STUDENT: 'student'
} as const;

export const PERMISSIONS = {
  READ: 'read',
  WRITE: 'write',
  DELETE: 'delete',
  MANAGE_USERS: 'manage_users',
  MANAGE_COURSES: 'manage_courses',
  VIEW_REPORTS: 'view_reports',
  VIEW_STUDENTS: 'view_students'
} as const;

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.READ,
    PERMISSIONS.WRITE,
    PERMISSIONS.DELETE,
    PERMISSIONS.MANAGE_USERS,
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.VIEW_REPORTS
  ],
  [ROLES.INSTRUCTOR]: [
    PERMISSIONS.READ,
    PERMISSIONS.WRITE,
    PERMISSIONS.MANAGE_COURSES,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_REPORTS
  ],
  [ROLES.STUDENT]: [
    PERMISSIONS.READ
  ]
};

// Demo Data (for development)
export const DEMO_USERS = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@smartattendance.com',
    password: 'admin123',
    role: ROLES.ADMIN,
    permissions: ROLE_PERMISSIONS[ROLES.ADMIN]
  },
  {
    id: 'instructor1',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@smartattendance.com',
    password: 'instructor123',
    role: ROLES.INSTRUCTOR,
    permissions: ROLE_PERMISSIONS[ROLES.INSTRUCTOR]
  },
  {
    id: 'instructor2',
    name: 'Prof. Michael Brown',
    email: 'michael.brown@smartattendance.com',
    password: 'instructor123',
    role: ROLES.INSTRUCTOR,
    permissions: ROLE_PERMISSIONS[ROLES.INSTRUCTOR]
  },
  {
    id: 'student1',
    name: 'John Smith',
    email: 'john.smith@smartattendance.com',
    password: 'student123',
    role: ROLES.STUDENT,
    permissions: ROLE_PERMISSIONS[ROLES.STUDENT]
  },
  {
    id: 'student2',
    name: 'Emily Davis',
    email: 'emily.davis@smartattendance.com',
    password: 'student123',
    role: ROLES.STUDENT,
    permissions: ROLE_PERMISSIONS[ROLES.STUDENT]
  }
];

// Route Configurations
export const ROUTES = {
  LOGIN: '/login',
  ADMIN_DASHBOARD: '/dashboard',
  INSTRUCTOR_DASHBOARD: '/instructor-dashboard',
  STUDENT_DASHBOARD: '/student-dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  DEMO: '/demo'
};

// Status Constants
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
} as const;

export const CLASS_STATUS = {
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

// Color Schemes
export const COLORS = {
  ADMIN: {
    PRIMARY: 'blue',
    LIGHT: 'blue-50',
    DARK: 'blue-600'
  },
  INSTRUCTOR: {
    PRIMARY: 'green',
    LIGHT: 'green-50',
    DARK: 'green-600'
  },
  STUDENT: {
    PRIMARY: 'purple',
    LIGHT: 'purple-50',
    DARK: 'purple-600'
  }
};

export type Role = typeof ROLES[keyof typeof ROLES];
export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];
export type AttendanceStatus = typeof ATTENDANCE_STATUS[keyof typeof ATTENDANCE_STATUS];
export type ClassStatus = typeof CLASS_STATUS[keyof typeof CLASS_STATUS];
