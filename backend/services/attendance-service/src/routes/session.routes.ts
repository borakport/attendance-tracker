import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { validate } from '../middleware/validation.middleware';
import { createSessionSchema } from '../validators/session.validator';

const router = Router();

// Session management
router.post('/', validate(createSessionSchema), SessionController.create);
router.get('/', SessionController.getSessions);
router.get('/active', SessionController.getActiveSessions);
router.get('/:id', SessionController.getById);
router.put('/:id', SessionController.update);
router.delete('/:id', SessionController.delete);

// Session lifecycle
router.post('/:id/start', SessionController.start);
router.post('/:id/end', SessionController.end);
router.post('/:sessionId/extend', SessionController.extendForManualAttendance);

// Session queries
router.get('/course/:courseId', SessionController.getByCourse);
router.get('/course/:courseId/active', SessionController.getActiveSessions);
router.get('/qr/:qrCode', SessionController.getByQRCode);

export default router;
