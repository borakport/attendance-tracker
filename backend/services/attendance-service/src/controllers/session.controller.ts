/**
 * Session Controller
 * 
 * This controller handles all session-related HTTP requests by delegating
 * business logic to the SessionService. Focuses on request/response handling,
 * input validation, and HTTP status codes.
 * 
 * Key Features:
 * - Session lifecycle management (create, start, end, delete)
 * - QR code generation for attendance
 * - Real-time session notifications
 * - Instructor authorization checks
 * 
 * Security Features:
 * - User authentication required for all operations
 * - Instructor authorization for session management
 * - Input validation and sanitization
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { SessionService } from '../services';
import realtimeClient from '../config/realtime-client';

/**
 * Session Controller Class
 * 
 * Provides static methods for handling session-related HTTP requests.
 * All methods require user authentication and delegate business logic
 * to the SessionService.
 */
export class SessionController {

  /**
   * Create a new session
   * 
   * @param req - AuthRequest containing user info and session data
   * @param res - Express Response object
   */
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instructorId = req.user!.userId;
      const sessionData = req.body;

      console.log('Session creation request:');
      console.log('  - Instructor ID from JWT:', instructorId);
      console.log('  - User info from JWT:', JSON.stringify(req.user, null, 2));
      console.log('  - Session data from body:', JSON.stringify(sessionData, null, 2));

      // Input validation
      const requiredFields = ['courseId', 'name', 'startTime', 'endTime', 'latitude', 'longitude'];
      const missingFields = requiredFields.filter(field => !sessionData[field]);
      
