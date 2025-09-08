/**
 * Authentication Routes
 * 
 * This module defines all HTTP routes for the authentication service.
 * Routes are organized into public (no authentication required) and protected
 * (authentication required) endpoints with appropriate validation middleware.
 * 
 * Route Categories:
 * - Public: signup, signin, password reset, email verification
 * - Protected: profile management, password change, logout
 * 
 * Security Features:
 * - Input validation using Joi schemas
 * - JWT token authentication for protected routes
 * - Comprehensive error handling
 */

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authValidator } from '../validators/auth.validator';

// Create Express router instance for authentication routes
const router = Router();

// =====================================
// PUBLIC ROUTES - No authentication required
// =====================================

// User Registration
// POST /api/auth/signup
// Creates new user account with email verification
router.post('/signup', validate(authValidator.signup), AuthController.signup);

// User Sign In
// POST /api/auth/signin  
// Authenticates user and returns JWT tokens
router.post('/signin', validate(authValidator.signin), AuthController.signin);

// Refresh Access Token
// POST /api/auth/refresh-token
// Generates new access token using valid refresh token
router.post('/refresh-token', validate(authValidator.refreshToken), AuthController.refreshToken);

// Refresh Access Token Only
// POST /api/auth/refresh-access-token
// Generates new access token only, keeping same refresh token
router.post('/refresh-access-token', validate(authValidator.refreshToken), AuthController.refreshAccessToken);

// Email Verification
// POST /api/auth/verify-email
// Verifies user email address using verification token
router.post('/verify-email', validate(authValidator.verifyEmail), AuthController.verifyEmail);

// Email Verification Link (GET)
// GET /api/auth/verify-email?token=xxx
// Handles email verification link clicks and redirects to web UI
router.get('/verify-email', AuthController.verifyEmailLink);

// Phone Verification
// POST /api/auth/verify-phone
// Verifies user phone number using verification code
router.post('/verify-phone', validate(authValidator.verifyPhone), AuthController.verifyPhone);

// Resend Phone Verification
// POST /api/auth/resend-phone-verification
// Resends phone verification code to user
router.post('/resend-phone-verification', validate(authValidator.resendPhoneVerification), AuthController.resendPhoneVerification);

// Forgot Password
// POST /api/auth/forgot-password
// Initiates password reset process by sending reset email
router.post('/forgot-password', validate(authValidator.forgotPassword), AuthController.forgotPassword);

// Reset Password
// POST /api/auth/reset-password
// Completes password reset using reset token
router.post('/reset-password', validate(authValidator.resetPassword), AuthController.resetPassword);

// =====================================
// PROTECTED ROUTES - Authentication required
// =====================================

// User Logout
// POST /api/auth/logout
// Invalidates current session and blacklists tokens
router.post('/logout', authenticate, AuthController.logout);

// Change Password
// POST /api/auth/change-password
// Changes user password (requires current password)
router.post('/change-password', authenticate, validate(authValidator.changePassword), AuthController.changePassword);

// Get User Profile
// GET /api/auth/profile
// Retrieves current user's profile information
router.get('/profile', authenticate, AuthController.getProfile);

// Update User Profile
// PUT /api/auth/profile
// Updates user profile information (excluding password)
router.put('/profile', authenticate, validate(authValidator.updateProfile), AuthController.updateProfile);
// Verify User Password (for critical actions)
router.post('/verify-password', authenticate, AuthController.verifyPassword);

export default router;
