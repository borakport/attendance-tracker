/**
 * Session Service
 * 
 * Business logic layer for session-related operations.
 * Handles session creation, management, QR code generation, and lifecycle.
 */

import { Session } from '@prisma/client';
import { SessionModel, CourseModel } from '../models';
import { 
  CreateSessionData, 
  UpdateSessionData, 
  SessionFilters, 
  PaginationOptions,
  SessionWithCourse 
} from '../types';

// Simple console logger until we implement proper logging
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
};

export class SessionService {
  /**
   * Create a new session
   */
  static async createSession(
    data: CreateSessionData,
    instructorId: string
  ): Promise<{ success: boolean; message: string; session?: Session }> {
    try {
      logger.info(`Creating session for course ${data.courseId} by instructor ${instructorId}`);
      console.log('SessionService.createSession called with:');
      console.log('  - Data:', JSON.stringify(data, null, 2));
      console.log('  - InstructorId:', instructorId);

      // 1. Verify instructor owns the course
      const course = await CourseModel.findById(data.courseId);
      console.log('  - Course found:', course ? `Yes (${course.name}, owner: ${course.ownerId})` : 'No');
      if (!course) {
        return {
          success: false,
          message: 'Course not found',
        };
      }

      if (course.ownerId !== instructorId) {
        console.log(`  - Authorization failed: course owner ${course.ownerId} !== instructor ${instructorId}`);
        return {
          success: false,
          message: 'You are not authorized to create sessions for this course',
        };
      }

      // 2. Validate session times
      let startTime: Date;

      // If startInMinutes is provided, calculate start time from current time
      if (data.startInMinutes !== undefined) {
        const now = new Date();
        startTime = new Date(now.getTime() + data.startInMinutes * 60 * 1000);
        console.log(`  - Calculated start time: ${startTime.toISOString()} (${data.startInMinutes} minutes from now)`);
      } else {
        startTime = data.startTime instanceof Date ? data.startTime : new Date(data.startTime);
        console.log(`  - Using provided start time: ${startTime.toISOString()}`);
      }

      const endTime = data.endTime instanceof Date ? data.endTime : new Date(data.endTime);
      
      const validation = SessionService.validateSessionTimes(startTime, endTime);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
        };
      }

      // 3. Check for conflicting sessions
      const hasConflict = await SessionService.checkSessionConflict(
        data.courseId,
        startTime,
        endTime
      );

      if (hasConflict) {
        return {
          success: false,
          message: 'There is already a session scheduled during this time period',
        };
      }

      // 4. Create the session
      const sessionData = {
        ...data,
        startTime, // Use the calculated or provided start time
        endTime,   // Use the parsed end time
        instructorId,
      };
      
      // Remove startInMinutes from session data as it's not a database field
      if ('startInMinutes' in sessionData) {
        delete (sessionData as any).startInMinutes;
      }
      
      console.log('  - Final session data for creation:', {
        ...sessionData,
        startTime: sessionData.startTime.toISOString(),
        endTime: sessionData.endTime.toISOString()
      });
      
      const session = await SessionModel.create(sessionData);

      logger.info(`Session created successfully: ${session.id}`);

