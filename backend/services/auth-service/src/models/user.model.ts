import { PrismaClient, User, UserRole, Prisma } from '@prisma/client';
import logger from '../config/logger';

const prisma = new PrismaClient();

export interface CreateUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: UserRole;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  lastLogin?: Date;
  loginAttempts?: number;
  accountLocked?: boolean;
  password?: string;
}

export interface UserFilters {
  email?: string;
  role?: UserRole;
  emailVerified?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

export class UserModel {
  /**
   * Create a new user
   */
  static async create(data: CreateUserData): Promise<User> {
    try {
      const user = await prisma.user.create({
        data: {
          ...data,
          role: data.role || UserRole.STUDENT,
        },
      });
      
      logger.info(`User created: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { id },
      });
    } catch (error) {
      logger.error('Error finding user by ID:', error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
    } catch (error) {
      logger.error('Error finding user by email:', error);
      throw error;
    }
  }

  /**
   * Update user by ID
   */
  static async updateById(id: string, data: UpdateUserData): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data,
      });
      
      logger.info(`User updated: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Delete user by ID
   */
  static async deleteById(id: string): Promise<User> {
    try {
      const user = await prisma.user.delete({
        where: { id },
      });
      
      logger.info(`User deleted: ${user.email}`);
      return user;
    } catch (error) {
      logger.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Find users with filters and pagination
   */
  static async findMany(
    filters: UserFilters = {},
    options: {
      skip?: number;
      take?: number;
      orderBy?: Prisma.UserOrderByWithRelationInput;
    } = {}
  ): Promise<User[]> {
    try {
      const where: Prisma.UserWhereInput = {};

      if (filters.email) {
        where.email = { contains: filters.email, mode: 'insensitive' };
      }
      if (filters.role) {
        where.role = filters.role;
      }
      if (filters.emailVerified !== undefined) {
        where.emailVerified = filters.emailVerified;
      }
      if (filters.createdAfter || filters.createdBefore) {
        where.createdAt = {};
        if (filters.createdAfter) {
          where.createdAt.gte = filters.createdAfter;
        }
        if (filters.createdBefore) {
          where.createdAt.lte = filters.createdBefore;
        }
      }

      return await prisma.user.findMany({
        where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy || { createdAt: 'desc' },
      });
    } catch (error) {
      logger.error('Error finding users:', error);
      throw error;
    }
  }

  /**
   * Count users with filters
   */
  static async count(filters: UserFilters = {}): Promise<number> {
    try {
      const where: Prisma.UserWhereInput = {};

      if (filters.email) {
        where.email = { contains: filters.email, mode: 'insensitive' };
      }
      if (filters.role) {
        where.role = filters.role;
      }
      if (filters.emailVerified !== undefined) {
        where.emailVerified = filters.emailVerified;
      }

      return await prisma.user.count({ where });
    } catch (error) {
      logger.error('Error counting users:', error);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  static async emailExists(email: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true },
      });
      return !!user;
    } catch (error) {
      logger.error('Error checking email existence:', error);
      throw error;
    }
  }

  /**
   * Update user login attempts and lock account if needed
   */
  static async updateLoginAttempts(id: string, increment: boolean = true): Promise<User> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { loginAttempts: true, accountLocked: true },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const updateData: UpdateUserData = {};

      if (increment) {
        const attempts = (user.loginAttempts || 0) + 1;
        updateData.loginAttempts = attempts;

        // Lock account after max attempts
        if (attempts >= 5) {
          updateData.accountLocked = true;
        }
      } else {
        // Reset attempts on successful login
        updateData.loginAttempts = 0;
        updateData.accountLocked = false;
        updateData.lastLogin = new Date();
      }

      return await this.updateById(id, updateData);
    } catch (error) {
      logger.error('Error updating login attempts:', error);
      throw error;
    }
  }

  /**
   * Check if user account is locked
   */
  static async isAccountLocked(id: string): Promise<boolean> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        select: { accountLocked: true },
      });

      return user?.accountLocked || false;
    } catch (error) {
      logger.error('Error checking account lock status:', error);
      throw error;
    }
  }
}

export { prisma };
export default UserModel;
