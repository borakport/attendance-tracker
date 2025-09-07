/**
 * Request Validation Middleware
 * 
 * This middleware provides request validation using Joi schemas.
 * It validates request body against provided schema and returns
 * user-friendly error messages for validation failures.
 * 
 * Features:
 * - Comprehensive validation error reporting
 * - Field-specific error messages
 * - Consistent error response format
 * - Support for complex validation rules
 */

import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Validation Middleware Factory
 * 
 * Creates a middleware function that validates request body against a Joi schema.
 * Returns detailed validation errors if validation fails.
 * 
 * @param schema - Joi validation schema to validate against
 * @returns Express middleware function
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Validate request body against provided schema
    // abortEarly: false ensures all validation errors are collected
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true, // Remove unknown properties
      allowUnknown: false, // Reject unknown properties
    });
    
    if (error) {
      // Transform Joi error details into user-friendly format
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'), // e.g., "user.email"
        message: detail.message.replace(/"/g, ''), // Remove quotes from message
        value: detail.context?.value, // The invalid value
      }));
      
      // Send validation error response
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
        timestamp: new Date().toISOString(),
      });
      return;
    }
    
    // Replace request body with validated/sanitized value
    // This ensures only valid data proceeds to the controller
    req.body = value;
    
    // Proceed to next middleware/controller
    next();
  };
};
