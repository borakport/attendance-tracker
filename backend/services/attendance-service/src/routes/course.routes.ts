import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { validate } from '../middleware/validation.middleware';
import {
  createCourseSchema,
  enrollCourseSchema,
  updateCourseSchema,
  updateMemberRoleSchema,
} from '../validators/course.validator';

const router = Router();

router.post('/', validate(createCourseSchema), CourseController.create);
router.get('/', CourseController.getAll);
router.post('/enroll', validate(enrollCourseSchema), CourseController.enroll);
router.post('/:id/leave', CourseController.leave);
router.get('/:id', CourseController.getById);
router.put('/:id', validate(updateCourseSchema), CourseController.update);
router.delete('/:id', CourseController.delete);
router.get('/:id/members', CourseController.getMembers);
router.patch(
  '/:id/members/:userId',
  validate(updateMemberRoleSchema),
  CourseController.updateMemberRole
);
router.delete('/:id/members/:userId', CourseController.removeMember);
router.get('/:id/sessions', CourseController.getCourseSessions);

export default router;
