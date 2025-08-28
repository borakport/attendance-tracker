import Joi from 'joi';

export const createCourseSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  code: Joi.string().max(20).optional(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  settings: Joi.object({
    gpsRadius: Joi.number().min(10).max(500).optional(),
    allowLateEntry: Joi.boolean().optional(),
    lateEntryMinutes: Joi.number().min(5).max(60).optional(),
    requireSelfie: Joi.boolean().optional(),
    autoEndSession: Joi.boolean().optional(),
    autoEndMinutes: Joi.number().min(30).max(480).optional(),
  }).optional(),
});

export const updateCourseSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().optional(),
  isActive: Joi.boolean().optional(),
  settings: Joi.object({
    gpsRadius: Joi.number().min(10).max(500).optional(),
    allowLateEntry: Joi.boolean().optional(),
    lateEntryMinutes: Joi.number().min(5).max(60).optional(),
    requireSelfie: Joi.boolean().optional(),
    autoEndSession: Joi.boolean().optional(),
    autoEndMinutes: Joi.number().min(30).max(480).optional(),
  }).optional(),
});

export const enrollCourseSchema = Joi.object({
  code: Joi.string().required(),
});

export const updateMemberRoleSchema = Joi.object({
  role: Joi.string().valid('PARTICIPANT', 'MODERATOR').required(),
});

export const courseValidator = {
  create: createCourseSchema,
  update: updateCourseSchema,
  join: enrollCourseSchema,
  addMember: Joi.object({
    userId: Joi.string().uuid().required(),
    role: Joi.string().valid('PARTICIPANT', 'MODERATOR').required(),
  }),
  removeMember: Joi.object({
    userId: Joi.string().uuid().required(),
  }),
};
