import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to create API responses with timestamp
const createResponse = <T = any>(success: boolean, message: string, data?: T): any => ({
  success,
  message,
  timestamp: new Date().toISOString(),
  ...(data && { data })
});

export class AdminController {
  /**
   * Get admin dashboard statistics
   * GET /api/attendance/admin/stats
   */
  static async getDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const [
        totalCourses,
        activeCourses,
        totalSessions,
        activeSessions,
        totalStudents,
        totalAttendanceRecords,
        recentSessions,
        courseStats
      ] = await Promise.all([
        prisma.course.count(),
        prisma.course.count({ where: { isActive: true } }),
        prisma.session.count(),
        prisma.session.count({ 
          where: { 
            isActive: true,
            endTime: { gt: new Date() }
          } 
        }),
        prisma.courseMember.count({ where: { role: 'PARTICIPANT' } }),
        prisma.attendance.count(),
        prisma.session.findMany({
          select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            isActive: true,
            course: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            _count: {
              select: {
                attendances: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        }),
        prisma.course.findMany({
          select: {
            id: true,
            name: true,
            code: true,
            isActive: true,
            _count: {
              select: {
                members: true,
                sessions: true
              }
            }
          },
          take: 5,
          orderBy: {
            members: {
              _count: 'desc'
            }
          }
        })
      ]);

      const response = createResponse(true, 'Dashboard statistics retrieved successfully', {
        overview: {
          totalCourses,
          activeCourses,
          totalSessions,
          activeSessions,
          totalStudents,
          totalAttendanceRecords
        },
        recentSessions,
        topCourses: courseStats
      });

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all courses with pagination and admin details
   * GET /api/attendance/admin/courses
   */
  static async getAllCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where condition
      const where: any = {};
      
      if (isActive !== undefined) {
        where.isActive = isActive === 'true';
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { code: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get courses and total count
      const [courses, totalCourses] = await Promise.all([
        prisma.course.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy as string]: sortOrder },
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            _count: {
              select: {
                members: true,
                sessions: true
              }
            }
          }
        }),
        prisma.course.count({ where })
      ]);

      const totalPages = Math.ceil(totalCourses / take);

      const response = createResponse(true, 'Courses retrieved successfully', {
        courses,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalCourses,
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
   * Get all sessions with pagination and admin details
   * GET /api/attendance/admin/sessions
   */
  static async getAllSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        courseId,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where condition
      const where: any = {};
      
      if (courseId) {
        where.courseId = courseId;
      }

      if (status) {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Get sessions and total count
      const [sessions, totalSessions] = await Promise.all([
        prisma.session.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy as string]: sortOrder },
          select: {
            id: true,
            name: true,
            description: true,
            startTime: true,
            endTime: true,
            isActive: true,
            createdAt: true,
            course: {
              select: {
                id: true,
                name: true,
                code: true
              }
            },
            createdBy: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            _count: {
              select: {
                attendances: true
              }
            }
          }
        }),
        prisma.session.count({ where })
      ]);

      const totalPages = Math.ceil(totalSessions / take);

      const response = createResponse(true, 'Sessions retrieved successfully', {
        sessions,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalSessions,
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
   * Get attendance records with pagination and filters
   * GET /api/attendance/admin/attendance
   */
  static async getAttendanceRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        courseId,
        sessionId,
        userId,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const skip = (Number(page) - 1) * Number(limit);
      const take = Number(limit);

      // Build where condition
      const where: any = {};
      
      if (courseId) {
        where.session = { courseId };
      }

      if (sessionId) {
        where.sessionId = sessionId;
      }

      if (userId) {
        where.userId = userId;
      }

      if (status) {
        where.status = status;
      }

      // Get attendance records and total count
      const [attendanceRecords, totalRecords] = await Promise.all([
        prisma.attendance.findMany({
          where,
          skip,
          take,
          orderBy: { [sortBy as string]: sortOrder },
          select: {
            id: true,
            status: true,
            markedAt: true,
            latitude: true,
            longitude: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true
              }
            },
            session: {
              select: {
                id: true,
                name: true,
                startTime: true,
                endTime: true,
                course: {
                  select: {
                    id: true,
                    name: true,
                    code: true
                  }
                }
              }
            }
          }
        }),
        prisma.attendance.count({ where })
      ]);

      const totalPages = Math.ceil(totalRecords / take);

      const response = createResponse(true, 'Attendance records retrieved successfully', {
        attendanceRecords,
        pagination: {
          currentPage: Number(page),
          totalPages,
          totalRecords,
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
   * Get course details with members and sessions
   * GET /api/attendance/admin/courses/:id
   */
  static async getCourseDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const course = await prisma.course.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          code: true,
          description: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          members: {
            select: {
              id: true,
              role: true,
              joinedAt: true,
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          sessions: {
            select: {
              id: true,
              name: true,
              startTime: true,
              endTime: true,
              isActive: true,
              _count: {
                select: {
                  attendances: true
                }
              }
            },
            orderBy: { startTime: 'desc' },
            take: 10
          },
          _count: {
            select: {
              members: true,
              sessions: true
            }
          }
        }
      });

      if (!course) {
        const response = createResponse(false, 'Course not found');
        res.status(404).json(response);
        return;
      }

      const response = createResponse(true, 'Course details retrieved successfully', course);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update course status (activate/deactivate)
   * PATCH /api/attendance/admin/courses/:id/status
   */
  static async updateCourseStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      const course = await prisma.course.findUnique({
        where: { id }
      });

      if (!course) {
        const response = createResponse(false, 'Course not found');
        res.status(404).json(response);
        return;
      }

      const updatedCourse = await prisma.course.update({
        where: { id },
        data: { isActive },
        select: {
          id: true,
          name: true,
          code: true,
          isActive: true,
          updatedAt: true
        }
      });

      const response = createResponse(true, 'Course status updated successfully', updatedCourse);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Force end a session
   * PATCH /api/attendance/admin/sessions/:id/end
   */
  static async forceEndSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const session = await prisma.session.findUnique({
        where: { id }
      });

      if (!session) {
        const response = createResponse(false, 'Session not found');
        res.status(404).json(response);
        return;
      }

      if (!session.isActive || session.endedAt) {
        const response = createResponse(false, 'Session is already ended');
        res.status(400).json(response);
        return;
      }

      const updatedSession = await prisma.session.update({
        where: { id },
        data: { 
          isActive: false,
          endedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          isActive: true,
          endedAt: true,
          course: {
            select: {
              name: true,
              code: true
            }
          }
        }
      });

      const response = createResponse(true, 'Session ended successfully', updatedSession);
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}