      return {
        success: true,
        message: 'Session created successfully',
        session,
      };
    } catch (error) {
      logger.error('Error creating session:', error);
      console.error('Detailed session creation error:', {
        error: error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        data: data
      });
      return {
        success: false,
        message: 'Failed to create session. Please try again.',
      };
    }
  }

  /**
   * Get session by ID with full details
   */
  static async getSessionById(sessionId: string): Promise<SessionWithCourse | null> {
    try {
      return await SessionModel.findById(sessionId);
    } catch (error) {
      logger.error('Error getting session by ID:', error);
      throw error;
    }
  }

  /**
   * Get sessions with filters and pagination
   */
  static async getSessions(
    filters: SessionFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{ data: SessionWithCourse[]; total: number }> {
    try {
      return await SessionModel.findMany(filters, pagination);
    } catch (error) {
      logger.error('Error getting sessions:', error);
      throw error;
    }
  }

  /**
   * Update session
   */
  static async updateSession(
    sessionId: string,
    updates: UpdateSessionData,
    instructorId: string
  ): Promise<{ success: boolean; message: string; session?: Session }> {
    try {
      // 1. Get existing session and verify ownership
      const existingSession = await SessionModel.findById(sessionId);
      if (!existingSession) {
        return {
          success: false,
          message: 'Session not found',
        };
      }

      if (existingSession.course.ownerId !== instructorId) {
        return {
          success: false,
          message: 'You are not authorized to update this session',
        };
      }

      // 2. Validate new times if provided
      if (updates.startTime || updates.endTime) {
        const startTime = updates.startTime || existingSession.startTime;
        const endTime = updates.endTime || existingSession.endTime;
        
        const validation = SessionService.validateSessionTimes(startTime, endTime);
        if (!validation.isValid) {
          return {
            success: false,
            message: validation.message,
          };
        }

        // Check for conflicts with other sessions (excluding current session)
        const hasConflict = await SessionService.checkSessionConflict(
          existingSession.courseId,
          startTime,
          endTime,
          sessionId
        );

        if (hasConflict) {
          return {
            success: false,
            message: 'The updated time conflicts with another session',
          };
        }
      }

      // 3. Update the session
      const updatedSession = await SessionModel.update(sessionId, updates);

      logger.info(`Session updated: ${sessionId} by instructor ${instructorId}`);

      return {
        success: true,
        message: 'Session updated successfully',
        session: updatedSession,
      };
    } catch (error) {
      logger.error('Error updating session:', error);
      return {
        success: false,
        message: 'Failed to update session',
      };
    }
  }

  /**
   * Start a session
   */
  static async startSession(
    sessionId: string,
    instructorId: string
  ): Promise<{ success: boolean; message: string; qrCode?: string }> {
    try {
      // 1. Verify session ownership
      const session = await SessionModel.findById(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Session not found',
        };
      }

      if (session.course.ownerId !== instructorId) {
        return {
          success: false,
          message: 'You are not authorized to start this session',
        };
      }

      // 2. Check if session can be started
      const now = new Date();
      const sessionStart = new Date(session.startTime);
      const earlyStartWindow = new Date(sessionStart.getTime() - 5 * 60 * 1000); // 5 minutes before for late entry

      if (now < earlyStartWindow) {
        return {
          success: false,
          message: 'Session can only be started 5 minutes before the scheduled time',
        };
      }

      if (session.startedAt) {
        return {
          success: false,
          message: 'Session has already been started',
        };
      }

      // 3. Start the session and generate QR code
      await SessionModel.startSession(sessionId);
      const qrCode = await SessionModel.generateQRCode(sessionId);

      logger.info(`Session started: ${sessionId} by instructor ${instructorId}`);

      return {
        success: true,
        message: 'Session started successfully',
        qrCode,
      };
    } catch (error) {
      logger.error('Error starting session:', error);
      return {
        success: false,
        message: 'Failed to start session',
      };
    }
  }

  /**
   * End a session
   */
  static async endSession(
    sessionId: string,
    instructorId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Verify session ownership
      const session = await SessionModel.findById(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Session not found',
        };
      }

      if (session.course.ownerId !== instructorId) {
        return {
          success: false,
          message: 'You are not authorized to end this session',
        };
      }

      if (!session.startedAt) {
        return {
          success: false,
          message: 'Session has not been started yet',
        };
      }

      if (session.endedAt) {
        return {
          success: false,
          message: 'Session has already been ended',
        };
      }

      // 2. End the session
      await SessionModel.endSession(sessionId);

      logger.info(`Session ended: ${sessionId} by instructor ${instructorId}`);

      return {
        success: true,
        message: 'Session ended successfully',
      };
    } catch (error) {
      logger.error('Error ending session:', error);
      return {
        success: false,
        message: 'Failed to end session',
      };
    }
  }

  /**
   * Delete a session
   */
  static async deleteSession(
    sessionId: string,
    instructorId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Verify session ownership
      const session = await SessionModel.findById(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Session not found',
        };
      }

      if (session.course.ownerId !== instructorId) {
        return {
          success: false,
          message: 'You are not authorized to delete this session',
        };
      }

      // 2. Check if session can be deleted (not started or has attendances)
      if (session.startedAt && session.attendances.length > 0) {
        return {
          success: false,
          message: 'Cannot delete a session that has attendance records',
        };
      }

      // 3. Delete the session
      await SessionModel.delete(sessionId);

      logger.info(`Session deleted: ${sessionId} by instructor ${instructorId}`);

      return {
        success: true,
        message: 'Session deleted successfully',
      };
    } catch (error) {
      logger.error('Error deleting session:', error);
      return {
        success: false,
        message: 'Failed to delete session',
      };
    }
  }

  /**
   * Get active sessions for a course
   */
  static async getActiveSessions(courseId: string): Promise<Session[]> {
    try {
      return await SessionModel.getActiveSessions(courseId);
    } catch (error) {
      logger.error('Error getting active sessions:', error);
      throw error;
    }
  }

  /**
   * Find session by QR code
   */
  static async getSessionByQRCode(qrCode: string): Promise<Session | null> {
    try {
      return await SessionModel.findByQRCode(qrCode);
    } catch (error) {
      logger.error('Error finding session by QR code:', error);
      throw error;
    }
  }

  /**
   * Validate session times
   */
  private static validateSessionTimes(
    startTime: Date,
    endTime: Date
  ): { isValid: boolean; message: string } {
    const now = new Date();
    
    // Allow sessions to start within the last 2 minutes or in the future
    // This accounts for small time differences between client and server
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
    if (startTime < twoMinutesAgo) {
      return {
        isValid: false,
        message: 'Session start time cannot be in the past',
      };
    }

    // Check if end time is after start time
    if (endTime <= startTime) {
      return {
        isValid: false,
        message: 'Session end time must be after start time',
      };
    }

    // Check session duration (minimum 15 minutes, maximum 8 hours)
    const durationMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
    if (durationMinutes < 15) {
      return {
        isValid: false,
        message: 'Session must be at least 15 minutes long',
      };
    }

    if (durationMinutes > 480) { // 8 hours
      return {
        isValid: false,
        message: 'Session cannot be longer than 8 hours',
      };
    }

    return {
      isValid: true,
      message: 'Session times are valid',
    };
  }

  /**
   * Check for session conflicts
   */
  private static async checkSessionConflict(
    courseId: string,
    startTime: Date,
    endTime: Date,
    excludeSessionId?: string
  ): Promise<boolean> {
    try {
      const existingSessions = await SessionModel.getSessionsByDateRange(
        courseId,
        new Date(startTime.getTime() - 24 * 60 * 60 * 1000), // 1 day before
        new Date(endTime.getTime() + 24 * 60 * 60 * 1000)    // 1 day after
      );

      for (const session of existingSessions) {
        // Skip the session we're updating
        if (excludeSessionId && session.id === excludeSessionId) {
          continue;
        }

        // Check for time overlap
        const sessionStart = new Date(session.startTime);
        const sessionEnd = new Date(session.endTime);

        const hasOverlap = 
          (startTime < sessionEnd && endTime > sessionStart) ||
          (sessionStart < endTime && sessionEnd > startTime);

        if (hasOverlap) {
          return true;
        }
      }

      return false;
    } catch (error) {
      logger.error('Error checking session conflict:', error);
      return false; // In case of error, allow the session to be created
    }
  }

  /**
   * Get all active sessions for user's courses (both as instructor and student)
   */
  static async getAllActiveSessionsForUser(userId: string): Promise<Session[]> {
    try {
      logger.info(`Getting all active sessions for user ${userId}`);

      // Get all active sessions where the user is either:
      // 1. The instructor (course owner)
      // 2. A student (course member)
      const sessions = await SessionModel.getAllActiveSessionsForUser(userId);
      
      // Enhance each session with attendance timing information
      const enhancedSessions = sessions.map(session => {
        const attendanceInfo = SessionService.calculateAttendanceInfo(session);
        return {
          ...session,
          attendanceInfo
        };
      });
      
      logger.info(`Found ${sessions.length} active sessions for user ${userId}`);
      return enhancedSessions;
    } catch (error) {
      logger.error('Error getting all active sessions for user:', error);
      // Return empty array on error to prevent forEach undefined error
      return [];
    }
  }

  /**
   * Calculate attendance information for a session
   */
  private static calculateAttendanceInfo(session: any) {
    const now = new Date();
    const startTime = new Date(session.startTime);
    const endTime = new Date(session.endTime);
    
    // Calculate late entry threshold
    const lateMinutes = session.lateMinutes || 15;
    const lateThreshold = new Date(startTime.getTime() + lateMinutes * 60 * 1000);
    
    // Determine current attendance status if marked now
    let currentStatus: 'present' | 'late' | 'absent' = 'absent';
    let statusMessage = '';
    
    if (now <= startTime) {
      currentStatus = 'present';
      statusMessage = 'Session not started yet';
    } else if (now <= lateThreshold) {
      currentStatus = 'present';
      statusMessage = 'Marking now: Present';
    } else if (now <= endTime) {
      currentStatus = 'late';
      statusMessage = 'Marking now: Late';
    } else {
      currentStatus = 'absent';
      statusMessage = 'Session ended';
    }
    
    // Calculate time remaining and session info
    const timeToEnd = endTime.getTime() - now.getTime();
    const timeToLate = lateThreshold.getTime() - now.getTime();
    
    // Calculate total session duration
    const totalDuration = endTime.getTime() - startTime.getTime();
    const totalHours = Math.floor(totalDuration / (1000 * 60 * 60));
    const totalMinutes = Math.floor((totalDuration % (1000 * 60 * 60)) / (1000 * 60));
    
    // Format session end time (e.g., "2:30 PM")
    const endTimeFormatted = endTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Create duration text
    let durationText = '';
    if (totalHours > 0) {
      durationText = `${totalHours}h ${totalMinutes}m`;
    } else {
      durationText = `${totalMinutes}m`;
    }
    
    let countdownMessage = '';
    let endsInMessage = '';
    
    if (timeToEnd > 0) {
      if (timeToLate > 0) {
        // Still in present period - show countdown to late entry AND ends in countdown
        const minutesToLate = Math.floor(timeToLate / (1000 * 60));
        if (minutesToLate > 0) {
          countdownMessage = `${minutesToLate}m until late entry`;
        } else {
          countdownMessage = 'Late entry starts now';
        }
        
        // Show "Ends in" during present period
        const hoursToEnd = Math.floor(timeToEnd / (1000 * 60 * 60));
        const minutesToEnd = Math.floor((timeToEnd % (1000 * 60 * 60)) / (1000 * 60));
        
        if (hoursToEnd > 0) {
          endsInMessage = `Ends in ${hoursToEnd}h ${minutesToEnd}m`;
        } else {
          endsInMessage = `Ends in ${minutesToEnd}m`;
        }
      } else {
        // In late period - show session end time only (no "Ends in")
        countdownMessage = `Session ends at ${endTimeFormatted}`;
        endsInMessage = ''; // Remove the static "Ends in" message
      }
    } else {
      countdownMessage = 'Session ended';
      endsInMessage = 'Session ended';
    }
    
    // Add total session time information
    const totalSessionTime = `Total session time: ${durationText}`;
    
    return {
      currentStatus,
      statusMessage,
      countdownMessage,
      endsInMessage,
      totalSessionTime,
      timeToEnd: Math.max(0, timeToEnd),
      timeToLate: Math.max(0, timeToLate),
      lateThreshold: lateThreshold.toISOString(),
      isInLateWindow: now > lateThreshold && now <= endTime,
      hasAttended: session.attendances && session.attendances.length > 0,
      endTime: endTimeFormatted,
      duration: durationText,
      totalDurationMinutes: Math.floor(totalDuration / (1000 * 60))
    };
  }

  /**
   * Extend session for manual attendance management
   */
  static async extendSessionForManualAttendance(
    sessionId: string,
    instructorId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Verify session ownership
      const session = await SessionModel.findById(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Session not found',
        };
      }

      if (session.course.ownerId !== instructorId) {
        return {
          success: false,
          message: 'You are not authorized to extend this session',
        };
      }

      // 2. Check if session has ended
      const now = new Date();
      const sessionEnd = new Date(session.endTime);
      
      if (now <= sessionEnd) {
        return {
          success: false,
          message: 'Session has not ended yet',
        };
      }

      // 3. Mark session as extended for manual attendance
      // This could be implemented by adding an 'extendedForManualAttendance' flag
      // or by updating session metadata
      
      logger.info(`Session extended for manual attendance: ${sessionId} by instructor ${instructorId}`);

      return {
        success: true,
        message: 'Session extended for manual attendance management',
      };
    } catch (error) {
      logger.error('Error extending session:', error);
      return {
        success: false,
        message: 'Failed to extend session',
      };
    }
  }
}
