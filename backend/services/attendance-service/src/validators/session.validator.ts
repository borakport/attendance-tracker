import Joi from 'joi';

export const createSessionSchema = Joi.object({
  courseId: Joi.string().uuid().required(),
  name: Joi.string().min(3).max(100).required(),
  description: Joi.string().max(500).optional(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().min(Joi.ref('startTime')).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  radiusMeters: Joi.number().min(10).max(500).optional(),
  locationName: Joi.string().max(200).optional(),
  allowLateEntry: Joi.boolean().optional(),
  lateMinutes: Joi.number().min(5).max(60).optional(),
  requireSelfie: Joi.boolean().optional(),
});

export const updateSessionSchema = Joi.object({
  name: Joi.string().min(3).max(100).optional(),
  description: Joi.string().max(500).optional(),
  startTime: Joi.date().iso().optional(),
  endTime: Joi.date().iso().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  radiusMeters: Joi.number().min(10).max(500).optional(),
  locationName: Joi.string().max(200).optional(),
  allowLateEntry: Joi.boolean().optional(),
  lateMinutes: Joi.number().min(5).max(60).optional(),
  requireSelfie: Joi.boolean().optional(),
});

export const startSessionSchema = Joi.object({
  actualLatitude: Joi.number().min(-90).max(90).optional(),
  actualLongitude: Joi.number().min(-180).max(180).optional(),
});

export const endSessionSchema = Joi.object({
  notes: Joi.string().max(500).optional(),
});

export const sessionValidator = {
  create: createSessionSchema,
  update: updateSessionSchema,
  start: startSessionSchema,
  end: endSessionSchema,
};
