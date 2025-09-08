/**
 * Authentication Validators
 * 
 * This module defines Joi validation schemas for all authentication-related endpoints.
 * It ensures data integrity, security, and consistency across all user inputs
 * before they reach the business logic layer.
 * 
 * Validation Features:
 * - Email format validation
 * - Password strength requirements
 * - Phone number format validation
 * - Required field validation
 * - Cross-field validation (password confirmation)
 * 
 * Security Features:
 * - Enforces password complexity rules
 * - Validates phone number format
 * - Ensures password confirmation matches
 * - Prevents password reuse in change password
 */

import Joi from 'joi';
import { constants } from '../config/constants';

/**
 * Authentication Validation Schemas
 * 
 * Collection of Joi schemas for validating authentication requests.
 * Each schema corresponds to a specific endpoint and validates all
 * required and optional fields with appropriate rules.
 */
export const authValidator = {
  /**
   * User Registration Validation Schema
   * Validates new user signup requests including password confirmation
   */
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(constants.PASSWORD_MIN_LENGTH)
      .pattern(constants.PASSWORD_REGEX)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
    }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
      'string.pattern.base': 'Please enter a valid phone number',
    }),
  }),

  /**
   * User Sign In Validation Schema
   * Simple validation for login credentials
   */
  signin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  /**
   * Forgot Password Validation Schema
   * Validates email for password reset request
   */
  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  /**
   * Reset Password Validation Schema
   * Validates password reset token and new password with confirmation
   */
  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string()
      .min(constants.PASSWORD_MIN_LENGTH)
      .pattern(constants.PASSWORD_REGEX)
      .required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  }),

  /**
   * Email Verification Validation Schema
   * Validates email verification token
   */
  verifyEmail: Joi.object({
    token: Joi.string().required(),
  }),

  /**
   * Phone Verification Validation Schema
   * Validates phone verification code
   */
  verifyPhone: Joi.object({
    userId: Joi.string().required(),
    code: Joi.string().pattern(/^\d{6}$/).required().messages({
      'string.pattern.base': 'Verification code must be 6 digits',
    }),
  }),

  /**
   * Resend Phone Verification Validation Schema
   * Validates request to resend phone verification code
   */
  resendPhoneVerification: Joi.object({
    userId: Joi.string().required(),
  }),

  /**
   * Refresh Token Validation Schema
   * Validates refresh token for generating new access tokens
   */
  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  /**
   * Change Password Validation Schema
   * Validates password change with current password verification
   * and ensures new password is different from current
   */
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(constants.PASSWORD_MIN_LENGTH)
      .pattern(constants.PASSWORD_REGEX)
      .required()
      .invalid(Joi.ref('currentPassword'))
      .messages({
        'any.invalid': 'New password must be different from current password',
      }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
  }),

  /**
   * Update Profile Validation Schema
   * Validates profile update requests with optional fields
   */
  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  }),
};
