import Joi from 'joi';
import { constants } from '../config/constants';

export const authValidator = {
  signup: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(constants.PASSWORD_MIN_LENGTH)
      .pattern(constants.PASSWORD_REGEX)
      .required()
      .messages({
        'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
      }),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
      'any.only': 'Passwords do not match',
    }),
    firstName: Joi.string().min(2).max(50).required(),
    lastName: Joi.string().min(2).max(50).required(),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional().messages({
      'string.pattern.base': 'Please enter a valid phone number',
    }),
  }),

  signin: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),

  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),

  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string()
      .min(constants.PASSWORD_MIN_LENGTH)
      .pattern(constants.PASSWORD_REGEX)
      .required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  }),

  verifyEmail: Joi.object({
    token: Joi.string().required(),
  }),

  refreshToken: Joi.object({
    refreshToken: Joi.string().required(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(constants.PASSWORD_MIN_LENGTH)
      .pattern(constants.PASSWORD_REGEX)
      .required()
      .invalid(Joi.ref('currentPassword'))
      .messages({
        'any.invalid': 'New password must be different from current password',
      }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required(),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    phoneNumber: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
  }),
};
