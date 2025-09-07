/**
 * Attendance Service
 * 
 * Business logic layer for attendance-related operations.
 * Handles attendance marking, GPS validation, and attendance statistics.
 */

import { AttendanceStatus } from '@prisma/client';
import { AttendanceModel, SessionModel } from '../models';
import { 
  MarkAttendanceData, 
  AttendanceFilters, 
  PaginationOptions, 
  UserAttendanceRecord,
  AttendanceStats,
  GPSVerificationResult,
  GPSCoordinates 
} from '../types';

// Simple console logger until we implement proper logging
const logger = {
  info: (message: string) => console.log(`[INFO] ${message}`),
  error: (message: string, error?: any) => console.error(`[ERROR] ${message}`, error),
  warn: (message: string) => console.warn(`[WARN] ${message}`),
};

export class AttendanceService {
  /**
   * Mark attendance for a user in a session
   */
  static async markAttendance(
    userId: string, 
    data: MarkAttendanceData,
    ipAddress?: string
  ): Promise<{ success: boolean; message: string; attendance?: any }> {
    try {
      logger.info(`Attempting to mark attendance for user ${userId} in session ${data.sessionId}`);

      // 1. Check if user can mark attendance for this session
      const eligibility = await SessionModel.canMarkAttendance(data.sessionId, userId);
      if (!eligibility.canMark) {
        return {
          success: false,
          message: eligibility.reason || 'Cannot mark attendance',
        };
      }

      // 2. Get session details for GPS verification
      const session = await SessionModel.findById(data.sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Session not found',
        };
      }

      // 3. Verify GPS location
      const gpsVerification = AttendanceService.verifyGPSLocation(
        { latitude: data.latitude, longitude: data.longitude },
        { latitude: session.latitude, longitude: session.longitude },
        session.radiusMeters
      );

      if (!gpsVerification.isValid) {
        return {
          success: false,
          message: gpsVerification.message,
        };
      }

      // 4. Determine attendance status based on timing
      const attendanceStatus = AttendanceService.determineAttendanceStatus(
        new Date(),
        session.startTime,
        session.endTime,
        session.allowLateEntry,
        session.lateMinutes
      );

      // 5. Create attendance record
      const attendance = await AttendanceModel.create({
        sessionId: data.sessionId,
        userId,
        status: attendanceStatus,
        ipAddress,
        latitude: data.latitude,
        longitude: data.longitude,
        selfieUrl: data.selfieUrl,
        distanceFromSession: gpsVerification.distance,
      });

      logger.info(`Attendance marked successfully: ${attendance.id} with status ${attendanceStatus}`);

      return {
        success: true,
        message: `Attendance marked as ${attendanceStatus.toLowerCase()}`,
        attendance,
      };
    } catch (error) {
      logger.error('Error marking attendance:', error);
      return {
        success: false,
        message: 'Failed to mark attendance. Please try again.',
      };
    }
  }

  /**
   * Get attendance records with filters and pagination
   */
  static async getAttendanceRecords(
    filters: AttendanceFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<{ data: UserAttendanceRecord[]; total: number }> {
    try {
      return await AttendanceModel.findMany(filters, pagination);
    } catch (error) {
      logger.error('Error getting attendance records:', error);
      throw error;
    }
  }

  /**
   * Get user attendance statistics
   */
  static async getUserAttendanceStats(
    userId: string,
    courseId?: string
  ): Promise<AttendanceStats> {
    try {
      return await AttendanceModel.getUserStats(userId, courseId);
    } catch (error) {
      logger.error('Error getting user attendance stats:', error);
      throw error;
    }
  }

  /**
   * Get session attendance summary
   */
  static async getSessionAttendanceSummary(sessionId: string): Promise<{
    total: number;
    present: number;
    late: number;
    absent: number;
    attendanceRate: number;
  }> {
    try {
      const counts = await AttendanceModel.getSessionAttendanceCount(sessionId);
      const attendanceRate = counts.total > 0 
        ? Math.round(((counts.present + counts.late) / counts.total) * 100) 
        : 0;

      return {
        ...counts,
        attendanceRate,
      };
    } catch (error) {
      logger.error('Error getting session attendance summary:', error);
      throw error;
    }
  }

  /**
   * Get session attendance records
   */
  static async getSessionAttendanceRecords(sessionId: string) {
    try {
      return await AttendanceModel.findBySession(sessionId);
    } catch (error) {
      logger.error('Error getting session attendance records:', error);
      throw error;
    }
  }

  /**
   * Update attendance record (for manual corrections)
   */
  static async updateAttendance(
    attendanceId: string,
    updates: { status?: AttendanceStatus; selfieUrl?: string },
    updatedBy: string
  ): Promise<{ success: boolean; message: string; attendance?: any }> {
    try {
      // Check if attendance record exists
      const existingAttendance = await AttendanceModel.findById(attendanceId);
      if (!existingAttendance) {
        return {
          success: false,
          message: 'Attendance record not found',
        };
      }

      // Update the record
      const updatedAttendance = await AttendanceModel.update(attendanceId, updates);

      logger.info(`Attendance updated by ${updatedBy}: ${attendanceId}`);

      return {
        success: true,
        message: 'Attendance updated successfully',
        attendance: updatedAttendance,
      };
    } catch (error) {
      logger.error('Error updating attendance:', error);
      return {
        success: false,
        message: 'Failed to update attendance',
      };
    }
  }

  /**
   * Verify GPS location against session location
   */
  static verifyGPSLocation(
    userLocation: GPSCoordinates,
    sessionLocation: GPSCoordinates,
    radiusMeters: number
  ): GPSVerificationResult {
    try {
      const distance = AttendanceService.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        sessionLocation.latitude,
        sessionLocation.longitude
      );

      const isValid = distance <= radiusMeters;

      return {
        isValid,
        distance: Math.round(distance),
        message: isValid 
          ? 'Location verified successfully'
          : `You are ${Math.round(distance)}m away from the session location. Maximum allowed distance is ${radiusMeters}m.`,
      };
    } catch (error) {
      logger.error('Error verifying GPS location:', error);
      return {
        isValid: false,
        distance: 0,
        message: 'Unable to verify location',
      };
    }
  }

  /**
   * Calculate distance between two GPS coordinates using Haversine formula
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a = 
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Determine attendance status based on timing
   */
  static determineAttendanceStatus(
    currentTime: Date,
    sessionStart: Date,
    sessionEnd: Date,
    allowLateEntry: boolean,
    lateMinutes: number
  ): AttendanceStatus {
    // If before session starts, mark as present
    if (currentTime <= sessionStart) {
      return AttendanceStatus.PRESENT;
    }

    // If within session time, mark as present
    if (currentTime <= sessionEnd) {
      return AttendanceStatus.PRESENT;
    }

    // If late entry is allowed and within late window
    if (allowLateEntry) {
      const lateEntryEnd = new Date(sessionEnd);
      lateEntryEnd.setMinutes(lateEntryEnd.getMinutes() + lateMinutes);
      
      if (currentTime <= lateEntryEnd) {
        return AttendanceStatus.LATE;
      }
    }

    // Otherwise, mark as absent
    return AttendanceStatus.ABSENT;
  }

  /**
   * Bulk mark attendance (for instructor manually marking students)
   */
  static async bulkMarkAttendance(
    sessionId: string,
    attendanceData: Array<{
      userId: string;
      status: AttendanceStatus;
      notes?: string;
    }>,
    markedBy: string
  ): Promise<{ success: boolean; message: string; results: any[] }> {
    try {
      const results = [];

      for (const data of attendanceData) {
        try {
          // Check if attendance already exists
          const existingAttendance = await AttendanceModel.findByUserAndSession(
            data.userId, 
            sessionId
          );

          if (existingAttendance) {
            // Update existing attendance
            const updatedAttendance = await AttendanceModel.update(
              existingAttendance.id, 
              { status: data.status }
            );
            results.push({
              userId: data.userId,
              success: true,
              attendance: updatedAttendance,
              action: 'updated',
            });
          } else {
            // Create new attendance (manual entry with default location)
            const attendance = await AttendanceModel.create({
              sessionId,
              userId: data.userId,
              status: data.status,
              latitude: 0, // Default for manual entries
              longitude: 0,
              distanceFromSession: 0,
            });
            results.push({
              userId: data.userId,
              success: true,
              attendance,
              action: 'created',
            });
          }
        } catch (error) {
          results.push({
            userId: data.userId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      logger.info(`Bulk attendance marked by ${markedBy} for session ${sessionId}`);

      return {
        success: true,
        message: `Processed ${results.length} attendance records`,
        results,
      };
    } catch (error) {
      logger.error('Error in bulk mark attendance:', error);
      return {
        success: false,
        message: 'Failed to process bulk attendance',
        results: [],
      };
    }
  }

  /**
   * Delete attendance record (for instructor manual management)
   */
  static async deleteAttendance(
    attendanceId: string,
    deletedBy: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Check if attendance record exists
      const attendance = await AttendanceModel.findById(attendanceId);
      if (!attendance) {
        return {
          success: false,
          message: 'Attendance record not found',
        };
      }

      // Delete the attendance record
      await AttendanceModel.delete(attendanceId);

      logger.info(`Attendance record ${attendanceId} deleted by ${deletedBy}`);

      return {
        success: true,
        message: 'Attendance record deleted successfully',
      };
    } catch (error) {
      logger.error('Error deleting attendance:', error);
      return {
        success: false,
        message: 'Failed to delete attendance record',
      };
    }
  }

  /**
   * Add manual attendance record (for instructors)
   */
  static async addManualAttendance(
    sessionId: string,
    userId: string,
    status: string,
    markedAt: string,
    latitude: number,
    longitude: number,
    addedBy: string
  ) {
    try {
      // Verify session exists and is valid for manual attendance
      const session = await SessionModel.findById(sessionId);
      if (!session) {
        return {
          success: false,
          message: 'Session not found',
        };
      }

      // Check if attendance already exists for this user and session
      const existingAttendance = await AttendanceModel.findByUserAndSession(userId, sessionId);
      if (existingAttendance) {
        return {
          success: false,
          message: 'Attendance record already exists for this user in this session',
        };
      }

      // Create the manual attendance record
      const attendanceData = {
        sessionId,
        userId,
        status: status.toUpperCase() as AttendanceStatus,
        markedAt,
        latitude,
        longitude,
        distanceFromSession: 0, // Manual attendance doesn't check distance
        deviceInfo: { manual: true, addedBy },
      };

      const attendance = await AttendanceModel.create(attendanceData);

      logger.info(`Manual attendance added for user ${userId} in session ${sessionId} by ${addedBy}`);

      return {
        success: true,
        message: 'Manual attendance added successfully',
        data: attendance,
      };
    } catch (error) {
      logger.error('Error adding manual attendance:', error);
      return {
        success: false,
        message: 'Failed to add manual attendance record',
      };
    }
  }
}