      if (missingFields.length > 0) {
        console.log('  - Missing fields:', missingFields);
        res.status(400).json({
          success: false,
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
        return;
      }

      // Delegate to service layer
      const result = await SessionService.createSession(sessionData, instructorId);

      if (!result.success) {
        const statusCode = SessionController.getStatusCodeFromMessage(result.message);
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
          session: result.session,
        },
      });
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create session',
      });
    }
  }

  /**
   * Get session by ID
   * 
   * @param req - AuthRequest containing session ID
   * @param res - Express Response object
   */
  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
        return;
      }

      const session = await SessionService.getSessionById(id);

      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Session not found',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Session retrieved successfully',
        data: session,
      });
    } catch (error) {
      console.error('Error getting session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve session',
      });
    }
  }

  /**
   * Get sessions with filters
   * 
   * @param req - AuthRequest containing query parameters
   * @param res - Express Response object
   */
  static async getSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId, instructorId, isActive, startDate, endDate, page = 1, limit = 10 } = req.query;

      // Build filters
      const filters: any = {};
      if (courseId) filters.courseId = courseId as string;
      if (instructorId) filters.instructorId = instructorId as string;
      if (isActive !== undefined) filters.isActive = isActive === 'true';
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      // Build pagination
      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: 'startTime',
        sortOrder: 'desc' as const,
      };

      const result = await SessionService.getSessions(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Sessions retrieved successfully',
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
      console.error('Error getting sessions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve sessions',
      });
    }
  }

  /**
   * Update session
   * 
   * @param req - AuthRequest containing session ID and update data
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
          message: 'Session ID is required',
        });
        return;
      }

      const result = await SessionService.updateSession(id, updateData, instructorId);

      if (!result.success) {
        const statusCode = SessionController.getStatusCodeFromMessage(result.message);
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
          session: result.session,
        },
      });
    } catch (error) {
      console.error('Error updating session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update session',
      });
    }
  }

  /**
   * Start session
   * 
   * @param req - AuthRequest containing session ID
   * @param res - Express Response object
   */
  static async start(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const instructorId = req.user!.userId;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
        return;
      }

      const result = await SessionService.startSession(id, instructorId);

      if (!result.success) {
        const statusCode = SessionController.getStatusCodeFromMessage(result.message);
        res.status(statusCode).json({
          success: false,
          message: result.message,
        });
        return;
      }

      // Send real-time notification
      try {
        realtimeClient.emit('session:started', {
          sessionId: id,
          instructorId,
          qrCode: result.qrCode,
          timestamp: new Date(),
        });
      } catch (notificationError) {
        console.warn('Failed to send session start notification:', notificationError);
      }

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          qrCode: result.qrCode,
        },
      });
    } catch (error) {
      console.error('Error starting session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to start session',
      });
    }
  }

  /**
   * End session
   * 
   * @param req - AuthRequest containing session ID
   * @param res - Express Response object
   */
  static async end(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const instructorId = req.user!.userId;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
        return;
      }

      const result = await SessionService.endSession(id, instructorId);

      if (!result.success) {
        const statusCode = SessionController.getStatusCodeFromMessage(result.message);
        res.status(statusCode).json({
          success: false,
          message: result.message,
        });
        return;
      }

      // Send real-time notification
      try {
        realtimeClient.emit('session:ended', {
          sessionId: id,
          instructorId,
          timestamp: new Date(),
        });
      } catch (notificationError) {
        console.warn('Failed to send session end notification:', notificationError);
      }

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error('Error ending session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to end session',
      });
    }
  }

  /**
   * Delete session
   * 
   * @param req - AuthRequest containing session ID
   * @param res - Express Response object
   */
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const instructorId = req.user!.userId;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
        return;
      }

      const result = await SessionService.deleteSession(id, instructorId);

      if (!result.success) {
        const statusCode = SessionController.getStatusCodeFromMessage(result.message);
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
      console.error('Error deleting session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete session',
      });
    }
  }

  /**
   * Get active sessions for a course OR all active sessions for user
   * 
   * @param req - AuthRequest containing optional course ID
   * @param res - Express Response object
   */
  static async getActiveSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const userId = req.user!.userId;

      let sessions;
      
      if (courseId) {
        // Get active sessions for specific course
        sessions = await SessionService.getActiveSessions(courseId);
      } else {
        // Get all active sessions for user's courses
        sessions = await SessionService.getAllActiveSessionsForUser(userId);
      }

      res.status(200).json({
        success: true,
        message: 'Active sessions retrieved successfully',
        data: { sessions },
      });
    } catch (error) {
      console.error('Error getting active sessions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve active sessions',
      });
    }
  }

  /**
   * Get session by QR code
   * 
   * @param req - AuthRequest containing QR code
   * @param res - Express Response object
   */
  static async getByQRCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { qrCode } = req.params;

      if (!qrCode) {
        res.status(400).json({
          success: false,
          message: 'QR code is required',
        });
        return;
      }

      const session = await SessionService.getSessionByQRCode(qrCode);

      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Session not found or QR code is invalid',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Session found',
        data: { session },
      });
    } catch (error) {
      console.error('Error getting session by QR code:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve session',
      });
    }
  }

  /**
   * Get sessions for a specific course
   * 
   * @param req - AuthRequest containing course ID
   * @param res - Express Response object
   */
  static async getByCourse(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      if (!courseId) {
        res.status(400).json({
          success: false,
          message: 'Course ID is required',
        });
        return;
      }

      // Build filters for the specific course
      const filters = { courseId };
      
      // Build pagination
      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: 'startTime',
        sortOrder: 'desc' as const,
      };

      const result = await SessionService.getSessions(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Course sessions retrieved successfully',
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
      console.error('Error getting course sessions:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve course sessions',
      });
    }
  }

  /**
   * Extend session for manual attendance management
   * 
   * @param req - AuthRequest containing user info and session ID
   * @param res - Express Response object
   */
  static async extendForManualAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const instructorId = req.user!.userId;
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
        return;
      }

      const result = await SessionService.extendSessionForManualAttendance(sessionId, instructorId);

      if (!result.success) {
        const statusCode = SessionController.getStatusCodeFromMessage(result.message);
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
      console.error('Error extending session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to extend session',
      });
    }
  }

  /**
   * Helper method to determine HTTP status code from error message
   */
  private static getStatusCodeFromMessage(message: string): number {
    if (message.includes('not found')) return 404;
    if (message.includes('not authorized') || message.includes('permission')) return 403;
    if (message.includes('conflicts') || message.includes('already')) return 409;
    if (message.includes('invalid') || message.includes('required')) return 400;
    return 400; // Default to bad request
  }
}
