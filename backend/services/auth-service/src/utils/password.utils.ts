import bcrypt from 'bcrypt';
import { constants } from '../config/constants';

export class PasswordUtils {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, constants.BCRYPT_ROUNDS);
  }

  static async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static validate(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < constants.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${constants.PASSWORD_MIN_LENGTH} characters long`);
    }

    if (!constants.PASSWORD_REGEX.test(password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static generateRandomPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@$!%*?&';
    let password = '';
    
    // Ensure at least one of each required character type
    password += 'A'; // uppercase
    password += 'a'; // lowercase
    password += '1'; // number
    password += '@'; // special
    
    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }
}
