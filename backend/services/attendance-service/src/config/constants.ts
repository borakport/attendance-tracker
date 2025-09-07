export const constants = {
  // Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.ATTENDANCE_SERVICE_PORT || process.env.PORT || '3002', 10),
  
  API_PREFIX: '/api/v1',
  
  // GPS Settings
  DEFAULT_GPS_RADIUS: 50, // meters
  MAX_GPS_RADIUS: 500, // meters
  MIN_GPS_RADIUS: 10, // meters
  
  // Session Settings
  DEFAULT_LATE_MINUTES: 15,
  MAX_SESSION_DURATION: 8 * 60, // 8 hours in minutes
  MIN_SESSION_DURATION: 15, // 15 minutes
  
  // Course Settings
  MAX_COURSE_NAME_LENGTH: 100,
  MAX_COURSE_CODE_LENGTH: 20,
  COURSE_CODE_PREFIX_LENGTH: 6,
  
  // Attendance Settings
  ATTENDANCE_MARK_COOLDOWN: 60, // seconds between marks
  
  // Rate Limiting
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // CORS
  CORS_ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
  CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS || 'http://localhost:3000,http://localhost:3001,http://localhost:8081',
};
