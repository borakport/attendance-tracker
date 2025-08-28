import { io, Socket } from 'socket.io-client';
import { generateServiceToken } from './service-auth';

class RealtimeConnectionManager {
  private static instance: RealtimeConnectionManager;
  private socket: Socket | null = null;
  private isConnecting = false;

  private constructor() {
    // Private constructor for singleton
  }

  static getInstance(): RealtimeConnectionManager {
    if (!RealtimeConnectionManager.instance) {
      RealtimeConnectionManager.instance = new RealtimeConnectionManager();
    }
    return RealtimeConnectionManager.instance;
  }

  async getConnection(): Promise<Socket | null> {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.isConnecting) {
      // Wait for existing connection attempt
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.socket?.connected) {
            resolve(this.socket);
          } else if (!this.isConnecting) {
            resolve(null);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    return this.connect();
  }

  private async connect(): Promise<Socket | null> {
    this.isConnecting = true;

    try {
      const serviceKey = process.env.SERVICE_AUTH_KEY;
      const serviceName = process.env.SERVICE_NAME || 'attendance-service';

      if (!serviceKey) {
        console.error('❌ SERVICE_AUTH_KEY not configured!');
        this.isConnecting = false;
        return null;
      }

      // Generate service token
      const serviceToken = generateServiceToken(serviceName, serviceKey);

      // Create single connection for entire service
      this.socket = io(`${process.env.REALTIME_SERVICE_URL || 'http://localhost:3003'}/service`, {
        auth: { serviceToken },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
      });

      // Connection event handlers
      this.socket.on('connect', () => {
        console.log('✅ [SINGLETON] Securely connected to realtime service');
        this.isConnecting = false;
      });

      this.socket.on('disconnect', (reason) => {
        console.log(`❌ [SINGLETON] Disconnected from realtime service: ${reason}`);
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ [SINGLETON] Realtime service connection error:', error.message);
        this.isConnecting = false;

        // Regenerate token on auth errors
        if (error.message.includes('token')) {
          setTimeout(() => {
            const newToken = generateServiceToken(serviceName, serviceKey);
            if (this.socket) {
              this.socket.auth = { serviceToken: newToken };
              this.socket.connect();
            }
          }, 5000);
        }
      });

      // Wait for connection to establish
      return new Promise((resolve, reject) => {
        this.socket!.on('connect', () => {
          resolve(this.socket);
        });

        this.socket!.on('connect_error', (error) => {
          reject(error);
        });

        // Timeout after 10 seconds
        setTimeout(() => {
          if (!this.socket?.connected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      });

    } catch (error) {
      console.error('❌ Failed to connect to realtime service:', error);
      this.isConnecting = false;
      return null;
    }
  }

  async emit(event: string, data: any): Promise<boolean> {
    try {
      const socket = await this.getConnection();
      if (socket?.connected) {
        console.log(`📡 [SINGLETON] Emitting ${event} event (secure)`);
        socket.emit(event, data);
        return true;
      } else {
        console.warn('⚠️ [SINGLETON] Realtime service not connected, event not sent');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to emit event:', error);
      return false;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Export singleton instance
export const realtimeConnection = RealtimeConnectionManager.getInstance();
