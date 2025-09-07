/**
 * Authorization Middleware
 * 
 * Middleware to check user roles and permissions.
 * Used to restrict access to admin-only routes.
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

// Use the global Express interface extension from auth.middleware.ts

/**
 * Creates authorization middleware for specific roles
 * @param allowedRoles Array of roles that are allowed to access the route
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Check if user exists (should be set by authenticate middleware)
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        };
        res.status(401).json(response);
        return;
      }

      // Check if user role is allowed
      if (!allowedRoles.includes(req.user.role)) {
        const response: ApiResponse = {
          success: false,
          message: 'Insufficient permissions. Admin access required.',
          timestamp: new Date().toISOString()
        };
        res.status(403).json(response);
        return;
      }

      // User is authorized, continue to next middleware
      next();
    } catch {
      const response: ApiResponse = {
        success: false,
        message: 'Authorization failed',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };
};

/**
 * Middleware specifically for admin-only routes
 */
export const requireAdmin = authorize(['ADMIN']);

/**
 * Middleware for instructor and admin access
 */
export const requireInstructorOrAdmin = authorize(['INSTRUCTOR', 'ADMIN']);

/**
 * Middleware to check if user owns the resource or is admin
 * @param resourceUserIdParam The parameter name that contains the user ID of the resource owner
 */
export const requireOwnershipOrAdmin = (resourceUserIdParam: string = 'userId') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        const response: ApiResponse = {
          success: false,
          message: 'Authentication required',
          timestamp: new Date().toISOString()
        };
        res.status(401).json(response);
        return;
      }

      const resourceUserId = req.params[resourceUserIdParam] || req.body[resourceUserIdParam];
      
      // Allow if user is admin or owns the resource
      if (req.user.role === 'ADMIN' || req.user.userId === resourceUserId) {
        next();
        return;
      }

      const response: ApiResponse = {
        success: false,
        message: 'Access denied. You can only access your own resources.',
        timestamp: new Date().toISOString()
      };
      res.status(403).json(response);
    } catch {
      const response: ApiResponse = {
        success: false,
        message: 'Authorization failed',
        timestamp: new Date().toISOString()
      };
      res.status(500).json(response);
    }
  };
};
