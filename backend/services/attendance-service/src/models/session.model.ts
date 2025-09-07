/**
 * Session Model
 * 
 * Data access layer for session-related database operations.
 * Provides methods for creating, reading, updating, and deleting sessions
 * with proper error handling and type safety.
 */

import { PrismaClient, Session, Prisma } from '@prisma/client';
import { 
  CreateSessionData, 
  UpdateSessionData, 
  SessionFilters, 
  PaginationOptions,
  SessionWithCourse 
} from '../types';

const prisma = new PrismaClient();

// Simple console logger until we implement proper logging
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
};

export class SessionModel {
  /**
   * Create a new session
   */
  static async create(data: CreateSessionData): Promise<Session> {
    try {
      const session = await prisma.session.create({
        data: {
          courseId: data.courseId,
          createdById: data.instructorId,
          name: data.name,
          description: data.description,
          startTime: typeof data.startTime === 'string' ? new Date(data.startTime) : data.startTime,
          endTime: typeof data.endTime === 'string' ? new Date(data.endTime) : data.endTime,
          latitude: data.latitude,
          longitude: data.longitude,
          radiusMeters: data.radiusMeters || 50,
          locationName: data.locationName,
          allowLateEntry: data.allowLateEntry ?? true,
          lateMinutes: data.lateMinutes || 15,
          requireSelfie: data.requireSelfie ?? false,
          isActive: true, // Set session as active by default
          notes: data.notes,
        },
      });
      
      logger.info(`Session created: ${session.id} for course ${data.courseId}`);
      return session;
    } catch (error) {
      logger.error('Error creating session:', error);
      throw error;
    }
  }

  /**
   * Find session by ID
   */
  static async findById(id: string): Promise<SessionWithCourse | null> {
    try {
      const session = await prisma.session.findUnique({
        where: { id },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
              ownerId: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          attendances: {
            select: {
              id: true,
              userId: true,
              status: true,
              markedAt: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      if (!session) return null;

      // Debug coordinate values before conversion
      console.log('[SessionModel.findById] Raw values from database:');
      console.log(`  - session.latitude: ${session.latitude} (type: ${typeof session.latitude})`);
      console.log(`  - session.longitude: ${session.longitude} (type: ${typeof session.longitude})`);
      console.log(`  - session.startTime: ${session.startTime} (type: ${typeof session.startTime})`);
      console.log(`  - session.endTime: ${session.endTime} (type: ${typeof session.endTime})`);
      
      // Safe coordinate conversion with validation - ensure we always return valid numbers
      let latitude: number;
      let longitude: number;
      
      if (session.latitude != null && !isNaN(Number(session.latitude))) {
        latitude = Number(session.latitude);
      } else {
        console.warn('[SessionModel.findById] Invalid latitude value, using default 0');
        latitude = 0;
      }
      
      if (session.longitude != null && !isNaN(Number(session.longitude))) {
        longitude = Number(session.longitude);
      } else {
        console.warn('[SessionModel.findById] Invalid longitude value, using default 0');
        longitude = 0;
      }
      
      console.log('[SessionModel.findById] Final coordinate values:');
      console.log(`  - latitude: ${latitude} (type: ${typeof latitude})`);
      console.log(`  - longitude: ${longitude} (type: ${typeof longitude})`);

      // Convert null values to undefined to match TypeScript interface (but preserve required date fields)
      const result = {
        ...session,
        description: session.description || undefined,
        locationName: session.locationName || undefined,
        qrCode: session.qrCode || undefined,
        notes: session.notes || undefined,
        startedAt: session.startedAt || undefined,
        endedAt: session.endedAt || undefined,
        // Preserve required date fields as-is
        startTime: session.startTime,
        endTime: session.endTime,
        latitude,
        longitude,
      };

      console.log('[SessionModel.findById] Final result coordinates:');
      console.log(`  - result.latitude: ${result.latitude}`);
      console.log(`  - result.longitude: ${result.longitude}`);
      console.log(`  - result.startTime: ${result.startTime} (type: ${typeof result.startTime})`);
      console.log(`  - result.endTime: ${result.endTime} (type: ${typeof result.endTime})`);

      return result;
    } catch (error) {
      logger.error('Error finding session by ID:', error);
      throw error;
    }
  }

  /**
   * Find sessions with filters and pagination
   */
  static async findMany(
    filters: SessionFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{ data: SessionWithCourse[]; total: number }> {
    try {
      const {
        courseId,
        instructorId,
        isActive,
        startDate,
        endDate,
      } = filters;

      const {
        page = 1,
        limit = 10,
        sortBy = 'startTime',
        sortOrder = 'desc',
      } = pagination;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.SessionWhereInput = {};

      if (courseId) where.courseId = courseId;
      if (instructorId) where.createdById = instructorId;
      if (isActive !== undefined) where.isActive = isActive;

      if (startDate || endDate) {
        where.startTime = {};
        if (startDate) where.startTime.gte = startDate;
        if (endDate) where.startTime.lte = endDate;
      }

      // Get total count
      const total = await prisma.session.count({ where });

      // Get paginated data
      const sessionsData = await prisma.session.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
              ownerId: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          attendances: {
            select: {
              id: true,
              userId: true,
              status: true,
              markedAt: true,
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
                },
              },
            },
          },
        },
      });

      // Convert null values to undefined to match TypeScript interface
      const sessions: SessionWithCourse[] = sessionsData.map(session => ({
        ...session,
        description: session.description || undefined,
        locationName: session.locationName || undefined,
        qrCode: session.qrCode || undefined,
        notes: session.notes || undefined,
        startedAt: session.startedAt || undefined,
        endedAt: session.endedAt || undefined,
        latitude: Number(session.latitude),
        longitude: Number(session.longitude),
      }));

      return { data: sessions, total };
    } catch (error) {
      logger.error('Error finding sessions:', error);
      throw error;
    }
  }

