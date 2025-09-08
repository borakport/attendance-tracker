/**
 * JWT (JSON Web Token) Utilities
 * 
 * This module provides comprehensive JWT token management functionality for the authentication system.
 * It handles both access tokens (short-lived) and refresh tokens (long-lived) with Redis-based
 * token blacklisting for secure logout and token revocation.
 * 
 * Key Features:
 * - Token generation with user payload
 * - Token verification and validation
 * - Refresh token management with Redis storage
 * - Token blacklisting for security
 * - Automatic token cleanup
 * 
 * Security Considerations:
 * - Uses separate secrets for access and refresh tokens
 * - Implements JWT ID (jti) for token uniqueness
 * - Provides token revocation mechanism
 * - Handles token expiration gracefully
 */

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redis';
import { constants } from '../config/constants';
import { User } from '@prisma/client';

/**
 * Interface for JWT token payload
 * Contains essential user information embedded in the token
 */
interface TokenPayload {
  userId: string;    // Unique user identifier
  email: string;     // User's email address
  role: string;      // User's role (STUDENT, INSTRUCTOR, ADMIN)
  jti?: string;      // JWT ID for token uniqueness and revocation
}

/**
 * Interface for decoded JWT token
 * Extends TokenPayload with standard JWT claims
 */
interface DecodedToken extends TokenPayload {
  iat: number;       // Token issued at timestamp
  exp: number;       // Token expiration timestamp
}

/**
 * JWT Utilities Class
 * 
 * Provides static methods for comprehensive JWT token management.
 * Handles token generation, verification, refresh, and revocation
 * with Redis-based storage for enhanced security.
 */
export class JWTUtils {
  /**
   * Get JWT secrets from environment variables
   * Validates that both access and refresh token secrets are configured
   * 
   * @returns Object containing access and refresh token secrets
   * @throws Error if secrets are not configured
   */
  private static getSecrets() {
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets not configured');
    }
    
