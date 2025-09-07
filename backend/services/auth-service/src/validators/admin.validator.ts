/**
 * Admin Validation Schemas
 * 
 * Joi validation schemas for admin-specific operations
 * including user management and bulk operations.
 */

import Joi from 'joi';

// User creation validation
export const createUser = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'string.empty': 'Email is required'
    }),

  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password cannot exceed 128 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      'string.empty': 'Password is required'
    }),

  phone: Joi.string()
    .pattern(/^\+?[\d\s\-()]{10,20}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),

  role: Joi.string()
    .valid('STUDENT', 'INSTRUCTOR', 'ADMIN')
    .default('STUDENT')
    .messages({
      'any.only': 'Role must be one of: STUDENT, INSTRUCTOR, ADMIN'
    })
});

// User update validation
export const updateUser = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name cannot exceed 100 characters'
    }),

  email: Joi.string()
    .email()
    .lowercase()
    .optional()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),

  phone: Joi.string()
    .pattern(/^\+?[\d\s\-()]{10,20}$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': 'Please provide a valid phone number'
    }),

  role: Joi.string()
    .valid('STUDENT', 'INSTRUCTOR', 'ADMIN')
    .optional()
    .messages({
      'any.only': 'Role must be one of: STUDENT, INSTRUCTOR, ADMIN'
    }),

  isActive: Joi.boolean()
    .optional(),

  isEmailVerified: Joi.boolean()
    .optional()
});

// Bulk update validation
export const bulkUpdateUsers = Joi.object({
  userIds: Joi.array()
    .items(Joi.string().uuid())
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one user ID is required',
      'array.base': 'User IDs must be an array',
      'string.guid': 'Each user ID must be a valid UUID'
    }),

  updates: Joi.object({
    role: Joi.string()
      .valid('STUDENT', 'INSTRUCTOR', 'ADMIN')
      .optional(),

    isActive: Joi.boolean()
      .optional(),

    isEmailVerified: Joi.boolean()
      .optional()
  })
  .min(1)
  .required()
  .messages({
    'object.min': 'At least one update field is required'
  })
});

// Export all validators
export const adminValidator = {
  createUser,
  updateUser,
  bulkUpdateUsers
};
