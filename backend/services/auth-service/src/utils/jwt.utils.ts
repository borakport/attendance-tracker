import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../config/redis';
import { constants } from '../config/constants';
import { User } from '@prisma/client';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  jti?: string;
}

interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
}

export class JWTUtils {
  private static getSecrets() {
    const accessSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;
    
    if (!accessSecret || !refreshSecret) {
      throw new Error('JWT secrets not configured');
    }
    
    return { accessSecret, refreshSecret };
  }

  static generateTokens(user: User): { 
    accessToken: string; 
    refreshToken: string; 
    refreshTokenId: string;
  } {
    const { accessSecret, refreshSecret } = this.getSecrets();
    const refreshTokenId = uuidv4();
    
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    
    const accessToken = jwt.sign(
      { ...payload, jti: uuidv4() },
      accessSecret,
      { expiresIn: constants.JWT_ACCESS_EXPIRES_IN as any }
    );
    
    const refreshToken = jwt.sign(
      { ...payload, jti: refreshTokenId },
      refreshSecret,
      { expiresIn: constants.JWT_REFRESH_EXPIRES_IN as any }
    );
    
    return { accessToken, refreshToken, refreshTokenId };
  }

  static async storeRefreshToken(
    userId: string, 
    jti: string, 
    expiresIn: number = 7 * 24 * 60 * 60 // 7 days in seconds
  ): Promise<void> {
    const key = `${constants.REDIS_TOKEN_PREFIX}${userId}:${jti}`;
    await redisClient.setEx(key, expiresIn, 'valid');
  }

  static async validateRefreshToken(
    userId: string, 
    jti: string
  ): Promise<boolean> {
    const key = `${constants.REDIS_TOKEN_PREFIX}${userId}:${jti}`;
    const exists = await redisClient.exists(key);
    return exists === 1;
  }

  static async revokeRefreshToken(
    userId: string, 
    jti: string
  ): Promise<void> {
    const key = `${constants.REDIS_TOKEN_PREFIX}${userId}:${jti}`;
    await redisClient.del(key);
  }

  static async revokeAllUserTokens(userId: string): Promise<void> {
    const pattern = `${constants.REDIS_TOKEN_PREFIX}${userId}:*`;
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }

  static verifyAccessToken(token: string): DecodedToken {
    const { accessSecret } = this.getSecrets();
    return jwt.verify(token, accessSecret) as DecodedToken;
  }

  static verifyRefreshToken(token: string): DecodedToken {
    const { refreshSecret } = this.getSecrets();
    return jwt.verify(token, refreshSecret) as DecodedToken;
  }

  static async blacklistToken(token: string, expiresIn: number): Promise<void> {
    const key = `${constants.REDIS_BLACKLIST_PREFIX}${token}`;
    await redisClient.setEx(key, expiresIn, 'blacklisted');
  }

  static async isTokenBlacklisted(token: string): Promise<boolean> {
    const key = `${constants.REDIS_BLACKLIST_PREFIX}${token}`;
    const exists = await redisClient.exists(key);
    return exists === 1;
  }

  static generateEmailVerificationToken(userId: string): string {
    const { accessSecret } = this.getSecrets();
    return jwt.sign(
      { userId, type: 'email_verification' },
      accessSecret,
      { expiresIn: constants.JWT_EMAIL_VERIFY_EXPIRES_IN as any }
    );
  }

  static generatePasswordResetToken(userId: string): string {
    const { accessSecret } = this.getSecrets();
    return jwt.sign(
      { userId, type: 'password_reset' },
      accessSecret,
      { expiresIn: constants.JWT_PASSWORD_RESET_EXPIRES_IN as any }
    );
  }
}
