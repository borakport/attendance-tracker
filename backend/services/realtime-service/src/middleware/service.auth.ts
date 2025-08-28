import { Socket } from 'socket.io';
import crypto from 'crypto';

export interface ServiceSocket extends Socket {
  serviceName?: string;
  serviceAuthenticated?: boolean;
}

/**
 * Generate a service token with timestamp to prevent replay attacks
 */
export function generateServiceToken(serviceName: string, apiKey: string): string {
  const timestamp = Date.now();
  const data = `${serviceName}:${timestamp}`;
  const signature = crypto
    .createHmac('sha256', apiKey)
    .update(data)
    .digest('hex');
  
  return Buffer.from(JSON.stringify({
    service: serviceName,
    timestamp,
    signature
  })).toString('base64');
}

/**
 * Verify service token
 */
export function verifyServiceToken(token: string, apiKey: string): { 
  valid: boolean; 
  service?: string; 
  error?: string;
} {
  try {
    // Decode the token
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
    const { service, timestamp, signature } = decoded;
    
    // Check token age (5 minutes max)
    const tokenAge = Date.now() - timestamp;
    if (tokenAge > 5 * 60 * 1000) {
      return { valid: false, error: 'Token expired' };
    }
    
    // Verify signature
    const data = `${service}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac('sha256', apiKey)
      .update(data)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return { valid: false, error: 'Invalid signature' };
    }
    
    // Check if service is allowed
    const allowedServices = (process.env.ALLOWED_SERVICES || '').split(',');
    if (!allowedServices.includes(service)) {
      return { valid: false, error: 'Service not allowed' };
    }
    
    return { valid: true, service };
  } catch (error) {
    return { valid: false, error: 'Invalid token format' };
  }
}

/**
 * Middleware to authenticate service connections
 */
export const authenticateService = async (
  socket: ServiceSocket, 
  next: any
): Promise<void> => {
  try {
    const token = socket.handshake.auth.serviceToken;
    const apiKey = process.env.SERVICE_AUTH_KEY;
    
    if (!token) {
      console.error('⚠️ Service connection attempt without token from:', socket.handshake.address);
      return next(new Error('No service token provided'));
    }
    
    if (!apiKey) {
      console.error('❌ SERVICE_AUTH_KEY not configured!');
      return next(new Error('Server configuration error'));
    }
    
    const verification = verifyServiceToken(token, apiKey);
    
    if (!verification.valid) {
      console.error(`⚠️ Invalid service token from ${socket.handshake.address}: ${verification.error}`);
      return next(new Error(verification.error || 'Invalid service token'));
    }
    
    // Attach service info to socket
    socket.serviceName = verification.service;
    socket.serviceAuthenticated = true;
    
    console.log(`✅ Service authenticated: ${verification.service} from ${socket.handshake.address}`);
    next();
  } catch (error: any) {
    console.error('❌ Service authentication error:', error);
    next(new Error('Service authentication failed'));
  }
};
