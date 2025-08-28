import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { GPSUtils } from '../utils/gps.utils';
import realtimeClient from '../config/realtime-client';

const prisma = new PrismaClient();

export class AttendanceController {

  static async mark(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { sessionId, latitude, longitude, selfieUrl } = req.body;

      const session = await prisma.session.findUnique({
        where: { id: sessionId },
      });

      if (!session) {
        res.status(404).json({ success: false, message: 'Session not found' });
        return;
      }

      if (!session.isActive) {
        res.status(400).json({ success: false, message: 'Session is not active' });
        return;
      }

      // Check if user is enrolled in the course

      const existingAttendance = await prisma.attendance.findUnique({
        where: {
          sessionId_userId: {
            sessionId,
            userId,
          },
        },
      });

      if (existingAttendance) {
        res.status(409).json({
          success: false,
          message: 'You have already marked your attendance for this session.',
        });
        return;
      }

      // session latitude/longitude are Prisma Decimal; convert to number
      const distance = GPSUtils.calculateDistance(
        { latitude, longitude },
        { latitude: Number(session.latitude), longitude: Number(session.longitude) }
      );

      if (distance > session.radiusMeters) {
        res.status(403).json({
          success: false,
          message: `You are too far from the session location. Distance: ${distance.toFixed(2)}m`,
        });
        return;
      }

      const now = new Date();
      const sessionStartTime = new Date(session.startTime);
      let status: 'PRESENT' | 'LATE' | 'ABSENT' = 'PRESENT';

      if (now > sessionStartTime) {
        const minutesLate = (now.getTime() - sessionStartTime.getTime()) / 60000;
        if (minutesLate > session.lateMinutes) {
          if (!session.allowLateEntry) {
            res.status(403).json({
              success: false,
              message: 'Late entry is not allowed for this session.',
            });
            return;
          }
          status = 'LATE';
        } else {
          status = 'PRESENT';
        }
      }

      if (session.requireSelfie && !selfieUrl) {
        res.status(400).json({
          success: false,
          message: 'Selfie is required for this session.',
        });
        return;
      }

      // Use Prisma transaction for atomic operations
      const attendance = await prisma.$transaction(async (tx) => {
        // 1. Create attendance record
        const newAttendance = await tx.attendance.create({
          data: {
            sessionId,
            userId,
            status,
            ipAddress: req.ip,
            latitude,
            longitude,
            selfieUrl,
            distanceFromSession: distance,
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        });

        // 2. Update session with latest attendance timestamp (atomic with attendance creation)
        await tx.session.update({
          where: { id: sessionId },
          data: {
            updatedAt: new Date()
          }
        });

        return newAttendance;
      });

      // 3. Send real-time notification AFTER successful transaction
      const user = await prisma.user.findUnique({
        where: { id: attendance.userId },
        select: { firstName: true, lastName: true }
      });

      realtimeClient.emit('attendance:marked', {
        sessionId,
        userId: attendance.userId,
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown User',
        status: attendance.status,
        markedAt: attendance.markedAt,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: 'Attendance marked successfully',
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSessionAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId } = req.params;
      const userId = req.user!.userId;

      const member = await prisma.courseMember.findFirst({
        where: {
          course: {
            sessions: {
              some: { id: sessionId },
            },
          },
          userId,
        },
      });

      if (!member) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this course',
        });
        return;
      }

      const attendance = await prisma.attendance.findMany({
        where: { sessionId },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      res.status(200).json({
        success: true,
        message: 'Attendance records retrieved successfully',
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserAttendance(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { courseId, userId } = req.params;

      // Optional: Check if the requesting user has permission to view this.
      // For simplicity, allowing users to view their own attendance.
      if (req.user!.userId !== userId) {
        // Add role-based access for admins/instructors if needed
        res.status(403).json({
          success: false,
          message: 'You can only view your own attendance records.',
        });
        return;
      }

      const attendance = await prisma.attendance.findMany({
        where: {
          userId,
          session: {
            courseId,
          },
        },
        include: {
          session: {
            select: {
              id: true,
              name: true,
              startTime: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      res.status(200).json({
        success: true,
        message: 'User attendance records retrieved successfully',
        data: attendance,
      });
    } catch (error) {
      next(error);
    }
  }
}
