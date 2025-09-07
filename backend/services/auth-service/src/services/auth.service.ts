import { User, UserRole } from '@prisma/client';
import { JWTUtils } from '../utils/jwt.utils';
import { PasswordUtils } from '../utils/password.utils';
import { EmailService } from './email.service';
import { UserModel, CreateUserData, UpdateUserData } from '../models/user.model';
import { AppError } from '../middleware/error.middleware';
import redisClient from '../config/redis';
import { constants } from '../config/constants';
import logger from '../config/logger';

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface SigninData {
  email: string;
  password: string;
}

export interface AuthResult {
  user: Omit<User, 'password'>;
  accessToken: string;
  refreshToken: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export class AuthService {
  private static emailService = new EmailService();

  /**
   * Register a new user
   */
  static async signup(data: SignupData): Promise<{ user: Omit<User, 'password'>; message: string }> {
    try {
      // Check if user already exists
      const existingUser = await UserModel.findByEmail(data.email);
      if (existingUser) {
        throw new AppError(400, 'User with this email already exists');
      }

      // Hash password
      const hashedPassword = await PasswordUtils.hash(data.password);

      // Create user
      const userData: CreateUserData = {
        ...data,
        password: hashedPassword,
        role: data.role || UserRole.STUDENT,
      };

      const user = await UserModel.create(userData);

      // Generate email verification token
      const verificationToken = JWTUtils.generateEmailVerificationToken(user.id);

      // Store verification token in Redis
      await redisClient.setEx(
        `${constants.REDIS_EMAIL_VERIFY_PREFIX}${user.id}`,
        24 * 60 * 60, // 24 hours
        verificationToken
      );

      // Send verification email
      try {
        await this.emailService.sendVerificationEmail(user.email, user.firstName, verificationToken);
      } catch (emailError) {
        logger.warn('Failed to send verification email:', emailError);
        // Don't fail registration if email fails
      }

      logger.info(`User registered: ${user.email}`);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        message: 'User registered successfully. Please check your email for verification.',
      };
    } catch (error) {
      logger.error('Signup error:', error);
      throw error;
    }
  }

