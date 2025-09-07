import { Router } from 'express';
import authRoutes from './auth.routes';
import adminRoutes from './admin.routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Auth service is healthy',
    timestamp: new Date().toISOString(),
    service: 'auth-service',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
});

// API status endpoint with more details
router.get('/status', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'auth-service',
    status: 'running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    features: {
      jwtAuth: true,
      emailVerification: true,
      passwordReset: true,
      rateLimiting: true,
      redis: true,
    },
  });
});

// Mount route modules
router.use('/auth', authRoutes);
router.use('/auth/admin', adminRoutes);

// Catch-all for undefined routes within this service
router.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found in auth service`,
    timestamp: new Date().toISOString(),
  });
});

export default router;
