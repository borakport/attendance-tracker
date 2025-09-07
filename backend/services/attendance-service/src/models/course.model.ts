/**
 * Course Model
 * 
 * Data access layer for course-related database operations.
 * Provides methods for creating, reading, updating, and deleting courses
 * with proper error handling and type safety.
 */

import { PrismaClient, Course, CourseMember, CourseRole } from '@prisma/client';
import { 
  CreateCourseData, 
  UpdateCourseData, 
  EnrollCourseData,
  PaginationOptions 
} from '../types';
import { CodeGenerator } from '../utils/code.generator';

const prisma = new PrismaClient();

// Simple console logger until we implement proper logging
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
};

export interface CourseWithStats {
  id: string;
  name: string;
  description?: string;
  code: string;
  ownerId: string;
  settings: any;
  isActive: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  memberCount: number;
  sessionCount: number;
  owner: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface CourseWithMembers extends Course {
  members: {
    id: string;
    role: CourseRole;
    joinedAt: Date;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
    };
  }[];
  sessions: {
    id: string;
    name: string;
    startTime: Date;
    endTime: Date;
    isActive: boolean;
  }[];
}

export class CourseModel {
  /**
   * Create a new course
   */
  static async create(data: CreateCourseData): Promise<Course> {
    try {
      // Generate unique course code
      const code = await CourseModel.generateCourseCode();
      
      const course = await prisma.course.create({
        data: {
          name: data.name,
          description: data.description,
          code,
          ownerId: data.instructorId,
          settings: {
            gpsRadius: 50,
            allowLateEntry: true,
            lateEntryMinutes: 15,
            requireSelfie: false,
            autoEndSession: true,
            autoEndMinutes: 120,
          },
        },
      });
      
      logger.info(`Course created: ${course.id} by instructor ${data.instructorId}`);
      return course;
    } catch (error) {
      logger.error('Error creating course:', error);
      throw error;
    }
  }