  /**
   * Authenticate user and return tokens
   */
  static async signin(data: SigninData): Promise<AuthResult> {
    try {
      // Find user by email
      const user = await UserModel.findByEmail(data.email);
      if (!user) {
        throw new AppError(401, 'Invalid email or password');
      }

      // Check if account is locked
      const isLocked = await UserModel.isAccountLocked(user.id);
      if (isLocked) {
        throw new AppError(423, 'Account is temporarily locked due to too many failed login attempts');
      }

      // Verify password
      const isPasswordValid = await PasswordUtils.compare(data.password, user.password);
      if (!isPasswordValid) {
        // Increment login attempts
        await UserModel.updateLoginAttempts(user.id, true);
        throw new AppError(401, 'Invalid email or password');
      }

      // Reset login attempts on successful login
      await UserModel.updateLoginAttempts(user.id, false);

      // Generate tokens
      const { accessToken, refreshToken, refreshTokenId } = JWTUtils.generateTokens(user);

      // Store refresh token in Redis
      await redisClient.setEx(
        `${constants.REDIS_TOKEN_PREFIX}${refreshTokenId}`,
        7 * 24 * 60 * 60, // 7 days
        JSON.stringify({
          userId: user.id,
          tokenId: refreshTokenId,
          createdAt: new Date().toISOString(),
        })
      );

      logger.info(`User signed in: ${user.email}`);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      };
    } catch (error) {
      logger.error('Signin error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      // Verify refresh token
      const decoded = JWTUtils.verifyRefreshToken(refreshToken);
      
      // Check if token exists in Redis
      const tokenData = await redisClient.get(`${constants.REDIS_TOKEN_PREFIX}${decoded.jti}`);
      if (!tokenData) {
        throw new AppError(401, 'Invalid refresh token');
      }

      // Get user
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        throw new AppError(401, 'User not found');
      }

      // Generate new tokens
      const { accessToken: newAccessToken, refreshToken: newRefreshToken, refreshTokenId } = 
        JWTUtils.generateTokens(user);

      // Remove old token and store new one
      await redisClient.del(`${constants.REDIS_TOKEN_PREFIX}${decoded.jti}`);
      await redisClient.setEx(
        `${constants.REDIS_TOKEN_PREFIX}${refreshTokenId}`,
        7 * 24 * 60 * 60, // 7 days
        JSON.stringify({
          userId: user.id,
          tokenId: refreshTokenId,
          createdAt: new Date().toISOString(),
        })
      );

      logger.info(`Token refreshed for user: ${user.email}`);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      logger.error('Refresh token error:', error);
      throw error;
    }
  }

  /**
   * Refresh only access token using refresh token
   * Keeps the same refresh token valid
   */
  static async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const decoded = JWTUtils.verifyRefreshToken(refreshToken);
      
      // Check if token exists in Redis
      const tokenData = await redisClient.get(`${constants.REDIS_TOKEN_PREFIX}${decoded.jti}`);
      if (!tokenData) {
        throw new AppError(401, 'Invalid refresh token');
      }

      // Get user
      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        throw new AppError(401, 'User not found');
      }

      // Generate only new access token
      const newAccessToken = JWTUtils.generateAccessToken(user);

      logger.info(`Access token refreshed for user: ${user.email}`);

      return {
        accessToken: newAccessToken,
      };
    } catch (error) {
      logger.error('Access token refresh error:', error);
      throw error;
    }
  }

  /**
   * Logout user and blacklist token
   */
  static async logout(userId: string, accessToken: string): Promise<void> {
    try {
      // Blacklist the access token
      const decoded = JWTUtils.verifyAccessToken(accessToken);
      const timeToExpiry = decoded.exp - Math.floor(Date.now() / 1000);
      await JWTUtils.blacklistToken(accessToken, timeToExpiry);

      // Remove all refresh tokens for this user
      const keys = await redisClient.keys(`${constants.REDIS_TOKEN_PREFIX}*`);
      const userTokens = [];

      for (const key of keys) {
        const tokenData = await redisClient.get(key);
        if (tokenData) {
          const parsed = JSON.parse(tokenData);
          if (parsed.userId === userId) {
            userTokens.push(key);
          }
        }
      }

      if (userTokens.length > 0) {
        for (const tokenKey of userTokens) {
          await redisClient.del(tokenKey);
        }
      }

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token: string): Promise<{ message: string }> {
    try {
      // Verify token
      const decoded = JWTUtils.verifyEmailVerificationToken(token);

      // Check if token exists in Redis
      const storedToken = await redisClient.get(`${constants.REDIS_EMAIL_VERIFY_PREFIX}${decoded.userId}`);
      if (!storedToken || storedToken !== token) {
        throw new AppError(400, 'Invalid or expired verification token');
      }

      // Update user email verification status
      await UserModel.updateById(decoded.userId, { emailVerified: true });

      // Remove token from Redis
      await redisClient.del(`${constants.REDIS_EMAIL_VERIFY_PREFIX}${decoded.userId}`);

      logger.info(`Email verified for user: ${decoded.userId}`);

      return { message: 'Email verified successfully' };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  static async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const user = await UserModel.findByEmail(email);
      if (!user) {
        // Don't reveal if email exists or not
        return { message: 'If the email exists, a password reset link has been sent.' };
      }

      // Generate password reset token
      const resetToken = JWTUtils.generatePasswordResetToken(user.id);

      // Store reset token in Redis
      await redisClient.setEx(
        `${constants.REDIS_PASSWORD_RESET_PREFIX}${user.id}`,
        60 * 60, // 1 hour
        resetToken
      );

      // Send reset email
      try {
        await this.emailService.sendPasswordResetEmail(user.email, user.firstName, resetToken);
      } catch (emailError) {
        logger.error('Failed to send password reset email:', emailError);
        throw new AppError(500, 'Failed to send password reset email');
      }

      logger.info(`Password reset requested for user: ${user.email}`);

      return { message: 'If the email exists, a password reset link has been sent.' };
    } catch (error) {
      logger.error('Forgot password error:', error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  static async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    try {
      // Verify token
      const decoded = JWTUtils.verifyPasswordResetToken(token);

      // Check if token exists in Redis
      const storedToken = await redisClient.get(`${constants.REDIS_PASSWORD_RESET_PREFIX}${decoded.userId}`);
      if (!storedToken || storedToken !== token) {
        throw new AppError(400, 'Invalid or expired reset token');
      }

      // Hash new password
      const hashedPassword = await PasswordUtils.hash(newPassword);

      // Update user password and reset login attempts
      await UserModel.updateById(decoded.userId, {
        password: hashedPassword,
        loginAttempts: 0,
        accountLocked: false,
      });

      // Remove token from Redis
      await redisClient.del(`${constants.REDIS_PASSWORD_RESET_PREFIX}${decoded.userId}`);

      // Invalidate all existing sessions
      await this.logout(decoded.userId, '');

      logger.info(`Password reset completed for user: ${decoded.userId}`);

      return { message: 'Password reset successfully' };
    } catch (error) {
      logger.error('Reset password error:', error);
      throw error;
    }
  }

  /**
   * Change password for authenticated user
   */
  static async changePassword(userId: string, data: ChangePasswordData): Promise<{ message: string }> {
    try {
      // Get user
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await PasswordUtils.compare(data.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new AppError(400, 'Current password is incorrect');
      }

      // Check if new password is different
      const isSamePassword = await PasswordUtils.compare(data.newPassword, user.password);
      if (isSamePassword) {
        throw new AppError(400, 'New password must be different from current password');
      }

      // Hash new password
      const hashedPassword = await PasswordUtils.hash(data.newPassword);

      // Update password
      await UserModel.updateById(userId, { password: hashedPassword });

      logger.info(`Password changed for user: ${user.email}`);

      return { message: 'Password changed successfully' };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Get user profile
   */
  static async getProfile(userId: string): Promise<Omit<User, 'password'>> {
    try {
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;

      return userWithoutPassword;
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, data: UpdateUserData): Promise<Omit<User, 'password'>> {
    try {
      const updatedUser = await UserModel.updateById(userId, data);

      logger.info(`Profile updated for user: ${updatedUser.email}`);

      // Remove password from response
      const { password: _, ...userWithoutPassword } = updatedUser;

      return userWithoutPassword;
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  /**
   * Verify user password for security-sensitive operations
   */
  static async verifyPassword(userId: string, password: string): Promise<{ verified: boolean }> {
    try {
      // Get user
      const user = await UserModel.findById(userId);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Verify password
      const isPasswordValid = await PasswordUtils.compare(password, user.password);

      logger.info(`Password verification for user ${user.email}: ${isPasswordValid ? 'success' : 'failed'}`);

      return {
        verified: isPasswordValid,
      };
    } catch (error) {
      logger.error('Verify password error:', error);
      throw error;
    }
  }

  /**
   * Resend email verification
   */
  static async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const user = await UserModel.findByEmail(email);
      if (!user) {
        throw new AppError(404, 'User not found');
      }

      if (user.emailVerified) {
        throw new AppError(400, 'Email is already verified');
      }

      // Generate new verification token
      const verificationToken = JWTUtils.generateEmailVerificationToken(user.id);

      // Store token in Redis
      await redisClient.setEx(
        `${constants.REDIS_EMAIL_VERIFY_PREFIX}${user.id}`,
        24 * 60 * 60, // 24 hours
        verificationToken
      );

      // Send verification email
      await this.emailService.sendVerificationEmail(user.email, user.firstName, verificationToken);

      logger.info(`Verification email resent to: ${user.email}`);

      return { message: 'Verification email sent' };
    } catch (error) {
      logger.error('Resend verification error:', error);
      throw error;
    }
  }
}
