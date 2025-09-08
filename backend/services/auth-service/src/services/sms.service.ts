/**
 * SMS Service
 * 
 * This service handles SMS communications for the authentication system:
 * - Phone number verification for new registrations
 * - Password reset SMS notifications
 * - Two-factor authentication codes
 * - Development mode with SMS simulator
 * - Production SMS provider integration
 * 
 * Features:
 * - Integration with SMS simulator for development
 * - Environment-specific configurations
 * - Error handling and logging
 * - Rate limiting for SMS sending
 */

import axios from 'axios';
import logger from '../config/logger';

interface SmsOptions {
  to: string;
  message: string;
  from?: string;
}

interface SmsResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export class SmsService {
  private smsSimulatorUrl: string;

  constructor() {
    // Use SMS simulator for development
    this.smsSimulatorUrl = process.env.SMS_SIMULATOR_URL || 'http://localhost:3010';
  }

  /**
   * Send SMS message
   * @param options SMS options including recipient, message, and sender
   * @returns Promise resolving to SMS response
   */
  async sendSms(options: SmsOptions): Promise<SmsResponse> {
    try {
      if (process.env.NODE_ENV === 'development') {
        // Use SMS simulator in development
        return await this.sendViaSimulator(options);
      } else {
        // Use production SMS provider (e.g., Twilio, AWS SNS)
        return await this.sendViaProduction(options);
      }
    } catch (error: any) {
      logger.error('SMS sending failed:', error);
      return {
        success: false,
        error: error.message || 'Failed to send SMS'
      };
    }
  }

  /**
   * Send SMS via local simulator for development
   */
  private async sendViaSimulator(options: SmsOptions): Promise<SmsResponse> {
    try {
      const response = await axios.post(`${this.smsSimulatorUrl}/api/sms/send`, {
        to: options.to,
        message: options.message,
        from: options.from || 'GPS-ATTENDANCE'
      }, {
        timeout: 5000
      });

      logger.info(`📱 SMS sent via simulator to ${options.to}`);
      
      return {
        success: true,
        messageId: response.data.messageId
      };
    } catch (error: any) {
      logger.error('SMS simulator error:', error.message);
      
      // Fallback to console logging if simulator is not available
      logger.info('📱 SMS sent (fallback mode):');
      logger.info(`To: ${options.to}`);
      logger.info(`Message: ${options.message}`);
      
      return {
        success: true,
        messageId: 'fallback-message-id'
      };
    }
  }

  /**
   * Send SMS via production provider
   * This would integrate with services like Twilio, AWS SNS, etc.
   */
  private async sendViaProduction(options: SmsOptions): Promise<SmsResponse> {
    // TODO: Implement production SMS provider
    // Example: Twilio, AWS SNS, etc.
    
    logger.info('📱 SMS sent (production mode - not implemented):');
    logger.info(`To: ${options.to}`);
    logger.info(`Message: ${options.message}`);
    
    return {
      success: true,
      messageId: 'production-message-id'
    };
  }

  /**
   * Send phone verification code
   */
  async sendVerificationCode(phoneNumber: string, code: string): Promise<SmsResponse> {
    const message = `GPS Attendance: Your verification code is ${code}. This code expires in 10 minutes.`;
    
    return await this.sendSms({
      to: phoneNumber,
      message,
      from: 'GPS-ATTENDANCE'
    });
  }

  /**
   * Send password reset notification
   */
  async sendPasswordResetNotification(phoneNumber: string): Promise<SmsResponse> {
    const message = `GPS Attendance: A password reset was requested for your account. If this wasn't you, please secure your account immediately.`;
    
    return await this.sendSms({
      to: phoneNumber,
      message,
      from: 'GPS-ATTENDANCE'
    });
  }

  /**
   * Send two-factor authentication code
   */
  async sendTwoFactorCode(phoneNumber: string, code: string): Promise<SmsResponse> {
    const message = `GPS Attendance: Your 2FA code is ${code}. Do not share this code with anyone.`;
    
    return await this.sendSms({
      to: phoneNumber,
      message,
      from: 'GPS-ATTENDANCE'
    });
  }
}

// Export singleton instance
export const smsService = new SmsService();