  /**
   * Get active sessions for a course
   */
  static async getActiveSessions(courseId: string): Promise<Session[]> {
    try {
      const now = new Date();
      
      return await prisma.session.findMany({
        where: {
          courseId,
          isActive: true,
          startTime: {
            lte: now,
          },
          endTime: {
            gte: now,
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });
    } catch (error) {
      logger.error('Error finding active sessions:', error);
      throw error;
    }
  }

  /**
   * Get all active sessions for a user (both as instructor and student)
   */
  static async getAllActiveSessionsForUser(userId: string): Promise<Session[]> {
    try {
      const now = new Date();
      
      return await prisma.session.findMany({
        where: {
          isActive: true,
          startTime: {
            lte: now,
          },
          endTime: {
            gte: now,
          },
          OR: [
            // Sessions from courses where user is the owner (instructor)
            {
              course: {
                ownerId: userId,
              },
            },
            // Sessions from courses where user is a member (student)
            {
              course: {
                members: {
                  some: {
                    userId: userId,
                  },
                },
              },
            },
          ],
        },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
              ownerId: true,
            },
          },
          attendances: {
            where: {
              userId: userId,
            },
            select: {
              id: true,
              status: true,
              markedAt: true,
            },
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });
    } catch (error) {
      logger.error('Error finding all active sessions for user:', error);
      throw error;
    }
  }

  /**
   * Get sessions for a specific date range
   */
  static async getSessionsByDateRange(
    courseId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Session[]> {
    try {
      return await prisma.session.findMany({
        where: {
          courseId,
          startTime: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: {
          startTime: 'asc',
        },
      });
    } catch (error) {
      logger.error('Error finding sessions by date range:', error);
      throw error;
    }
  }

  /**
   * Update session
   */
  static async update(id: string, data: UpdateSessionData): Promise<Session> {
    try {
      const session = await prisma.session.update({
        where: { id },
        data,
      });
      
      logger.info(`Session updated: ${id}`);
      return session;
    } catch (error) {
      logger.error('Error updating session:', error);
      throw error;
    }
  }

  /**
   * Start a session (mark as started)
   */
  static async startSession(id: string): Promise<Session> {
    try {
      const session = await prisma.session.update({
        where: { id },
        data: {
          startedAt: new Date(),
          isActive: true,
        },
      });
      
      logger.info(`Session started: ${id}`);
      return session;
    } catch (error) {
      logger.error('Error starting session:', error);
      throw error;
    }
  }

  /**
   * End a session (mark as ended)
   */
  static async endSession(id: string): Promise<Session> {
    try {
      const session = await prisma.session.update({
        where: { id },
        data: {
          endedAt: new Date(),
          isActive: false,
        },
      });
      
      logger.info(`Session ended: ${id}`);
      return session;
    } catch (error) {
      logger.error('Error ending session:', error);
      throw error;
    }
  }

  /**
   * Delete session
   */
  static async delete(id: string): Promise<void> {
    try {
      await prisma.session.delete({
        where: { id },
      });
      
      logger.info(`Session deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting session:', error);
      throw error;
    }
  }

  /**
   * Generate QR code for session
   */
  static async generateQRCode(id: string): Promise<string> {
    try {
      const qrCode = `session_${id}_${Date.now()}`;
      
      await prisma.session.update({
        where: { id },
        data: { qrCode },
      });
      
      logger.info(`QR code generated for session: ${id}`);
      return qrCode;
    } catch (error) {
      logger.error('Error generating QR code:', error);
      throw error;
    }
  }

  /**
   * Find session by QR code
   */
  static async findByQRCode(qrCode: string): Promise<Session | null> {
    try {
      return await prisma.session.findUnique({
        where: { qrCode },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error finding session by QR code:', error);
      throw error;
    }
  }

  /**
   * Check if user can mark attendance for session
   */
  static async canMarkAttendance(
    sessionId: string,
    userId: string
  ): Promise<{ canMark: boolean; reason?: string }> {
    try {
      const session = await prisma.session.findUnique({
        where: { id: sessionId },
        include: {
          course: {
            include: {
              members: {
                where: { userId },
              },
            },
          },
          attendances: {
            where: { userId },
          },
        },
      });

      if (!session) {
        return { canMark: false, reason: 'Session not found' };
      }

      if (!session.isActive) {
        return { canMark: false, reason: 'Session is not active' };
      }

      if (session.course.members.length === 0) {
        return { canMark: false, reason: 'User is not enrolled in this course' };
      }

      if (session.attendances.length > 0) {
        return { canMark: false, reason: 'Attendance already marked' };
      }

      const now = new Date();
      
      // Check if session has started
      if (now < session.startTime) {
        return { canMark: false, reason: 'Session has not started yet' };
      }

      // Check if session has ended (considering late entry)
      const lateEntryEnd = new Date(session.endTime);
      if (session.allowLateEntry) {
        lateEntryEnd.setMinutes(lateEntryEnd.getMinutes() + session.lateMinutes);
      }

      if (now > lateEntryEnd) {
        return { canMark: false, reason: 'Session has ended' };
      }

      return { canMark: true };
    } catch (error) {
      logger.error('Error checking attendance eligibility:', error);
      throw error;
    }
  }
}
