import Joi from 'joi';

export const markAttendanceSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  selfieUrl: Joi.string().uri().optional(),
  deviceInfo: Joi.object({
    platform: Joi.string().required(),
    model: Joi.string().required(),
    osVersion: Joi.string().required(),
    appVersion: Joi.string().required(),
  }).optional(),
});

export const updateAttendanceStatusSchema = Joi.object({
  status: Joi.string().valid('PRESENT', 'LATE', 'ABSENT', 'EXCUSED').required(),
  notes: Joi.string().max(500).optional(),
});

export const bulkMarkAttendanceSchema = Joi.object({
  sessionId: Joi.string().uuid().required(),
  attendances: Joi.array().items(
    Joi.object({
      userId: Joi.string().uuid().required(),
      status: Joi.string().valid('PRESENT', 'LATE', 'ABSENT', 'EXCUSED').required(),
      notes: Joi.string().max(500).optional(),
    })
  ).min(1).required(),
});

export const attendanceValidator = {
  mark: markAttendanceSchema,
  updateStatus: updateAttendanceStatusSchema,
  bulkMark: bulkMarkAttendanceSchema,
};
