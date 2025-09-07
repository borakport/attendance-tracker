/**
 * Auth Service Client
 * 
 * Utility to communicate with the auth service for operations like password verification.
 */

import axios from 'axios';

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';

export class AuthServiceClient {
  /**
   * Verify user password for security-sensitive operations
   */
  static async verifyPassword(password: string, accessToken: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${AUTH_SERVICE_URL}/api/v1/auth/verify-password`,
        { password },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 5000, // 5 second timeout
        }
      );

      return response.data?.data?.verified === true;
    } catch (error) {
      console.error('Error verifying password with auth service:', error);
      return false;
    }
  }
}
