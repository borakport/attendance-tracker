import { Router } from 'express';
import courseRoutes from './course.routes';
import sessionRoutes from './session.routes';
import attendanceRoutes from './attendance.routes';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use('/courses', authenticate, courseRoutes);
router.use('/sessions', authenticate, sessionRoutes);
router.use('/attendance', authenticate, attendanceRoutes);

export default router;
