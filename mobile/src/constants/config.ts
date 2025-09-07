export const Config = {
  API: {
    AUTH_URL: process.env.API_BASE_URL || 'http://10.0.2.2:3001',
    ATTENDANCE_URL: process.env.ATTENDANCE_API_URL || 'http://10.0.2.2:3002',
    REALTIME_URL: process.env.REALTIME_API_URL || 'http://10.0.2.2:3003',
    TIMEOUT: 30000,
  },
  
  APP: {
    NAME: 'GPS Attendance',
    VERSION: '1.0.0',
    DEBUG: process.env.DEBUG_MODE === 'true',
    SHOW_TEST_ACCOUNTS: process.env.DEBUG_MODE === 'true' || __DEV__,
  },
  
  GPS: {
    HIGH_ACCURACY: true,
    TIMEOUT: 20000,
    MAXIMUM_AGE: 1000,
    DISTANCE_FILTER: 10, // meters
    DEFAULT_RADIUS: 50, // meters
    MAX_RADIUS: 500, // meters
  },
  
  STORAGE_KEYS: {
    AUTH_TOKEN: '@gps_attendance:auth_token',
    REFRESH_TOKEN: '@gps_attendance:refresh_token',
    USER_DATA: '@gps_attendance:user_data',
    COURSE_DATA: '@gps_attendance:course_data',
    BIOMETRIC_ENABLED: '@gps_attendance:biometric',
    THEME_MODE: '@gps_attendance:theme',
  },
  
  FEATURES: {
    BIOMETRIC_AUTH: process.env.EXPO_PUBLIC_ENABLE_BIOMETRICS === 'true',
    BACKGROUND_LOCATION: process.env.EXPO_PUBLIC_ENABLE_BACKGROUND_LOCATION === 'true',
    CAMERA_SELFIE: process.env.EXPO_PUBLIC_ENABLE_CAMERA_SELFIE === 'true',
    NOTIFICATIONS: process.env.EXPO_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
  },
};
