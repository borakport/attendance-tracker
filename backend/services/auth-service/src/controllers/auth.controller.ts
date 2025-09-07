/**
 * Authentication Controller
 * 
 * This controller handles all authentication-related HTTP requests by delegating
 * business logic to the AuthService layer. The controller focuses on:
 * - HTTP request/response handling
 * - Request validation and parsing
 * - Response formatting and status codes
 * - Error handling middleware integration
 * 
 * Business logic is handled by AuthService for better separation of concerns.
 * Each method follows the Express.js pattern: (req, res, next) => Promise<void>
 */

import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';
import logger from '../config/logger';

/**
 * AuthController class containing static methods for handling authentication
 * Static methods are used as they don't require class instantiation
 */
export class AuthController {
  
  /**
   * User Registration Endpoint
   * POST /api/v1/auth/signup
   * 
   * Handles user registration by delegating business logic to AuthService.
   * Focuses on HTTP request/response handling and error management.
   * 
   * @param req - Express request object containing user registration data
   * @param res - Express response object for sending response
   * @param next - Express next function for error handling
   */
  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract user registration data from request body
      const signupData = req.body;

      // Delegate business logic to AuthService
      const result = await AuthService.signup(signupData);

      // Log successful registration for monitoring
      logger.info(`New user registered: ${result.user.email}`);

