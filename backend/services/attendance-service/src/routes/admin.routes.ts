import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorize.middleware';

const router = Router();

// All admin routes require authentication and admin authorization
router.use(authenticate);
router.use(authorize(['ADMIN']));

/**
 * Admin Dashboard and Statistics Routes
 */

// Get admin dashboard statistics
router.get('/stats', AdminController.getDashboardStats);

/**
 * Course Management Routes
 */

// Get all courses with admin details
router.get('/courses', AdminController.getAllCourses);

// Get specific course details with members and sessions
router.get('/courses/:id', AdminController.getCourseDetails);

// Update course status (activate/deactivate)
router.patch('/courses/:id/status', AdminController.updateCourseStatus);

/**
 * Session Management Routes
 */

// Get all sessions with admin details
router.get('/sessions', AdminController.getAllSessions);

// Force end a session
router.patch('/sessions/:id/end', AdminController.forceEndSession);

/**
 * Attendance Management Routes
 */

// Get attendance records with pagination and filters
router.get('/attendance', AdminController.getAttendanceRecords);

export default router;
