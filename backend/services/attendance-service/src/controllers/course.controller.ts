/**
 * Course Controller
 * 
 * This controller handles all course-related HTTP requests by delegating
 * business logic to the CourseService. Focuses on request/response handling,
 * input validation, and HTTP status codes.
 * 
 * Key Features:
 * - Course creation and management
 * - Student enrollment via invite codes
 * - Member management and access control
 * - Course statistics and information
 * 
 * Security Features:
 * - User authentication required for all operations
 * - Role-based access control (instructor vs student)
 * - Input validation and sanitization
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CourseService } from '../services';
import { AuthServiceClient } from '../utils/auth-service-client';

/**
 * Course Controller Class
 * 
 * Provides static methods for handling course-related HTTP requests.
 * All methods require user authentication and delegate business logic
 * to the CourseService.
 */
export class CourseController {

  /**
   * Create a new course
   * 
   * @param req - AuthRequest containing user info and course data
   * @param res - Express Response object
   */
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instructorId = req.user!.userId;
      const { name, description } = req.body;

      // Input validation
      if (!name || name.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: 'Course name is required',
        });
        return;
      }

      // Delegate to service layer
      const result = await CourseService.createCourse(
        { name: name.trim(), description: description?.trim(), instructorId },
        instructorId
      );

      if (!result.success) {
        res.status(400).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          course: result.course,
        },
      });
    } catch (error) {
      console.error('Error creating course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create course',
      });
    }
  }

  /**
   * Get course by ID
   * 
   * @param req - AuthRequest containing course ID
   * @param res - Express Response object
   */
  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Course ID is required',
        });
        return;
      }

      // Check if user has access to this course
      const access = await CourseService.checkCourseAccess(id, userId);
      if (!access.hasAccess) {
        res.status(403).json({
          success: false,
          message: 'You do not have access to this course',
        });
        return;
      }

      const course = await CourseService.getCourseById(id);

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Course retrieved successfully',
        data: { 
          course,
          userRole: access.role,
        },
      });
    } catch (error) {
      console.error('Error getting course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve course',
      });
    }
  }

  /**
   * Get courses for the authenticated user
   * 
   * @param req - AuthRequest containing user info and query parameters
   * @param res - Express Response object
   */
  static async getMyCourses(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;
      const { page = 1, limit = 10 } = req.query;

      // Build pagination
      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: 'createdAt',
        sortOrder: 'desc' as const,
      };

      let result;
      
      if (userRole === 'INSTRUCTOR' || userRole === 'ADMIN') {
        // Get courses where user is the instructor
        result = await CourseService.getInstructorCourses(userId, pagination);
      } else {
        // Get courses where user is enrolled as student
        result = await CourseService.getStudentCourses(userId, pagination);
      }

      res.status(200).json({
        success: true,
        message: 'Courses retrieved successfully',
        data: result.data,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total: result.total,
          totalPages: Math.ceil(result.total / pagination.limit),
          hasNext: pagination.page * pagination.limit < result.total,
          hasPrev: pagination.page > 1,
        },
      });
    } catch (error) {
      console.error('Error getting user courses:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve courses',
      });
    }
  }

  /**
   * Update course
   * 
   * @param req - AuthRequest containing course ID and update data
   * @param res - Express Response object
   */
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const instructorId = req.user!.userId;
      const updateData = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Course ID is required',
        });
        return;
      }

      const result = await CourseService.updateCourse(id, updateData, instructorId);

      if (!result.success) {
        const statusCode = CourseController.getStatusCodeFromMessage(result.message);
        res.status(statusCode).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          course: result.course,
        },
      });
    } catch (error) {
      console.error('Error updating course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update course',
      });
    }
  }

  /**
   * Edit course details (name, description, end date)
   * 
   * @param req - AuthRequest containing course ID and edit data
   * @param res - Express Response object
   */
  static async editCourse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const instructorId = req.user!.userId;
      const { name, description, endDate } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Course ID is required',
        });
        return;
      }

      // Build update data with only allowed fields for editing
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (endDate !== undefined) updateData.endDate = endDate;

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one field (name, description, or endDate) must be provided',
        });
        return;
      }

      const result = await CourseService.updateCourse(id, updateData, instructorId);

      if (!result.success) {
        const statusCode = CourseController.getStatusCodeFromMessage(result.message);
        res.status(statusCode).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Course details updated successfully',
        data: {
          course: result.course,
        },
      });
    } catch (error) {
      console.error('Error editing course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to edit course',
      });
    }
  }

  /**
   * Update course settings (GPS radius, late entry options, selfie requirement)
   * 
   * @param req - AuthRequest containing course ID and settings data
   * @param res - Express Response object
   */
  static async updateSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const instructorId = req.user!.userId;
      const { gpsRadius, allowLateEntry, lateEntryMinutes, requireSelfie } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Course ID is required',
        });
        return;
      }

      // Build settings object with only provided fields
      const settings: any = {};
      if (gpsRadius !== undefined) settings.gpsRadius = gpsRadius;
      if (allowLateEntry !== undefined) settings.allowLateEntry = allowLateEntry;
      if (lateEntryMinutes !== undefined) settings.lateEntryMinutes = lateEntryMinutes;
      if (requireSelfie !== undefined) settings.requireSelfie = requireSelfie;

      if (Object.keys(settings).length === 0) {
        res.status(400).json({
          success: false,
          message: 'At least one setting must be provided',
        });
        return;
      }

      const updateData = { settings };
      const result = await CourseService.updateCourse(id, updateData, instructorId);

      if (!result.success) {
        const statusCode = CourseController.getStatusCodeFromMessage(result.message);
        res.status(statusCode).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Course settings updated successfully',
        data: {
          course: result.course,
        },
      });
    } catch (error) {
      console.error('Error updating course settings:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update course settings',
      });
    }
  }

  /**
   * Delete course
   * 
   * @param req - AuthRequest containing course ID and password
   * @param res - Express Response object
   */
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const instructorId = req.user!.userId;
      const { password } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Course ID is required',
        });
        return;
      }

      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Password is required for this action',
        });
        return;
      }

      // Verify password with auth service
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({
          success: false,
          message: 'Authorization header is required',
        });
        return;
      }

      const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
      const passwordVerified = await AuthServiceClient.verifyPassword(password, accessToken);

      if (!passwordVerified) {
        res.status(401).json({
          success: false,
          message: 'Invalid password. Please enter your correct password to continue.',
        });
        return;
      }

      const result = await CourseService.deleteCourse(id, instructorId);

      if (!result.success) {
        const statusCode = CourseController.getStatusCodeFromMessage(result.message);
        res.status(statusCode).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Error deleting course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete course',
      });
    }
  }

  /**
   * Enroll in course
   * 
   * @param req - AuthRequest containing invite code
   * @param res - Express Response object
   */
  static async enroll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user!.userId;
      const { code } = req.body;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Invite code is required',
        });
        return;
      }

      const result = await CourseService.enrollStudent(studentId, { inviteCode: code });

      if (!result.success) {
        const statusCode = CourseController.getStatusCodeFromMessage(result.message);
        res.status(statusCode).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          membership: result.membership,
        },
      });
    } catch (error) {
      console.error('Error enrolling in course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to enroll in course',
      });
    }
  }

  /**
   * Leave course
   * 
   * @param req - AuthRequest containing course ID and password
   * @param res - Express Response object
   */
  static async leave(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const studentId = req.user!.userId;
      const { password } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Course ID is required',
        });
        return;
      }

      if (!password) {
        res.status(400).json({
          success: false,
          message: 'Password is required for this action',
        });
        return;
      }

      // Verify password with auth service
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        res.status(401).json({
          success: false,
          message: 'Authorization header is required',
        });
        return;
      }

      const accessToken = authHeader.substring(7); // Remove "Bearer " prefix
      const passwordVerified = await AuthServiceClient.verifyPassword(password, accessToken);

      if (!passwordVerified) {
        res.status(401).json({
          success: false,
          message: 'Invalid password. Please enter your correct password to continue.',
        });
        return;
      }

      const result = await CourseService.leaveCourse(id, studentId);

      if (!result.success) {
        const statusCode = CourseController.getStatusCodeFromMessage(result.message);
        res.status(statusCode).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Error leaving course:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to leave course',
      });
    }
  }

  /**
   * Remove student from course (Instructor only)
   * 
   * @param req - AuthRequest containing course ID and student ID
   * @param res - Express Response object
   */
  static async removeStudent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, studentId } = req.params;
      const instructorId = req.user!.userId;

      if (!id || !studentId) {
        res.status(400).json({
          success: false,
          message: 'Course ID and student ID are required',
        });
        return;
      }

      const result = await CourseService.removeStudent(id, studentId, instructorId);

      if (!result.success) {
        const statusCode = CourseController.getStatusCodeFromMessage(result.message);
        res.status(statusCode).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Error removing student:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to remove student from course',
      });
    }
  }

  /**
   * Get course members
   * 
   * @param req - AuthRequest containing course ID
   * @param res - Express Response object
   */
  static async getMembers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Course ID is required',
        });
        return;
      }

      const result = await CourseService.getCourseMembers(id, userId);

      if (!result.success) {
        const statusCode = CourseController.getStatusCodeFromMessage(result.message);
        res.status(statusCode).json({
          success: false,
          message: result.message,
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          members: result.members,
        },
      });
    } catch (error) {
      console.error('Error getting course members:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve course members',
      });
    }
  }

  /**
   * Get course by invite code (for preview before enrollment)
   * 
   * @param req - AuthRequest containing invite code
   * @param res - Express Response object
   */
  static async getByCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { code } = req.params;

      if (!code) {
        res.status(400).json({
          success: false,
          message: 'Invite code is required',
        });
        return;
      }

      const course = await CourseService.getCourseByCode(code);

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Invalid invite code',
        });
        return;
      }

      // Return limited course information for preview
      res.status(200).json({
        success: true,
        message: 'Course found',
        data: {
          course: {
            id: course.id,
            name: course.name,
            description: course.description,
            code: course.code,
            isActive: course.isActive,
          },
        },
      });
    } catch (error) {
      console.error('Error getting course by code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve course',
      });
    }
  }

  /**
   * Helper method to determine HTTP status code from error message
   */
  private static getStatusCodeFromMessage(message: string): number {
    if (message.includes('not found')) return 404;
    if (message.includes('not authorized') || message.includes('permission')) return 403;
    if (message.includes('already enrolled') || message.includes('already exists')) return 409;
    if (message.includes('invalid') || message.includes('required')) return 400;
    return 400; // Default to bad request
  }
}
