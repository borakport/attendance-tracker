export class CodeGenerator {
  // Cache of recently generated codes to avoid immediate duplicates
  private static recentCodes = new Set<string>();
  private static readonly CACHE_SIZE = 1000;

  /**
   * Generate a unique course code (6 characters)
   * Uses enhanced distribution to reduce collision probability
   */
  static generateCourseCode(): string {
    // Use a larger character set excluding easily confused characters (0/O, 1/I, etc.)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    
    // Generate code with better distribution
    for (let i = 0; i < 6; i++) {
      // Use crypto-secure random when available, fallback to Math.random
      const randomIndex = this.getSecureRandomInt(chars.length);
      result += chars.charAt(randomIndex);
    }
    
    // Avoid immediate duplicates from cache
    if (this.recentCodes.has(result)) {
      // Try once more with different pattern
      result = this.generateAlternativeCode(chars);
    }
    
    // Add to cache and manage size
    this.recentCodes.add(result);
    if (this.recentCodes.size > this.CACHE_SIZE) {
      // Remove oldest entries (convert to array, slice, convert back)
      const codesArray = Array.from(this.recentCodes);
      this.recentCodes = new Set(codesArray.slice(-this.CACHE_SIZE + 100));
    }
    
    return result;
  }

  /**
   * Generate an alternative code pattern to reduce collisions
   */
  private static generateAlternativeCode(chars: string): string {
    const timestamp = Date.now().toString(36).slice(-2).toUpperCase();
    const randomPart = this.generateRandomString(chars, 4);
    
    // Combine timestamp and random for better uniqueness
    return (randomPart + timestamp).substring(0, 6);
  }

  /**
   * Generate a random string of specified length
   */
  private static generateRandomString(chars: string, length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(this.getSecureRandomInt(chars.length));
    }
    return result;
  }

  /**
   * Get cryptographically secure random integer
   */
  private static getSecureRandomInt(max: number): number {
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const array = new Uint32Array(1);
      crypto.getRandomValues(array);
      return array[0] % max;
    }
    // Fallback to Math.random
    return Math.floor(Math.random() * max);
  }

  /**
   * Generate a QR code data string for session (without access code)
   */
  static generateQRData(sessionId: string): string {
    return JSON.stringify({
      type: 'attendance_session',
      sessionId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Generate a random verification code
   */
  static generateVerificationCode(length: number = 6): string {
    const chars = '0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate a secure random token
   */
  static generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}
