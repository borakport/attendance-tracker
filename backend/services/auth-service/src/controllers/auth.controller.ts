import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { JWTUtils } from '../utils/jwt.utils';
import { PasswordUtils } from '../utils/password.utils';
import { EmailService } from '../services/email.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import logger from '../config/logger';
import redisClient from '../config/redis';
import { constants } from '../config/constants';

const prisma = new PrismaClient();
const emailService = new EmailService();

export class AuthController {
  static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, phoneNumber } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new AppError(400, 'User with this email already exists');
      }

      // Hash password
      const hashedPassword = await PasswordUtils.hash(password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phoneNumber,
          role: UserRole.STUDENT, // Default role
        },
      });

      // Generate email verification token
      const verificationToken = JWTUtils.generateEmailVerificationToken(user.id);

      // Store verification token in Redis
      await redisClient.setEx(
        `${constants.REDIS_EMAIL_VERIFY_PREFIX}${user.id}`,
        24 * 60 * 60, // 24 hours
        verificationToken
      );

      // Send verification email
      await emailService.sendVerificationEmail(email, verificationToken, firstName);

      logger.info(`New user registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
          userId: user.id,
          email: user.email,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async signin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new AppError(401, 'Invalid email or password');
      }

      // Check password
      const isValidPassword = await PasswordUtils.compare(password, user.password);
      if (!isValidPassword) {
        throw new AppError(401, 'Invalid email or password');
      }

      // Check if email is verified
      if (!user.emailVerified) {
        throw new AppError(403, 'Please verify your email before signing in');
      }

      // Check if account is locked
      if (user.accountLocked) {
        throw new AppError(403, 'Your account has been locked');
      }

      // Generate tokens
      const { accessToken, refreshToken, refreshTokenId } = JWTUtils.generateTokens(user);

      // Store refresh token in Redis
      await JWTUtils.storeRefreshToken(user.id, refreshTokenId);

      // Store refresh token in database
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        },
      });

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      logger.info(`User signed in: ${email}`);

      res.status(200).json({
        success: true,
        message: 'Sign in successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
          },
          tokens: {
            accessToken,
            refreshToken,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const decoded = JWTUtils.verifyRefreshToken(refreshToken);

      // Check if token exists in Redis
      const isValid = await JWTUtils.validateRefreshToken(decoded.userId, decoded.jti!);
      if (!isValid) {
        throw new AppError(401, 'Invalid refresh token');
      }

      // Get user
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user || user.accountLocked) {
        throw new AppError(401, 'User not found or account locked');
      }

      // Revoke old refresh token
      await JWTUtils.revokeRefreshToken(decoded.userId, decoded.jti!);
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });

      // Generate new tokens
      const tokens = JWTUtils.generateTokens(user);

      // Store new refresh token
      await JWTUtils.storeRefreshToken(user.id, tokens.refreshTokenId);
      await prisma.refreshToken.create({
        data: {
          token: tokens.refreshToken,
          userId: user.id,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.substring(7);

      if (accessToken) {
        // Blacklist the access token
        await JWTUtils.blacklistToken(accessToken, 15 * 60); // 15 minutes
      }

      // Revoke all user's refresh tokens
      if (req.user) {
        await JWTUtils.revokeAllUserTokens(req.user.userId);
        await prisma.refreshToken.deleteMany({
          where: { userId: req.user.userId },
        });
      }

      logger.info(`User logged out: ${req.user?.email}`);

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;

      // Verify token
      const decoded = JWTUtils.verifyAccessToken(token);

      // Check if token exists in Redis
      const storedToken = await redisClient.get(
        `${constants.REDIS_EMAIL_VERIFY_PREFIX}${decoded.userId}`
      );

      if (!storedToken || storedToken !== token) {
        throw new AppError(400, 'Invalid or expired verification token');
      }

      // Update user
      const user = await prisma.user.update({
        where: { id: decoded.userId },
        data: { emailVerified: true },
      });

      // Delete verification token
      await redisClient.del(`${constants.REDIS_EMAIL_VERIFY_PREFIX}${decoded.userId}`);

      // Send welcome email
      await emailService.sendWelcomeEmail(user.email, user.firstName);

      logger.info(`Email verified for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Email verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (user) {
        // Generate reset token
        const resetToken = JWTUtils.generatePasswordResetToken(user.id);

        // Store reset token in Redis
        await redisClient.setEx(
          `${constants.REDIS_PASSWORD_RESET_PREFIX}${user.id}`,
          60 * 60, // 1 hour
          resetToken
        );

        // Send reset email
        await emailService.sendPasswordResetEmail(email, resetToken, user.firstName);

        logger.info(`Password reset requested for: ${email}`);
      }

      // Always return success to prevent email enumeration
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent',
      });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;

      // Verify token
      const decoded = JWTUtils.verifyAccessToken(token);

      // Check if token exists in Redis
      const storedToken = await redisClient.get(
        `${constants.REDIS_PASSWORD_RESET_PREFIX}${decoded.userId}`
      );

      if (!storedToken || storedToken !== token) {
        throw new AppError(400, 'Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await PasswordUtils.hash(password);

      // Update password
      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });

      // Delete reset token
      await redisClient.del(`${constants.REDIS_PASSWORD_RESET_PREFIX}${decoded.userId}`);

      // Revoke all refresh tokens
      await JWTUtils.revokeAllUserTokens(decoded.userId);
      await prisma.refreshToken.deleteMany({
        where: { userId: decoded.userId },
      });

      logger.info(`Password reset for user ID: ${decoded.userId}`);

      res.status(200).json({
        success: true,
        message: 'Password reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user!.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Verify current password
      const isValidPassword = await PasswordUtils.compare(currentPassword, user.password);
      if (!isValidPassword) {
        throw new AppError(401, 'Current password is incorrect');
      }

      // Hash new password
      const hashedPassword = await PasswordUtils.hash(newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      // Revoke all refresh tokens
      await JWTUtils.revokeAllUserTokens(userId);
      await prisma.refreshToken.deleteMany({
        where: { userId },
      });

      logger.info(`Password changed for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please sign in again.',
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
          emailVerified: true,
          createdAt: true,
          lastLogin: true,
        },
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { firstName, lastName, phoneNumber } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName,
          lastName,
          phoneNumber,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
        },
      });

      logger.info(`Profile updated for user: ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }
}
