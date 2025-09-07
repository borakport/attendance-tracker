/**
 * Models Index
 * 
 * Central export file for all data models in the attendance service.
 * Provides easy import access to all model classes.
 */

export { AttendanceModel } from './attendance.model';
export { SessionModel } from './session.model';
export { CourseModel } from './course.model';

// Re-export model-related types
export type { 
  AttendanceCreateData, 
  AttendanceUpdateData 
} from './attendance.model';

export type { 
  CourseWithStats, 
  CourseWithMembers 
} from './course.model';
