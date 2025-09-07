import { Router } from 'express';
import { CourseController } from '../controllers/course.controller';
import { validate } from '../middleware/validation.middleware';
import {
  createCourseSchema,
  enrollCourseSchema,
  updateCourseSchema,
  editCourseSchema,
  courseSettingsSchema,
} from '../validators/course.validator';

const router = Router();

// Course management
router.get('/', CourseController.getMyCourses);  // Get user's courses
router.post('/', validate(createCourseSchema), CourseController.create);
router.get('/my', CourseController.getMyCourses);
router.post('/enroll', validate(enrollCourseSchema), CourseController.enroll);
router.get('/code/:code', CourseController.getByCode);

// Specific course operations
router.get('/:id', CourseController.getById);
router.put('/:id', validate(updateCourseSchema), CourseController.update);
router.patch('/:id/edit', validate(editCourseSchema), CourseController.editCourse);
router.patch('/:id/settings', validate(courseSettingsSchema), CourseController.updateSettings);
router.delete('/:id', CourseController.delete);

// Course membership
router.post('/:id/leave', CourseController.leave);
router.get('/:id/members', CourseController.getMembers);
router.delete('/:id/members/:studentId', CourseController.removeStudent);

export default router;
