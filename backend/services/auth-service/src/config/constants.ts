export const constants = {
  JWT_ACCESS_EXPIRES_IN: '15m',
  JWT_REFRESH_EXPIRES_IN: '7d',
  JWT_EMAIL_VERIFY_EXPIRES_IN: '1d',
  JWT_PASSWORD_RESET_EXPIRES_IN: '1h',
  
  BCRYPT_ROUNDS: 10,
  
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  EMAIL_FROM: 'noreply@attendance-tracker.com',
  
  REDIS_TOKEN_PREFIX: 'refresh_token:',
  REDIS_BLACKLIST_PREFIX: 'blacklist:',
  REDIS_EMAIL_VERIFY_PREFIX: 'email_verify:',
  REDIS_PASSWORD_RESET_PREFIX: 'password_reset:',
  
  MAX_LOGIN_ATTEMPTS: 5,
  LOCK_TIME: 30 * 60 * 1000, // 30 minutes
  
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  
  CORS_ORIGIN: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  API_PREFIX: '/api/v1',
  
  // Email templates
  EMAIL_TEMPLATES: {
    VERIFY_EMAIL: 'verify-email',
    RESET_PASSWORD: 'reset-password',
    WELCOME: 'welcome',
  },
};
