/**
 * Attendance Controller
 * 
 * This controller handles all attendance-related HTTP requests by delegating
 * business logic to the AttendanceService. Focuses on request/response handling,
 * input validation, and HTTP status codes.
 * 
 * Key Features:
 * - GPS-based attendance marking with location verification
 * - Real-time attendance notifications via WebSocket  
 * - Attendance history and statistics
 * - Course enrollment validation
 * - Selfie verification support
 * 
 * Security Features:
 * - User authentication required for all operations
 * - Authorization handled by service layer
 * - Input validation and sanitization
 */

import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AttendanceService } from '../services';
import { AttendanceStatus } from '@prisma/client';
import realtimeClient from '../config/realtime-client';

/**
 * Attendance Controller Class
 * 
 * Provides static methods for handling attendance-related HTTP requests.
 * All methods require user authentication and delegate business logic
 * to the AttendanceService.
 */
export class AttendanceController {

  /**
   * Mark Attendance for a Session
   * 
   * Allows a student to mark their attendance for an active session.
   * Delegates business logic to AttendanceService and handles HTTP response.
   * 
   * @param req - AuthRequest containing user info and attendance data
   * @param res - Express Response object
   * @param next - Express NextFunction for error handling
   */
  static async mark(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { sessionId, latitude, longitude, selfieUrl } = req.body;

      // Input validation
      if (!sessionId || typeof latitude !== 'number' || typeof longitude !== 'number') {
        res.status(400).json({
          success: false,
          message: 'Invalid input. Session ID, latitude, and longitude are required.',
        });
        return;
      }

      // Delegate to service layer
      const result = await AttendanceService.markAttendance(
        userId,
        { sessionId, latitude, longitude, selfieUrl },
        req.ip
      );

      if (!result.success) {
        const statusCode = AttendanceController.getStatusCodeFromMessage(result.message);
        res.status(statusCode).json({
          success: false,
          message: result.message,
        });
        return;
      }

      // Send real-time notification on successful attendance
      try {
        realtimeClient.emit('attendance:marked', {
          sessionId,
          userId,
          status: result.attendance?.status,
          timestamp: new Date(),
        });
      } catch (notificationError) {
        console.warn('Failed to send real-time notification:', notificationError);
        // Don't fail the request if notification fails
      }

      res.status(201).json({
        success: true,
        message: result.message,
        data: {
          attendance: result.attendance,
        },
      });
    } catch (error) {
      console.error('Error in mark attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  /**
   * Get User's Attendance Records
   * 
   * Retrieves attendance records for the authenticated user with pagination.
   * 
   * @param req - AuthRequest containing user info and query parameters
   * @param res - Express Response object
   * @param next - Express NextFunction for error handling
   */
  static async getMyAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { page = 1, limit = 10, courseId, status, startDate, endDate } = req.query;

      // Build filters
      const filters: any = { userId };
      if (courseId) filters.courseId = courseId as string;
      if (status) filters.status = status as AttendanceStatus;
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      // Build pagination
      const pagination = {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        sortBy: 'markedAt',
        sortOrder: 'desc' as const,
      };

      const result = await AttendanceService.getAttendanceRecords(filters, pagination);

      res.status(200).json({
        success: true,
        message: 'Attendance records retrieved successfully',
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
      console.error('Error getting attendance records:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve attendance records',
      });
    }
  }

  /**
   * Get User's Attendance Statistics
   * 
   * Retrieves attendance statistics for the authenticated user.
   * 
   * @param req - AuthRequest containing user info
   * @param res - Express Response object
   * @param next - Express NextFunction for error handling
   */
  static async getMyStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { courseId } = req.query;

      const stats = await AttendanceService.getUserAttendanceStats(
        userId,
        courseId as string | undefined
      );

      res.status(200).json({
        success: true,
        message: 'Attendance statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      console.error('Error getting attendance stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve attendance statistics',
      });
    }
  }

  /**
   * Get Session Attendance Summary (Instructor only)
   * 
   * Retrieves attendance summary for a specific session.
   * 
   * @param req - AuthRequest containing user info and session ID
   * @param res - Express Response object
   * @param next - Express NextFunction for error handling
   */
  static async getSessionSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
        return;
      }

      const summary = await AttendanceService.getSessionAttendanceSummary(sessionId);

      res.status(200).json({
        success: true,
        message: 'Session attendance summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      console.error('Error getting session summary:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve session attendance summary',
      });
    }
  }

  /**
   * Get Session Attendance Records
   * Returns the actual attendance records for a session (not just summary)
   */
  static async getSessionAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({
          success: false,
          message: 'Session ID is required',
        });
        return;
      }

      const attendanceRecords = await AttendanceService.getSessionAttendanceRecords(sessionId);

      res.status(200).json({
        success: true,
        message: 'Session attendance records retrieved successfully',
        data: attendanceRecords,
      });
    } catch (error) {
      console.error('Error getting session attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve session attendance records',
      });
    }
  }

  /**
   * Update Attendance Record (Instructor only)
   * 
   * Allows instructors to manually update attendance records.
   * 
   * @param req - AuthRequest containing user info and update data
   * @param res - Express Response object
   * @param next - Express NextFunction for error handling
   */
  static async updateAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { attendanceId } = req.params;
      const { status, selfieUrl } = req.body;
      const updatedBy = req.user!.userId;

      if (!attendanceId) {
        res.status(400).json({
          success: false,
          message: 'Attendance ID is required',
        });
        return;
      }

      const updates: any = {};
      if (status) updates.status = status;
      if (selfieUrl) updates.selfieUrl = selfieUrl;

      const result = await AttendanceService.updateAttendance(
        attendanceId,
        updates,
        updatedBy
      );

      if (!result.success) {
        const statusCode = result.message === 'Attendance record not found' ? 404 : 400;
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
          attendance: result.attendance,
        },
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update attendance record',
      });
    }
  }

  /**
   * Bulk Mark Attendance (Instructor only)
   * 
   * Allows instructors to mark attendance for multiple students.
   * 
   * @param req - AuthRequest containing user info and bulk attendance data
   * @param res - Express Response object
   * @param next - Express NextFunction for error handling
   */
  static async bulkMark(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId, attendanceData } = req.body;
      const markedBy = req.user!.userId;

      if (!sessionId || !Array.isArray(attendanceData)) {
        res.status(400).json({
          success: false,
          message: 'Session ID and attendance data array are required',
        });
        return;
      }

      const result = await AttendanceService.bulkMarkAttendance(
        sessionId,
        attendanceData,
        markedBy
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: {
          results: result.results,
        },
      });
    } catch (error) {
      console.error('Error in bulk mark attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process bulk attendance',
      });
    }
  }

  /**
   * Delete Attendance Record (Instructor only)
   * 
   * Allows an instructor to delete an attendance record.
   * 
   * @param req - AuthRequest containing user info and attendance ID
   * @param res - Express Response object
   */
  static async deleteAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { attendanceId } = req.params;
      const deletedBy = req.user!.userId;

      if (!attendanceId) {
        res.status(400).json({
          success: false,
          message: 'Attendance ID is required',
        });
        return;
      }

      const result = await AttendanceService.deleteAttendance(attendanceId, deletedBy);

      if (!result.success) {
        const statusCode = result.message === 'Attendance record not found' ? 404 : 400;
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
      console.error('Error deleting attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete attendance record',
      });
    }
  }

  /**
   * Add Manual Attendance
   * Allows instructors to manually add attendance records
   */
  static async addManualAttendance(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId, userId, status, markedAt, latitude, longitude } = req.body;
      const instructorId = req.user!.userId;

      const result = await AttendanceService.addManualAttendance(
        sessionId,
        userId,
        status,
        markedAt,
        latitude,
        longitude,
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
        data: result.data,
      });
    } catch (error) {
      console.error('Error adding manual attendance:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add manual attendance record',
      });
    }
  }

  /**
   * Helper method to determine HTTP status code from error message
   */
  private static getStatusCodeFromMessage(message: string): number {
    if (message.includes('not found')) return 404;
    if (message.includes('already marked')) return 409;
    if (message.includes('not authorized') || message.includes('not enrolled')) return 403;
    if (message.includes('too far') || message.includes('not active') || message.includes('ended')) return 400;
    return 400; // Default to bad request
  }
}