      // Send success response with formatted data
      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          user: result.user,
        },
      });
    } catch (error) {
      // Pass any errors to error handling middleware
      next(error);
    }
  }

  /**
   * User Login Endpoint
   * POST /api/v1/auth/signin
   * 
   * Handles user authentication by delegating business logic to AuthService.
   * Focuses on HTTP request/response handling and token management.
   * 
   * @param req - Express request object containing login credentials
   * @param res - Express response object for sending tokens
   * @param next - Express next function for error handling
   */
  static async signin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract login credentials from request body
      const signinData = req.body;

      // Delegate authentication business logic to AuthService
      const result = await AuthService.signin(signinData);

      // Log successful login for security monitoring
      logger.info(`User signed in: ${result.user.email}`);

      // Send success response with user data and tokens
      res.status(200).json({
        success: true,
        message: 'Sign in successful',
        data: {
          user: result.user,
          tokens: {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          },
        },
      });
    } catch (error) {
      // Pass any errors to error handling middleware
      next(error);
    }
  }

  /**
   * Token Refresh Endpoint
   * POST /api/v1/auth/refresh-token
   * 
   * Handles token refresh by delegating business logic to AuthService.
   * Focuses on HTTP request/response handling for token renewal.
   * 
   * @param req - Express request object containing refresh token
   * @param res - Express response object for sending new tokens
   * @param next - Express next function for error handling
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract refresh token from request body
      const { refreshToken } = req.body;

      // Delegate token refresh business logic to AuthService
      const result = await AuthService.refreshToken(refreshToken);

      // Send new tokens to client
      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        },
      });
    } catch (error) {
      // Pass any errors to error handling middleware
      next(error);
    }
  }

  /**
   * Refresh Access Token Only Endpoint
   * POST /api/v1/auth/refresh-access-token
   * 
   * Handles access token refresh only by delegating business logic to AuthService.
   * Keeps the same refresh token valid, only generates new access token.
   * 
   * @param req - Express request object containing refresh token
   * @param res - Express response object for new access token
   * @param next - Express next function for error handling
   */
  static async refreshAccessToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract refresh token from request body
      const { refreshToken } = req.body;

      // Delegate access token refresh business logic to AuthService
      const result = await AuthService.refreshAccessToken(refreshToken);

      // Send new access token to client
      res.status(200).json({
        success: true,
        message: 'Access token refreshed successfully',
        data: {
          accessToken: result.accessToken,
        },
      });
    } catch (error) {
      // Pass any errors to error handling middleware
      next(error);
    }
  }

  /**
   * User Logout Endpoint
   * POST /api/v1/auth/logout
   * 
   * Handles user logout by delegating token invalidation to AuthService.
   * Focuses on HTTP token extraction and response formatting.
   * 
   * @param req - Authenticated request object with user info
   * @param res - Express response object for confirmation
   * @param next - Express next function for error handling
   */
  static async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract access token from Authorization header
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.substring(7); // Remove "Bearer " prefix

      // Delegate logout business logic to AuthService
      if (req.user && accessToken) {
        await AuthService.logout(req.user.userId, accessToken);
      }

      // Log logout event for security monitoring
      logger.info(`User logged out: ${req.user?.email}`);

      // Send confirmation response
      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      // Pass any errors to error handling middleware
      next(error);
    }
  }

  /**
   * Email Verification Endpoint
   * POST /api/v1/auth/verify-email
   * 
   * Handles email verification by delegating business logic to AuthService.
   * Focuses on HTTP request/response handling for verification process.
   * 
   * @param req - Express request object containing verification token
   * @param res - Express response object for confirmation
   * @param next - Express next function for error handling
   */
  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract verification token from request body
      const { token } = req.body;

      // Delegate email verification business logic to AuthService
      const result = await AuthService.verifyEmail(token);

      // Send success response
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      // Pass any errors to error handling middleware
      next(error);
    }
  }

  /**
   * Forgot Password Endpoint
   * POST /api/v1/auth/forgot-password
   * 
   * Handles password reset requests by delegating business logic to AuthService.
   * Focuses on HTTP request/response handling for password reset process.
   * 
   * @param req - Express request object containing email address
   * @param res - Express response object for confirmation
   * @param next - Express next function for error handling
   */
  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract email address from request body
      const { email } = req.body;

      // Delegate password reset business logic to AuthService
      const result = await AuthService.forgotPassword(email);

      // Always return same success message to prevent email enumeration attacks
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      // Pass any errors to error handling middleware
      next(error);
    }
  }

  /**
   * Reset Password Endpoint
   * POST /api/v1/auth/reset-password
   * 
   * Handles password reset completion by delegating business logic to AuthService.
   * Focuses on HTTP request/response handling for password reset process.
   * 
   * @param req - Express request object containing reset token and new password
   * @param res - Express response object for confirmation
   * @param next - Express next function for error handling
   */
  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract reset token and new password from request
      const { token, password } = req.body;

      // Delegate password reset business logic to AuthService
      const result = await AuthService.resetPassword(token, password);

      // Send success confirmation
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      // Pass any errors to error handling middleware
      next(error);
    }
  }

  /**
   * Change Password Endpoint
   * PUT /api/v1/auth/change-password
   * 
   * Handles password change for authenticated users by delegating business logic to AuthService.
   * Focuses on HTTP request/response handling for password change process.
   * 
   * @param req - Authenticated request object with current/new passwords
   * @param res - Express response object for confirmation
   * @param next - Express next function for error handling
   */
  static async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Extract passwords from request body and user ID from auth middleware
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.userId;

      // Delegate password change business logic to AuthService
      const result = await AuthService.changePassword(userId, {
        currentPassword,
        newPassword,
      });

      // Send success response
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      // Pass any errors to error handling middleware
      next(error);
    }
  }

  /**
   * Get User Profile Endpoint
   * GET /api/v1/auth/profile
   * 
   * Handles user profile retrieval by delegating business logic to AuthService.
   * Focuses on HTTP request/response handling for profile data.
   * 
   * @param req - Authenticated request object with user info
   * @param res - Express response object for profile data
   * @param next - Express next function for error handling
   */
  static async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authentication middleware
      const userId = req.user!.userId;

      // Delegate profile retrieval business logic to AuthService
      const user = await AuthService.getProfile(userId);

      // Return user profile data
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      // Pass any errors to error handling middleware
      next(error);
    }
  }

  /**
   * Update User Profile Endpoint
   * PUT /api/v1/auth/profile
   * 
   * Handles user profile updates by delegating business logic to AuthService.
   * Focuses on HTTP request/response handling for profile updates.
   * 
   * @param req - Authenticated request object with update data
   * @param res - Express response object for updated profile
   * @param next - Express next function for error handling
   */
  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authentication middleware
      const userId = req.user!.userId;
      
      // Extract updateable fields from request body
      const { firstName, lastName, phoneNumber } = req.body;

      // Delegate profile update business logic to AuthService
      const user = await AuthService.updateProfile(userId, {
        firstName,
        lastName,
        phoneNumber,
      });

      // Return updated profile data
      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      // Pass any errors to error handling middleware
      next(error);
    }
  }

  /**
   * Verify User Password Endpoint
   * POST /api/v1/auth/verify-password
   * 
   * Handles password verification for security-sensitive operations by delegating
   * business logic to AuthService. Used for confirming user identity before
   * performing critical actions like deleting courses or leaving courses.
   * 
   * @param req - Authenticated request object with password
   * @param res - Express response object for verification result
   * @param next - Express next function for error handling
   */
  static async verifyPassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get user ID from authentication middleware
      const userId = req.user!.userId;
      
      // Extract password from request body
      const { password } = req.body;

      // Delegate password verification business logic to AuthService
      const result = await AuthService.verifyPassword(userId, password);

      // Return verification result
      res.status(200).json({
        success: true,
        message: 'Password verified successfully',
        data: {
          verified: result.verified,
        },
      });
    } catch (error) {
      // Pass any errors to error handling middleware
      next(error);
    }
  }
}