  /**
   * Find course by ID
   */
  static async findById(id: string): Promise<CourseWithMembers | null> {
    try {
      return await prisma.course.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          members: {
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
            orderBy: {
              joinedAt: 'asc',
            },
          },
          sessions: {
            select: {
              id: true,
              name: true,
              startTime: true,
              endTime: true,
              isActive: true,
            },
            orderBy: {
              startTime: 'desc',
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error finding course by ID:', error);
      throw error;
    }
  }

  /**
   * Find course by code
   */
  static async findByCode(code: string): Promise<Course | null> {
    try {
      return await prisma.course.findUnique({
        where: { code },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } catch (error) {
      logger.error('Error finding course by code:', error);
      throw error;
    }
  }

  /**
   * Get courses for an instructor
   */
  static async getInstructorCourses(
    instructorId: string,
    pagination: PaginationOptions = {}
  ): Promise<{ data: CourseWithStats[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = pagination;

      const skip = (page - 1) * limit;

      const total = await prisma.course.count({
        where: { ownerId: instructorId },
      });

      const courses = await prisma.course.findMany({
        where: { ownerId: instructorId },
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true,
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

      const data: CourseWithStats[] = courses.map(course => ({
        ...course,
        description: course.description || undefined,
        startDate: course.startDate || undefined,
        endDate: course.endDate || undefined,
        memberCount: course._count.members,
        sessionCount: course._count.sessions,
        owner: course.owner,
      }));

      return { data, total };
    } catch (error) {
      logger.error('Error getting instructor courses:', error);
      throw error;
    }
  }

  /**
   * Get courses for a student
   */
  static async getStudentCourses(
    studentId: string,
    pagination: PaginationOptions = {}
  ): Promise<{ data: CourseWithStats[]; total: number }> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = pagination;

      const skip = (page - 1) * limit;

      const total = await prisma.courseMember.count({
        where: { userId: studentId },
      });

      const courseMembers = await prisma.courseMember.findMany({
        where: { userId: studentId },
        skip,
        take: limit,
        include: {
          course: {
            include: {
              owner: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
              _count: {
                select: {
                  members: true,
                  sessions: true,
                },
              },
            },
          },
        },
        orderBy: {
          course: {
            [sortBy]: sortOrder,
          },
        },
      });

      const data: CourseWithStats[] = courseMembers.map(member => ({
        ...member.course,
        description: member.course.description || undefined,
        startDate: member.course.startDate || undefined,
        endDate: member.course.endDate || undefined,
        memberCount: member.course._count.members,
        sessionCount: member.course._count.sessions,
        owner: member.course.owner,
      }));

      return { data, total };
    } catch (error) {
      logger.error('Error getting student courses:', error);
      throw error;
    }
  }

  /**
   * Update course
   */
  static async update(id: string, data: UpdateCourseData): Promise<Course> {
    try {
      const course = await prisma.course.update({
        where: { id },
        data,
      });
      
      logger.info(`Course updated: ${id}`);
      return course;
    } catch (error) {
      logger.error('Error updating course:', error);
      throw error;
    }
  }

  /**
   * Delete course
   */
  static async delete(id: string): Promise<void> {
    try {
      await prisma.course.delete({
        where: { id },
      });
      
      logger.info(`Course deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting course:', error);
      throw error;
    }
  }

  /**
   * Enroll student in course
   */
  static async enrollStudent(
    userId: string,
    data: EnrollCourseData
  ): Promise<CourseMember> {
    try {
      // Find course by invite code
      const course = await prisma.course.findUnique({
        where: { code: data.inviteCode },
      });

      if (!course) {
        throw new Error('Invalid course code');
      }

      if (!course.isActive) {
        throw new Error('Course is not active');
      }

      // Check if already enrolled
      const existingMembership = await prisma.courseMember.findUnique({
        where: {
          courseId_userId: {
            courseId: course.id,
            userId,
          },
        },
      });

      if (existingMembership) {
        throw new Error('Already enrolled in this course');
      }

      const membership = await prisma.courseMember.create({
        data: {
          courseId: course.id,
          userId,
          role: CourseRole.PARTICIPANT,
        },
      });
      
      logger.info(`Student ${userId} enrolled in course ${course.id}`);
      return membership;
    } catch (error) {
      logger.error('Error enrolling student:', error);
      throw error;
    }
  }

  /**
   * Remove student from course
   */
  static async removeStudent(courseId: string, userId: string): Promise<void> {
    try {
      await prisma.courseMember.delete({
        where: {
          courseId_userId: {
            courseId,
            userId,
          },
        },
      });
      
      logger.info(`Student ${userId} removed from course ${courseId}`);
    } catch (error) {
      logger.error('Error removing student:', error);
      throw error;
    }
  }

  /**
   * Check if user is enrolled in course
   */
  static async isUserEnrolled(courseId: string, userId: string): Promise<boolean> {
    try {
      const membership = await prisma.courseMember.findUnique({
        where: {
          courseId_userId: {
            courseId,
            userId,
          },
        },
      });

      return !!membership;
    } catch (error) {
      logger.error('Error checking enrollment:', error);
      throw error;
    }
  }

  /**
   * Get course members
   */
  static async getCourseMembers(courseId: string): Promise<CourseMember[]> {
    try {
      return await prisma.courseMember.findMany({
        where: { courseId },
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
        orderBy: {
          joinedAt: 'asc',
        },
      });
    } catch (error) {
      logger.error('Error getting course members:', error);
      throw error;
    }
  }

  /**
   * Generate unique course code with enhanced duplicate prevention
   */
  private static async generateCourseCode(): Promise<string> {
    const MAX_RETRIES = 10;
    let attempts = 0;
    
    while (attempts < MAX_RETRIES) {
      attempts++;
      
      // Use enhanced CodeGenerator with better collision resistance
      const code = CodeGenerator.generateCourseCode();
      
      // Check if code exists in database
      const existingCourse = await prisma.course.findUnique({
        where: { code },
        select: { id: true }, // Only select id for performance
      });

      if (!existingCourse) {
        return code;
      }
      
      // Log collision for monitoring (in production, use proper logging)
      console.warn(`Course code collision detected: ${code} (attempt ${attempts}/${MAX_RETRIES})`);
    }
    
    // If we've exhausted retries, generate a timestamp-based fallback
    const fallbackCode = this.generateFallbackCode();
    console.error(`Max retries exceeded for course code generation. Using fallback: ${fallbackCode}`);
    
    return fallbackCode;
  }

  /**
   * Generate a fallback course code using timestamp to ensure uniqueness
   */
  private static generateFallbackCode(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 4).toUpperCase();
    
    // Take last 6 characters, ensuring it's always 6 digits
    const combined = (random + timestamp).slice(-6);
    return combined.padStart(6, 'A'); // Pad with 'A' if somehow less than 6 chars
  }
}
