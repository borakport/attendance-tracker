/**
 * Error Handling Middleware
 * 
 * This module provides centralized error handling for the authentication service:
 * - Custom AppError class for operational errors
 * - Global error handler for all unhandled errors
 * - 404 handler for undefined routes
 * - Proper logging and user-friendly error responses
 */

import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

/**
 * Custom Application Error Class
 * 
 * Extends the native Error class to include HTTP status codes and operational flags.
 * Used throughout the application for throwing specific, user-friendly errors.
 * 
 * @param statusCode - HTTP status code (400, 401, 404, etc.)
 * @param message - User-friendly error message
 * @param isOperational - Flag indicating if error is operational (expected) vs programming error
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    // Maintain proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Global Error Handler Middleware
 * 
 * Catches all errors thrown in the application and formats them consistently.
 * Differentiates between operational errors (AppError) and unexpected errors.
 * Logs all errors for monitoring and debugging purposes.
 * 
 * @param err - Error object (either AppError or generic Error)
 * @param req - Express request object for context
 * @param res - Express response object for sending error response
 * @param _next - Express next function (unused but required for error middleware)
 */
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle operational errors (AppError instances)
  if (err instanceof AppError) {
    // Log operational error with context
    logger.error(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
    });
    
    // Send user-friendly error response
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? {
        stack: err.stack,
        statusCode: err.statusCode,
      } : undefined,
    });
    return;
  }

  // Handle unexpected/programming errors
  logger.error('Unexpected error occurred:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  // Send generic error response (don't expose internal error details)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && {
      error: {
        message: err.message,
        stack: err.stack,
      },
    }),
  });
};

/**
 * 404 Not Found Handler
 * 
 * Handles requests to undefined routes/endpoints.
 * Should be the last middleware in the chain before error handler.
 * 
 * @param req - Express request object
 * @param res - Express response object
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  // Log 404 attempts for monitoring
  logger.warn(`Route not found: ${req.method} ${req.path}`, {
    userAgent: req.get('User-Agent'),
    ip: req.ip,
  });

  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString(),
  });
};
