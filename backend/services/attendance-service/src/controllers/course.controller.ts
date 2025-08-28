import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth.middleware';
import { CodeGenerator } from '../utils/code.generator';
import realtimeClient from '../config/realtime-client';

const prisma = new PrismaClient();

export class CourseController {

  static async create(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, code, startDate, endDate, settings } = req.body;
      const userId = req.user!.userId;

      // Generate unique course code
      const courseCode = code || CodeGenerator.generateCourseCode(name.substring(0, 3));

      // Check if code already exists
      const existingCourse = await prisma.course.findUnique({
        where: { code: courseCode },
      });

      if (existingCourse) {
        res.status(400).json({
          success: false,
        });
        return;
      }

      // Create course
      const course = await prisma.course.create({
        data: {
          name,
          description,
          code: courseCode,
          ownerId: userId,
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          settings: settings || {
            gpsRadius: 50,
            allowLateEntry: true,
            lateEntryMinutes: 15,
            requireSelfie: false,
            autoEndSession: true,
            autoEndMinutes: 120,
          },
          members: {
            create: {
              userId: userId,
              role: 'OWNER',
            },
          },
        },
      });

      // Emit event to realtime service
      realtimeClient.emit('course:created', {
        courseId: course.id,
        ownerId: userId,
        courseName: course.name,
        timestamp: new Date().toISOString(),
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully',
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const userRole = req.user!.role;

      let courses;

      if (userRole === 'ADMIN') {
        // Admin can see all courses
        courses = await prisma.course.findMany({
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            _count: {
              select: {
                members: true,
                sessions: true,
              },
            },
          },
        });
      } else {
        // Users see only their courses
        courses = await prisma.course.findMany({
          where: {
            members: {
              some: {
                userId,
              },
            },
          },
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            members: {
              where: { userId },
              select: { role: true },
            },
            _count: {
              select: {
                members: true,
                sessions: true,
              },
            },
          },
        });
      }

      res.status(200).json({
        success: true,
        message: 'Courses retrieved successfully',
        data: courses,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  role: true,
                },
              },
            },
          },
          sessions: {
            orderBy: { startTime: 'desc' },
            take: 10,
          },
          _count: {
            select: {
              members: true,
              sessions: true,
            },
          },
        },
      });

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found',
        });
        return;
      }

      // Check if user is a member or admin
  const isMember = course.members.some((m: any) => m.userId === userId);
      const isAdmin = req.user!.role === 'ADMIN';

      if (!isMember && !isAdmin) {
        res.status(403).json({
          success: false,
          message: 'You are not a member of this course',
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Course retrieved successfully',
        data: course,
      });
    } catch (error) {
      next(error);
    }
  }

  static async enroll(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      // Support either courseCode or code field in payload
      const { courseCode, code } = req.body;
      const userId = req.user!.userId;

        const lookupCode = courseCode || code; // support either payload key
        const course = await prisma.course.findUnique({
          where: { code: lookupCode },
      });

      if (!course) {
        res.status(404).json({ success: false, message: 'Course not found' });
        return;
      }

      const existingMember = await prisma.courseMember.findUnique({
        where: {
          courseId_userId: {
            courseId: course.id,
            userId,
          },
        },
      });

      if (existingMember) {
        res.status(409).json({
          success: false,
          message: 'You are already enrolled in this course',
        });
        return;
      }

      const member = await prisma.courseMember.create({
        data: {
          courseId: course.id,
          userId,
          role: 'PARTICIPANT',
        },
      });

      res.status(201).json({
        success: true,
        message: 'Enrolled in course successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMembers(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const members = await prisma.courseMember.findMany({
        where: { courseId: id },
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
      res.status(200).json({
        success: true,
        message: 'Members retrieved successfully',
        data: members,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMemberRole(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, userId } = req.params;
      const { role } = req.body;

      const member = await prisma.courseMember.update({
        where: {
          courseId_userId: {
            courseId: id,
            userId,
          },
        },
        data: { role },
      });

      res.status(200).json({
        success: true,
        message: 'Member role updated successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id, userId } = req.params;

      await prisma.courseMember.delete({
        where: {
          courseId_userId: {
            courseId: id,
            userId,
          },
        },
      });

      res.status(200).json({
        success: true,
        message: 'Member removed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getCourseSessions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const sessions = await prisma.session.findMany({
        where: { courseId: id },
        orderBy: {
          startTime: 'desc',
        },
      });
      res.status(200).json({
        success: true,
        message: 'Course sessions retrieved successfully',
        data: sessions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async leave(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const member = await prisma.courseMember.findUnique({
        where: {
          courseId_userId: {
            courseId: id,
            userId,
          },
        },
      });

      if (!member) {
        res.status(404).json({
          success: false,
          message: 'You are not a member of this course',
        });
        return;
      }

      if (member.role === 'OWNER') {
        res.status(400).json({
          success: false,
          message: 'Course owner cannot leave the course',
        });
        return;
      }

      await prisma.courseMember.delete({
        where: {
          courseId_userId: {
            courseId: id,
            userId,
          },
        },
      });

      // Emit event
      realtimeClient.emit('course:left', {
        courseId: id,
        userId,
        timestamp: new Date().toISOString(),
      });

      res.status(200).json({
        success: true,
        message: 'Successfully left the course',
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      // Check ownership
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          members: {
            where: { userId },
          },
        },
      });

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found',
        });
        return;
      }

      const userMember = course.members[0];
  if (!userMember || !['OWNER', 'MODERATOR'].includes(userMember.role as string)) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to update this course',
        });
        return;
      }

      const updatedCourse = await prisma.course.update({
        where: { id },
        data: req.body,
      });

      res.status(200).json({
        success: true,
        message: 'Course updated successfully',
        data: updatedCourse,
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const course = await prisma.course.findUnique({
        where: { id },
      });

      if (!course) {
        res.status(404).json({
          success: false,
          message: 'Course not found',
        });
        return;
      }

      if (course.ownerId !== userId && req.user!.role !== 'ADMIN') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this course',
        });
        return;
      }

      await prisma.course.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }
}
