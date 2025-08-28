import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { validate } from '../middleware/validation.middleware';
import { createSessionSchema } from '../validators/session.validator';

const router = Router();

router.post('/', validate(createSessionSchema), SessionController.create);
router.post('/:id/start', SessionController.start);
router.post('/:id/end', SessionController.end);
router.get('/active', SessionController.getActive);
router.get('/:id', SessionController.getById);

export default router;
