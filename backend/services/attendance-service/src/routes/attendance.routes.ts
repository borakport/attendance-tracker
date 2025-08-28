import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller';
import { validate } from '../middleware/validation.middleware';
import { markAttendanceSchema } from '../validators/attendance.validator';

const router = Router();

router.post('/', validate(markAttendanceSchema), AttendanceController.mark);
router.get('/session/:sessionId', AttendanceController.getSessionAttendance);
router.get('/course/:courseId/user/:userId', AttendanceController.getUserAttendance);

export default router;
