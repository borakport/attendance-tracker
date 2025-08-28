export class CodeGenerator {
  /**
   * Generate a unique course code
   */
  static generateCourseCode(prefix: string = ''): string {
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString(36).substring(-2).toUpperCase();
    
    if (prefix) {
      return `${prefix.toUpperCase()}${randomPart}${timestamp}`;
    }
    
    return `${randomPart}${timestamp}`;
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
}
