import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import realtimeClient from '../config/realtime-client';

const prisma = new PrismaClient();

export class SessionController {

  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const {
        courseId,
        name,
        description,
        startTime,
        endTime,
        latitude,
        longitude,
        radiusMeters,
        locationName,
        allowLateEntry,
        lateMinutes,
        requireSelfie,
      } = req.body;

      // Check if user has permission
      const member = await prisma.courseMember.findUnique({
        where: {
          courseId_userId: {
            courseId,
            userId,
          },
        },
      });

  if (!member || member.role === 'PARTICIPANT') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to create sessions',
        });
        return;
      }

      // No access code generation needed anymore
      const session = await prisma.session.create({
        data: {
          courseId,
          createdById: userId,
          name,
          description,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          latitude,
          longitude,
          radiusMeters: radiusMeters || 50,
          locationName,
          allowLateEntry: allowLateEntry ?? true,
          lateMinutes: lateMinutes || 15,
          requireSelfie: requireSelfie ?? false,
        },
        include: {
          course: {
            select: {
              name: true,
              members: {
                select: { userId: true },
              },
            },
          },
        },
      });

      // Notify all course members
      realtimeClient.emit('session:created', {
        sessionId: session.id,
        courseId,
        courseName: session.course.name,
        sessionName: session.name,
        startTime: session.startTime,
        memberIds: session.course.members.map((m: { userId: string }) => m.userId),
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: 'Session created successfully',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  static async start(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const { actualLatitude, actualLongitude } = req.body;

      const session = await prisma.session.findUnique({
        where: { id },
        include: {
          course: {
            include: {
              members: {
                where: { userId },
              },
            },
          },
        },
      });

      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Session not found',
        });
        return;
      }

      const userMember = session.course.members[0];
  if (!userMember || userMember.role === 'PARTICIPANT') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to start this session',
        });
        return;
      }

      if (session.isActive) {
        res.status(400).json({
          success: false,
          message: 'Session is already active',
        });
        return;
      }

      const updatedSession = await prisma.session.update({
        where: { id },
        data: {
          isActive: true,
          startedAt: new Date(),
          latitude: actualLatitude || session.latitude,
          longitude: actualLongitude || session.longitude,
        },
      });

      // Get all course members for notification
      const courseMembers = await prisma.courseMember.findMany({
        where: { courseId: session.courseId },
        select: { userId: true },
      });

      // Notify all members using centralized client
      realtimeClient.emit('session:started', {
        sessionId: id,
        courseId: session.courseId,
        sessionName: session.name,
        memberIds: courseMembers.map((m: { userId: string }) => m.userId),
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: 'Session started successfully',
        data: updatedSession,
      });
    } catch (error) {
      next(error);
    }
  }

  static async end(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;
      const { notes } = req.body;

      const session = await prisma.session.findUnique({
        where: { id },
        include: {
          course: {
            include: {
              members: {
                where: { userId },
              },
            },
          },
        },
      });

      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Session not found',
        });
        return;
      }

      const userMember = session.course.members[0];
  if (!userMember || userMember.role === 'PARTICIPANT') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to end this session',
        });
        return;
      }

      if (!session.isActive) {
        res.status(400).json({
          success: false,
          message: 'Session is not active',
        });
        return;
      }

      const updatedSession = await prisma.session.update({
        where: { id },
        data: {
          isActive: false,
          endedAt: new Date(),
          notes,
        },
      });

      // Get attendance statistics
      const attendanceStats = await prisma.attendance.groupBy({
        by: ['status'],
        where: { sessionId: id },
        _count: true,
      });

      // Notify all members
      realtimeClient.emit('session:ended', {
        sessionId: id,
        courseId: session.courseId,
        stats: attendanceStats,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: 'Session ended successfully',
        data: {
          session: updatedSession,
          stats: attendanceStats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getActive(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const activeSessions = await prisma.session.findMany({
        where: {
          isActive: true,
          course: {
            members: {
              some: { userId },
            },
          },
        },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          _count: {
            select: {
              attendances: true,
            },
          },
        },
        orderBy: { startedAt: 'desc' },
      });

      res.status(200).json({
        success: true,
        message: 'Active sessions retrieved successfully',
        data: activeSessions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const session = await prisma.session.findUnique({
        where: { id },
        include: {
          course: {
            select: {
              id: true,
              name: true,
              members: {
                where: { userId },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          attendances: {
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
          },
          _count: {
            select: {
              attendances: true,
            },
          },
        },
      });

      if (!session) {
        res.status(404).json({
          success: false,
          message: 'Session not found',
        });
        return;
      }

      if (session.course.members.length === 0) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this course',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Session retrieved successfully',
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }
}
