/**
 * Course Service
 * 
 * Business logic layer for course-related operations.
 * Handles course creation, enrollment, management, and access control.
 */

import { Course, CourseMember } from '@prisma/client';
import { CourseModel } from '../models';
import { 
  CreateCourseData, 
  UpdateCourseData, 
  EnrollCourseData,
  PaginationOptions 
} from '../types';
import { CourseWithStats, CourseWithMembers } from '../models/course.model';

// Simple console logger until we implement proper logging
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
};

export class CourseService {
  /**
   * Create a new course
   */
  static async createCourse(
    data: CreateCourseData,
    instructorId: string
  ): Promise<{ success: boolean; message: string; course?: Course }> {
    try {
      logger.info(`Creating course for instructor ${instructorId}`);

      // Validate course data
      const validation = CourseService.validateCourseData(data);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.message,
        };
      }

      // Create the course
      const course = await CourseModel.create({
        ...data,
        instructorId,
      });

      logger.info(`Course created successfully: ${course.id}`);

      return {
        success: true,
        message: 'Course created successfully',
        course,
      };
    } catch (error) {
      logger.error('Error creating course:', error);
      return {
        success: false,
        message: 'Failed to create course. Please try again.',
      };
    }
  }

  /**
   * Get course by ID with full details
   */
  static async getCourseById(courseId: string): Promise<CourseWithMembers | null> {
    try {
      return await CourseModel.findById(courseId);
    } catch (error) {
      logger.error('Error getting course by ID:', error);
      throw error;
    }
  }

  /**
   * Get course by invite code
   */
  static async getCourseByCode(code: string): Promise<Course | null> {
    try {
      return await CourseModel.findByCode(code);
    } catch (error) {
      logger.error('Error getting course by code:', error);
      throw error;
    }
  }

  /**
   * Get instructor's courses
   */
  static async getInstructorCourses(
    instructorId: string,
    pagination: PaginationOptions = {}
  ): Promise<{ data: CourseWithStats[]; total: number }> {
    try {
      return await CourseModel.getInstructorCourses(instructorId, pagination);
    } catch (error) {
      logger.error('Error getting instructor courses:', error);
      throw error;
    }
  }

  /**
   * Get student's enrolled courses
   */
  static async getStudentCourses(
    studentId: string,
    pagination: PaginationOptions = {}
  ): Promise<{ data: CourseWithStats[]; total: number }> {
    try {
      return await CourseModel.getStudentCourses(studentId, pagination);
    } catch (error) {
      logger.error('Error getting student courses:', error);
      throw error;
    }
  }

  /**
   * Update course
   */
  static async updateCourse(
    courseId: string,
    updates: UpdateCourseData,
    instructorId: string
  ): Promise<{ success: boolean; message: string; course?: Course }> {
    try {
      // 1. Verify ownership
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return {
          success: false,
          message: 'Course not found',
        };
      }

      if (course.ownerId !== instructorId) {
        return {
          success: false,
          message: 'You are not authorized to update this course',
        };
      }

      // 2. Validate updates
      if (updates.name || updates.description) {
        const validation = CourseService.validateCourseData({
          name: updates.name || course.name,
          description: updates.description || course.description || undefined,
          instructorId,
        });
        
        if (!validation.isValid) {
          return {
            success: false,
            message: validation.message,
          };
        }
      }

      // 3. Validate endDate if provided
      if (updates.endDate) {
        const endDate = new Date(updates.endDate);
        
        if (course.startDate) {
          const startDate = new Date(course.startDate);
          
          if (endDate <= startDate) {
            return {
              success: false,
              message: 'End date must be after the start date',
            };
          }
        }
        
        if (endDate <= new Date()) {
          return {
            success: false,
            message: 'End date must be in the future',
          };
        }
      }

      // 4. Validate settings if provided
      if (updates.settings) {
        const settings = updates.settings;
        
        if (settings.gpsRadius !== undefined && (settings.gpsRadius < 10 || settings.gpsRadius > 500)) {
          return {
            success: false,
            message: 'GPS radius must be between 10 and 500 meters',
          };
        }
        
        if (settings.lateEntryMinutes !== undefined && (settings.lateEntryMinutes < 1 || settings.lateEntryMinutes > 60)) {
          return {
            success: false,
            message: 'Late entry minutes must be between 1 and 60',
          };
        }
        
        if (settings.autoEndMinutes !== undefined && (settings.autoEndMinutes < 15 || settings.autoEndMinutes > 480)) {
          return {
            success: false,
            message: 'Auto end minutes must be between 15 and 480',
          };
        }

        // Merge settings with existing settings
        const currentSettings = course.settings as any || {};
        updates.settings = {
          ...currentSettings,
          ...settings,
        };
      }

      // 5. Update the course
      const updatedCourse = await CourseModel.update(courseId, updates);

      logger.info(`Course updated: ${courseId} by instructor ${instructorId}`);

      return {
        success: true,
        message: 'Course updated successfully',
        course: updatedCourse,
      };
    } catch (error) {
      logger.error('Error updating course:', error);
      return {
        success: false,
        message: 'Failed to update course',
      };
    }
  }

  /**
   * Delete course
   */
  static async deleteCourse(
    courseId: string,
    instructorId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Verify ownership
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return {
          success: false,
          message: 'Course not found',
        };
      }

      if (course.ownerId !== instructorId) {
        return {
          success: false,
          message: 'You are not authorized to delete this course',
        };
      }

      // 2. Check if course has sessions or non-instructor members
      if (course.sessions.length > 0) {
        return {
          success: false,
          message: 'Cannot delete a course that has sessions. Please delete all sessions first.',
        };
      }

      // Count members excluding the instructor/owner
      const nonInstructorMembers = course.members.filter(member => 
        member.user.id !== instructorId
      );

      if (nonInstructorMembers.length > 0) {
        return {
          success: false,
          message: 'Cannot delete a course that has enrolled students. Please remove all students first.',
        };
      }

      // 3. Delete the course
      await CourseModel.delete(courseId);

      logger.info(`Course deleted: ${courseId} by instructor ${instructorId}`);

      return {
        success: true,
        message: 'Course deleted successfully',
      };
    } catch (error) {
      logger.error('Error deleting course:', error);
      return {
        success: false,
        message: 'Failed to delete course',
      };
    }
  }

  /**
   * Enroll student in course
   */
  static async enrollStudent(
    studentId: string,
    enrollmentData: EnrollCourseData
  ): Promise<{ success: boolean; message: string; membership?: CourseMember }> {
    try {
      logger.info(`Enrolling student ${studentId} in course with code ${enrollmentData.inviteCode}`);

      // Validate invite code format
      if (!enrollmentData.inviteCode || enrollmentData.inviteCode.length !== 6) {
        return {
          success: false,
          message: 'Invalid invite code format',
        };
      }

      // Attempt enrollment
      const membership = await CourseModel.enrollStudent(studentId, enrollmentData);

      logger.info(`Student ${studentId} enrolled successfully`);

      return {
        success: true,
        message: 'Successfully enrolled in course',
        membership,
      };
    } catch (error) {
      logger.error('Error enrolling student:', error);
      
      // Handle specific errors
      if (error instanceof Error) {
        if (error.message === 'Invalid course code') {
          return {
            success: false,
            message: 'Invalid invite code. Please check and try again.',
          };
        }
        if (error.message === 'Course is not active') {
          return {
            success: false,
            message: 'This course is no longer accepting enrollments.',
          };
        }
        if (error.message === 'Already enrolled in this course') {
          return {
            success: false,
            message: 'You are already enrolled in this course.',
          };
        }
      }

      return {
        success: false,
        message: 'Failed to enroll in course. Please try again.',
      };
    }
  }

  /**
   * Remove student from course
   */
  static async removeStudent(
    courseId: string,
    studentId: string,
    instructorId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Verify instructor owns the course
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return {
          success: false,
          message: 'Course not found',
        };
      }

      if (course.ownerId !== instructorId) {
        return {
          success: false,
          message: 'You are not authorized to remove students from this course',
        };
      }

      // 2. Check if student is enrolled
      const isEnrolled = await CourseModel.isUserEnrolled(courseId, studentId);
      if (!isEnrolled) {
        return {
          success: false,
          message: 'Student is not enrolled in this course',
        };
      }

      // 3. Remove the student
      await CourseModel.removeStudent(courseId, studentId);

      logger.info(`Student ${studentId} removed from course ${courseId} by instructor ${instructorId}`);

      return {
        success: true,
        message: 'Student removed from course successfully',
      };
    } catch (error) {
      logger.error('Error removing student:', error);
      return {
        success: false,
        message: 'Failed to remove student from course',
      };
    }
  }

  /**
   * Student leave course
   */
  static async leaveCourse(
    courseId: string,
    studentId: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 1. Check if student is enrolled
      const isEnrolled = await CourseModel.isUserEnrolled(courseId, studentId);
      if (!isEnrolled) {
        return {
          success: false,
          message: 'You are not enrolled in this course',
        };
      }

      // 2. Remove the student
      await CourseModel.removeStudent(courseId, studentId);

      logger.info(`Student ${studentId} left course ${courseId}`);

      return {
        success: true,
        message: 'Successfully left the course',
      };
    } catch (error) {
      logger.error('Error leaving course:', error);
      return {
        success: false,
        message: 'Failed to leave course',
      };
    }
  }

  /**
   * Get course members
   */
  static async getCourseMembers(
    courseId: string,
    requestingUserId: string
  ): Promise<{ success: boolean; message: string; members?: CourseMember[] }> {
    try {
      // 1. Verify user has access to this course (instructor or enrolled student)
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return {
          success: false,
          message: 'Course not found',
        };
      }

      const isInstructor = course.ownerId === requestingUserId;
      const isEnrolled = await CourseModel.isUserEnrolled(courseId, requestingUserId);

      if (!isInstructor && !isEnrolled) {
        return {
          success: false,
          message: 'You do not have access to this course',
        };
      }

      // 2. Get course members
      const members = await CourseModel.getCourseMembers(courseId);

      return {
        success: true,
        message: 'Course members retrieved successfully',
        members,
      };
    } catch (error) {
      logger.error('Error getting course members:', error);
      return {
        success: false,
        message: 'Failed to retrieve course members',
      };
    }
  }

  /**
   * Check if user has access to course
   */
  static async checkCourseAccess(
    courseId: string,
    userId: string
  ): Promise<{ hasAccess: boolean; role?: 'instructor' | 'student' }> {
    try {
      const course = await CourseModel.findById(courseId);
      if (!course) {
        return { hasAccess: false };
      }

      // Check if user is the instructor
      if (course.ownerId === userId) {
        return { hasAccess: true, role: 'instructor' };
      }

      // Check if user is enrolled as student
      const isEnrolled = await CourseModel.isUserEnrolled(courseId, userId);
      if (isEnrolled) {
        return { hasAccess: true, role: 'student' };
      }

      return { hasAccess: false };
    } catch (error) {
      logger.error('Error checking course access:', error);
      return { hasAccess: false };
    }
  }

  /**
   * Validate course data
   */
  private static validateCourseData(
    data: CreateCourseData
  ): { isValid: boolean; message: string } {
    // Validate course name
    if (!data.name || data.name.trim().length < 3) {
      return {
        isValid: false,
        message: 'Course name must be at least 3 characters long',
      };
    }

    if (data.name.length > 100) {
      return {
        isValid: false,
        message: 'Course name cannot exceed 100 characters',
      };
    }

    // Validate description if provided
    if (data.description && data.description.length > 500) {
      return {
        isValid: false,
        message: 'Course description cannot exceed 500 characters',
      };
    }

    return {
      isValid: true,
      message: 'Course data is valid',
    };
  }
}
