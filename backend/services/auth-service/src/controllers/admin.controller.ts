/**
 * Admin Controller for Authentication Service
 * 
 * Handles admin-specific operations including:
 * - User management (CRUD operations)
 * - System statistics
 * - User role management
 * - Bulk operations
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { ApiResponse } from '../types';
import { PasswordUtils } from '../utils/password.utils';

const prisma = new PrismaClient();

// Helper function to create API responses with timestamp
const createResponse = <T = any>(success: boolean, message: string, data?: T): ApiResponse<T> => ({
  success,
  message,
  timestamp: new Date().toISOString(),
  ...(data && { data })
});

export class AdminController {
  /**
   * Get all users with pagination and filtering
   * GET /api/auth/admin/users
   */
  static async getAllUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        role,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where condition
      const where: any = {};
      
      if (role && role !== 'all') {
        where.role = role;
      }

      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phoneNumber: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get users and total count
      const [users, totalUsers] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy as string]: sortOrder },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            role: true,
            emailVerified: true,
            accountLocked: true,
            lastLogin: true,
            createdAt: true,
            updatedAt: true
          }
        }),
        prisma.user.count({ where })
      ]);

      const totalPages = Math.ceil(totalUsers / take);

      const response = createResponse(true, 'Users retrieved successfully', {
        users,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalUsers,
          hasNext: Number(page) < totalPages,
          hasPrev: Number(page) > 1
        }
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user statistics for dashboard
   * GET /api/auth/admin/stats
   */
  static async getUserStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        activeUsers,
        verifiedUsers,
        recentUsers
      ] = await Promise.all([
        // Total users
        prisma.user.count(),
        
        // Students
        prisma.user.count({ where: { role: 'STUDENT' } }),
        
        // Instructors
        prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
        
        // Admins
        prisma.user.count({ where: { role: 'ADMIN' } }),
        
        // Active users (logged in within last 30 days)
        prisma.user.count({
          where: {
            lastLogin: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Verified users
        prisma.user.count({ where: { emailVerified: true } }),
        
        // Recent users (last 7 days)
        prisma.user.findMany({
          where: {
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            createdAt: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        })
      ]);

      const response = createResponse(true, 'User statistics retrieved successfully', {
        totalUsers,
        totalStudents,
        totalInstructors,
        totalAdmins,
        activeUsers,
        verifiedUsers,
        recentUsers,
        userGrowth: {
          thisWeek: recentUsers.length,
          lastWeek: 0, // We can calculate this if needed
          growthRate: 0
        }
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new user (admin only)
   * POST /api/auth/admin/users
   */
  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { firstName, lastName, email, password, phoneNumber, role = 'STUDENT' } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        const response = createResponse(false, 'User with this email already exists');
        res.status(400).json(response);
        return;
      }

      // Hash password
      const hashedPassword = await PasswordUtils.hash(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          phoneNumber,
          role,
          emailVerified: true, // Admin created users are auto-verified
          accountLocked: false
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          role: true,
          emailVerified: true,
          accountLocked: true,
          createdAt: true
        }
      });

      const response = createResponse(true, 'User created successfully', user);
      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user details (admin only)
   * PUT /api/auth/admin/users/:id
   */
  static async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { firstName, lastName, email, phoneNumber, role, emailVerified, accountLocked } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        const response = createResponse(false, 'User not found');
        res.status(404).json(response);
        return;
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          email,
          phoneNumber,
          role,
          emailVerified,
          accountLocked
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          role: true,
          emailVerified: true,
          accountLocked: true,
          createdAt: true,
          updatedAt: true
        }
      });

      const response = createResponse(true, 'User updated successfully', updatedUser);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete user (admin only)
   * DELETE /api/auth/admin/users/:id
   */
  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id }
      });

      if (!existingUser) {
        const response = createResponse(false, 'User not found');
        res.status(404).json(response);
        return;
      }

      // Don't allow deletion of the last admin
      if (existingUser.role === 'ADMIN') {
        const adminCount = await prisma.user.count({
          where: { role: 'ADMIN' }
        });

        if (adminCount <= 1) {
          const response = createResponse(false, 'Cannot delete the last admin user');
          res.status(400).json(response);
          return;
        }
      }

      // Delete user
      await prisma.user.delete({
        where: { id }
      });

      const response = createResponse(true, 'User deleted successfully');
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user by ID (admin only)
   * GET /api/auth/admin/users/:id
   */
  static async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phoneNumber: true,
          role: true,
          emailVerified: true,
          accountLocked: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!user) {
        const response = createResponse(false, 'User not found');
        res.status(404).json(response);
        return;
      }

      const response = createResponse(true, 'User retrieved successfully', user);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Bulk update users (admin only)
   * PATCH /api/auth/admin/users/bulk
   */
  static async bulkUpdateUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userIds, updates } = req.body;

      if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
        const response = createResponse(false, 'User IDs are required');
        res.status(400).json(response);
        return;
      }

      // Update users
      const result = await prisma.user.updateMany({
        where: {
          id: { in: userIds }
        },
        data: updates
      });

      const response = createResponse(true, `${result.count} users updated successfully`, { 
        updatedCount: result.count 
      });
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
