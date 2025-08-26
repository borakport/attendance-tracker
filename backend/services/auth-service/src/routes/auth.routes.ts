import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authValidator } from '../validators/auth.validator';

const router = Router();

// Public routes
router.post('/signup', validate(authValidator.signup), AuthController.signup);
router.post('/signin', validate(authValidator.signin), AuthController.signin);
router.post('/refresh-token', validate(authValidator.refreshToken), AuthController.refreshToken);
router.post('/verify-email', validate(authValidator.verifyEmail), AuthController.verifyEmail);
router.post('/forgot-password', validate(authValidator.forgotPassword), AuthController.forgotPassword);
router.post('/reset-password', validate(authValidator.resetPassword), AuthController.resetPassword);

// Protected routes
router.post('/logout', authenticate, AuthController.logout);
router.post('/change-password', authenticate, validate(authValidator.changePassword), AuthController.changePassword);
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, validate(authValidator.updateProfile), AuthController.updateProfile);

export default router;
