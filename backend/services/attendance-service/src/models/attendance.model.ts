/**
 * Attendance Model
 * 
 * Data access layer for attendance-related database operations.
 * Provides methods for creating, reading, updating attendance records
 * with proper error handling and type safety.
 */

import { PrismaClient, Attendance, AttendanceStatus, Prisma } from '@prisma/client';
import { 
  AttendanceFilters, 
  PaginationOptions, 
  UserAttendanceRecord,
  AttendanceStats 
} from '../types';

const prisma = new PrismaClient();

// Simple console logger until we implement proper logging
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
};

export interface AttendanceCreateData {
  sessionId: string;
  userId: string;
  status: AttendanceStatus;
  ipAddress?: string;
  latitude: number;
  longitude: number;
  selfieUrl?: string;
  distanceFromSession: number;
}

export interface AttendanceUpdateData {
  status?: AttendanceStatus;
  selfieUrl?: string;
}

export class AttendanceModel {
  /**
   * Create a new attendance record
   */
  static async create(data: AttendanceCreateData): Promise<Attendance> {
    try {
      const attendance = await prisma.attendance.create({
        data,
      });
      
      logger.info(`Attendance created for user ${data.userId} in session ${data.sessionId}`);
      return attendance;
    } catch (error) {
      logger.error('Error creating attendance:', error);
      throw error;
    }
  }

  /**
   * Find attendance by ID
   */
  static async findById(id: string): Promise<Attendance | null> {
    try {
      return await prisma.attendance.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          session: {
            include: {
              course: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error finding attendance by ID:', error);
      throw error;
    }
  }

  /**
   * Check if attendance exists for user and session
   */
  static async findByUserAndSession(userId: string, sessionId: string): Promise<Attendance | null> {
    try {
      return await prisma.attendance.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
      });
    } catch (error) {
      logger.error('Error finding attendance by user and session:', error);
      throw error;
    }
  }

  /**
   * Get attendance records with filters and pagination
   */
  static async findMany(
    filters: AttendanceFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{ data: UserAttendanceRecord[]; total: number }> {
    try {
      const {
        courseId,
        userId,
        status,
        startDate,
        endDate,
        sessionId,
      } = filters;

      const {
        page = 1,
        limit = 10,
        sortBy = 'markedAt',
        sortOrder = 'desc',
      } = pagination;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.AttendanceWhereInput = {};

      if (userId) where.userId = userId;
      if (sessionId) where.sessionId = sessionId;
      if (status) where.status = status;

      if (courseId) {
        where.session = {
          courseId,
        };
      }

      if (startDate || endDate) {
        where.markedAt = {};
        if (startDate) where.markedAt.gte = startDate;
        if (endDate) where.markedAt.lte = endDate;
      }

      // Get total count
      const total = await prisma.attendance.count({ where });

      // Get paginated data
      const attendanceRecords = await prisma.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          session: {
            select: {
              id: true,
              name: true,
              startTime: true,
              course: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      const data: UserAttendanceRecord[] = attendanceRecords.map(record => ({
        id: record.id,
        sessionId: record.sessionId,
        userId: record.userId,
        status: record.status,
        markedAt: record.markedAt,
        latitude: Number(record.latitude),
        longitude: Number(record.longitude),
        distanceFromSession: Number(record.distanceFromSession),
        selfieUrl: record.selfieUrl || undefined,
        session: {
          title: record.session.name,
          startTime: record.session.startTime,
          course: {
            name: record.session.course.name,
          },
        },
      }));

      return { data, total };
    } catch (error) {
      logger.error('Error finding attendance records:', error);
      throw error;
    }
  }

  /**
   * Get attendance statistics for a user
   */
  static async getUserStats(userId: string, courseId?: string): Promise<AttendanceStats> {
    try {
      const where: Prisma.AttendanceWhereInput = { userId };
      
      if (courseId) {
        where.session = {
          courseId,
        };
      }

      const attendanceRecords = await prisma.attendance.findMany({
        where,
        select: {
          status: true,
        },
      });

      const totalSessions = attendanceRecords.length;
      const presentCount = attendanceRecords.filter(a => a.status === 'PRESENT').length;
      const lateCount = attendanceRecords.filter(a => a.status === 'LATE').length;
      const absentCount = attendanceRecords.filter(a => a.status === 'ABSENT').length;
      const attendedSessions = presentCount + lateCount;
      const attendancePercentage = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0;

      return {
        totalSessions,
        attendedSessions,
        presentCount,
        lateCount,
        absentCount,
        attendancePercentage: Math.round(attendancePercentage * 100) / 100,
      };
    } catch (error) {
      logger.error('Error getting user attendance stats:', error);
      throw error;
    }
  }

  /**
   * Update attendance record
   */
  static async update(id: string, data: AttendanceUpdateData): Promise<Attendance> {
    try {
      const attendance = await prisma.attendance.update({
        where: { id },
        data,
      });
      
      logger.info(`Attendance updated: ${id}`);
      return attendance;
    } catch (error) {
      logger.error('Error updating attendance:', error);
      throw error;
    }
  }

  /**
   * Delete attendance record
   */
  static async delete(id: string): Promise<void> {
    try {
      await prisma.attendance.delete({
        where: { id },
      });
      
      logger.info(`Attendance deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting attendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance count for a session
   */
  static async getSessionAttendanceCount(sessionId: string): Promise<{
    total: number;
    present: number;
    late: number;
    absent: number;
  }> {
    try {
      const attendanceRecords = await prisma.attendance.findMany({
        where: { sessionId },
        select: { status: true },
      });

      const total = attendanceRecords.length;
      const present = attendanceRecords.filter(a => a.status === 'PRESENT').length;
      const late = attendanceRecords.filter(a => a.status === 'LATE').length;
      const absent = attendanceRecords.filter(a => a.status === 'ABSENT').length;

      return { total, present, late, absent };
    } catch (error) {
      logger.error('Error getting session attendance count:', error);
      throw error;
    }
  }

  /**
   * Get all attendance records for a session
   */
  static async findBySession(sessionId: string) {
    try {
      return await prisma.attendance.findMany({
        where: { sessionId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error finding attendance by session:', error);
      throw error;
    }
  }
}
