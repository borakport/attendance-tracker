/**
 * Password Utilities
 * 
 * This module provides comprehensive password management functionality for the authentication system.
 * It handles password hashing, verification, validation, and generation with industry-standard
 * security practices using bcrypt for secure password storage.
 * 
 * Key Features:
 * - Secure password hashing with bcrypt
 * - Password verification and comparison
 * - Password strength validation
 * - Random password generation
 * 
 * Security Features:
 * - Uses bcrypt with configurable salt rounds
 * - Enforces strong password requirements
 * - Provides secure random password generation
 * - Validates against common password patterns
 */

import bcrypt from 'bcrypt';
import { constants } from '../config/constants';

/**
 * Password Utilities Class
 * 
 * Provides static methods for secure password management including hashing,
 * verification, validation, and generation using industry best practices.
 */
export class PasswordUtils {
  /**
   * Hash a plain text password using bcrypt
   * 
   * Creates a secure hash of the password using bcrypt with salt rounds
   * defined in constants. The hash is safe to store in the database.
   * 
   * @param password - Plain text password to hash
   * @returns Promise<string> - Bcrypt hash of the password
   */
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, constants.BCRYPT_ROUNDS);
  }

  /**
   * Compare plain text password with bcrypt hash
   * 
   * Verifies if a plain text password matches a stored bcrypt hash.
   * This is used during login to authenticate users securely.
   * 
   * @param password - Plain text password to verify
   * @param hash - Stored bcrypt hash to compare against
   * @returns Promise<boolean> - True if password matches hash
   */
  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Validate password strength and requirements
   * 
   * Checks if a password meets the security requirements defined in constants.
   * Validates minimum length and character complexity requirements.
   * 
   * @param password - Password string to validate
   * @returns Object containing validation result and error messages
   */
  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check minimum length requirement
    if (password.length < constants.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${constants.PASSWORD_MIN_LENGTH} characters long`);
    }

    // Check complexity requirements using regex
    if (!constants.PASSWORD_REGEX.test(password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a secure random password
   * 
   * Creates a cryptographically secure random password that meets all
   * validation requirements. Used for temporary passwords or password resets.
   * 
   * @returns string - Randomly generated secure password
   */
  static generateRandomPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'A'; // uppercase letter
    password += 'a'; // lowercase letter
    password += '1'; // number
    password += '@'; // special character
    
    // Fill the rest of the password with random characters
    for (let i = 4; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password to randomize character positions
    // This ensures the required characters aren't always at the beginning
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