    return { accessSecret, refreshSecret };
  }

  /**
   * Generate both access and refresh tokens for a user
   * 
   * Creates a token pair for authentication:
   * - Access token: Short-lived (15 minutes), used for API requests
   * - Refresh token: Long-lived (7 days), used to generate new access tokens
   * 
   * @param user - User object from database
   * @returns Object containing both tokens and refresh token ID
   */
  static generateTokens(user: User): { 
    accessToken: string; 
    refreshToken: string; 
    refreshTokenId: string;
  } {
    const { accessSecret, refreshSecret } = this.getSecrets();
    const refreshTokenId = uuidv4(); // Unique ID for refresh token tracking
    
    // Create payload with essential user information
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    
    // Generate access token with unique JWT ID
    // Generate access token with unique JWT ID
    const accessToken = jwt.sign(
      { ...payload, jti: uuidv4() },
      accessSecret,
      { expiresIn: constants.JWT_ACCESS_EXPIRES_IN as any }
    );
    
    // Generate refresh token with tracking ID
    // Refresh tokens are longer-lived and stored in Redis for validation
    const refreshToken = jwt.sign(
      { ...payload, jti: refreshTokenId },
      refreshSecret,
      { expiresIn: constants.JWT_REFRESH_EXPIRES_IN as any }
    );
    
    return { accessToken, refreshToken, refreshTokenId };
  }

  /**
   * Generate only access token for a user
   * 
   * Creates a short-lived access token for API requests without generating
   * a new refresh token. Useful when you want to refresh access while keeping
   * the same refresh token valid.
   * 
   * @param user - User object from database
   * @returns Access token string
   */
  static generateAccessToken(user: User): string {
    const { accessSecret } = this.getSecrets();
    
    // Create payload with essential user information
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    
    // Generate access token with unique JWT ID
    const accessToken = jwt.sign(
      { ...payload, jti: uuidv4() },
      accessSecret,
      { expiresIn: constants.JWT_ACCESS_EXPIRES_IN as any }
    );
    
    return accessToken;
  }

  /**
   * Store refresh token in Redis for validation
   * 
   * Stores the refresh token's JWT ID in Redis with expiration.
   * This allows us to track valid refresh tokens and revoke them when needed.
   * 
   * @param userId - User ID associated with the token
   * @param jti - JWT ID of the refresh token
   * @param expiresIn - Token expiration time in seconds (default: 7 days)
   */
  static async storeRefreshToken(
    userId: string, 
    jti: string, 
    expiresIn: number = 7 * 24 * 60 * 60 // 7 days in seconds
  ): Promise<void> {
    const key = `${constants.REDIS_TOKEN_PREFIX}${userId}:${jti}`;
    await redisClient.setEx(key, expiresIn, 'valid');
  }

  /**
   * Validate refresh token existence in Redis
   * 
   * Checks if a refresh token is still valid by looking up its JWT ID in Redis.
   * This method is used during token refresh to ensure the token hasn't been revoked.
   * 
   * @param userId - User ID associated with the token
   * @param jti - JWT ID of the refresh token
   * @returns Promise<boolean> - True if token exists and is valid
   */
  static async validateRefreshToken(
    userId: string, 
    jti: string
  ): Promise<boolean> {
    const key = `${constants.REDIS_TOKEN_PREFIX}${userId}:${jti}`;
    const exists = await redisClient.exists(key);
    return exists === 1;
  }

  /**
   * Revoke refresh token by removing from Redis
   * 
   * Removes a refresh token from Redis, effectively invalidating it.
   * Used during logout or when a token needs to be revoked for security reasons.
   * 
   * @param userId - User ID associated with the token
   * @param jti - JWT ID of the refresh token to revoke
   */
  static async revokeRefreshToken(
    userId: string, 
    jti: string
  ): Promise<void> {
    const key = `${constants.REDIS_TOKEN_PREFIX}${userId}:${jti}`;
    await redisClient.del(key);
  }

  /**
   * Revoke all refresh tokens for a specific user
   * 
   * Removes all refresh tokens associated with a user from Redis.
   * Used when a user needs to be logged out from all devices (e.g., security breach).
   * 
   * @param userId - User ID whose tokens should be revoked
   */
  static async revokeAllUserTokens(userId: string): Promise<void> {
    const pattern = `${constants.REDIS_TOKEN_PREFIX}${userId}:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }

  /**
   * Verify and decode an access token
   * 
   * Validates an access token's signature and expiration.
   * Throws an error if the token is invalid or expired.
   * 
   * @param token - JWT access token to verify
   * @returns DecodedToken - Decoded token payload with user information
   * @throws Error if token is invalid or expired
   */
  static verifyAccessToken(token: string): DecodedToken {
    const { accessSecret } = this.getSecrets();
    return jwt.verify(token, accessSecret) as DecodedToken;
  }

  /**
   * Verify and decode a refresh token
   * 
   * Validates a refresh token's signature and expiration.
   * Note: This only verifies the token structure, not if it's been revoked.
   * Use validateRefreshToken() to check if it's still valid in Redis.
   * 
   * @param token - JWT refresh token to verify
   * @returns DecodedToken - Decoded token payload with user information
   * @throws Error if token is invalid or expired
   */
  static verifyRefreshToken(token: string): DecodedToken {
    const { refreshSecret } = this.getSecrets();
    return jwt.verify(token, refreshSecret) as DecodedToken;
  }

  /**
   * Add token to blacklist
   * 
   * Blacklists a token by storing it in Redis with its remaining expiration time.
   * Blacklisted tokens are considered invalid even if they haven't expired.
   * 
   * @param token - Full JWT token string to blacklist
   * @param expiresIn - Remaining time until token expires (seconds)
   */
  static async blacklistToken(token: string, expiresIn: number): Promise<void> {
    const key = `${constants.REDIS_BLACKLIST_PREFIX}${token}`;
    await redisClient.setEx(key, expiresIn, 'blacklisted');
  }

  /**
   * Check if token is blacklisted
   * 
   * Verifies whether a token has been blacklisted and should be rejected.
   * Used in authentication middleware to prevent use of revoked tokens.
   * 
   * @param token - Full JWT token string to check
   * @returns Promise<boolean> - True if token is blacklisted
   */
  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${constants.REDIS_BLACKLIST_PREFIX}${token}`;
    const exists = await redisClient.exists(key);
    return exists === 1;
  }

  /**
   * Generate email verification token
   * 
   * Creates a special-purpose token for email verification.
   * This token has a shorter expiration time and contains only the user ID
   * and token type for security.
   * 
   * @param userId - User ID for whom to generate the verification token
   * @returns string - JWT token for email verification
   */
  static generateEmailVerificationToken(userId: string): string {
    const { accessSecret } = this.getSecrets();
    return jwt.sign(
      { userId, type: 'email_verification' },
      accessSecret,
      { expiresIn: constants.JWT_EMAIL_VERIFY_EXPIRES_IN as any }
    );
  }

  /**
   * Generate phone verification token
   * 
   * Creates a special-purpose token for phone verification.
   * This token has a shorter expiration time and contains only the user ID
   * and token type for security.
   * 
   * @param userId - User ID for whom to generate the verification token
   * @returns string - JWT token for phone verification
   */
  static generatePhoneVerificationToken(userId: string): string {
    const { accessSecret } = this.getSecrets();
    return jwt.sign(
      { userId, type: 'phone_verification' },
      accessSecret,
      { expiresIn: constants.JWT_EMAIL_VERIFY_EXPIRES_IN as any } // Use same expiration as email
    );
  }

  /**
   * Generate password reset token
   * 
   * Creates a special-purpose token for password reset functionality.
   * This token has limited lifetime and is used to verify password reset requests.
   * 
   * @param userId - User ID for whom to generate the reset token
   * @returns string - JWT token for password reset
   */
  static generatePasswordResetToken(userId: string): string {
    const { accessSecret } = this.getSecrets();
    return jwt.sign(
      { userId, type: 'password_reset' },
      accessSecret,
      { expiresIn: constants.JWT_PASSWORD_RESET_EXPIRES_IN as any }
    );
  }

  /**
   * Verify email verification token
   * 
   * Validates and decodes an email verification token.
   * Ensures the token is valid and hasn't expired.
   * 
   * @param token - Email verification JWT token
   * @returns Object containing userId and token type
   * @throws Error if token is invalid or expired
   */
  static verifyEmailVerificationToken(token: string): { userId: string; type: string } {
    const { accessSecret } = this.getSecrets();
    return jwt.verify(token, accessSecret) as { userId: string; type: string };
  }

  /**
   * Verify phone verification token
   * 
   * Validates and decodes a phone verification token.
   * Ensures the token is valid and hasn't expired.
   * 
   * @param token - Phone verification JWT token
   * @returns Object containing userId and token type
   * @throws Error if token is invalid or expired
   */
  static verifyPhoneVerificationToken(token: string): { userId: string; type: string } {
    const { accessSecret } = this.getSecrets();
    return jwt.verify(token, accessSecret) as { userId: string; type: string };
  }

  /**
   * Verify password reset token
   * 
   * Validates and decodes a password reset token.
   * Used to verify password reset requests before allowing password changes.
   * 
   * @param token - Password reset JWT token
   * @returns Object containing userId and token type
   * @throws Error if token is invalid or expired
   */
  static verifyPasswordResetToken(token: string): { userId: string; type: string } {
    const { accessSecret } = this.getSecrets();
    return jwt.verify(token, accessSecret) as { userId: string; type: string };
  }
}
