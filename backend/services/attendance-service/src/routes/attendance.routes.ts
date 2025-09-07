import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { validate } from '../middleware/validation.middleware';
import { markAttendanceSchema } from '../validators/attendance.validator';

const router = Router();

// Attendance marking
router.post('/', validate(markAttendanceSchema), AttendanceController.mark);
router.post('/mark', validate(markAttendanceSchema), AttendanceController.mark);
router.post('/manual', AttendanceController.addManualAttendance);

// User attendance records
router.get('/my', AttendanceController.getMyAttendance);
router.get('/my/stats', AttendanceController.getMyStats);

// Session attendance management (instructor only)
router.get('/session/:sessionId', AttendanceController.getSessionAttendance);
router.get('/session/:sessionId/summary', AttendanceController.getSessionSummary);
router.put('/:attendanceId', AttendanceController.updateAttendance);
router.delete('/:attendanceId', AttendanceController.deleteAttendance);
router.post('/bulk', AttendanceController.bulkMark);

export default router;
