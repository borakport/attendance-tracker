import { io, Socket } from 'socket.io-client';
import { generateServiceToken } from '../utils/service-auth';

class RealtimeClient {
  private socket: Socket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting: boolean = false;
  private initialized: boolean = false;

  constructor() {
    // Don't connect immediately - wait for init() to be called
  }

  // Call this method after environment variables are loaded
  public init(): void {
    if (this.initialized) return;
    this.initialized = true;
    this.connect();
  }

  private connect(): void {
    if (this.isConnecting || this.socket?.connected) {
      return;
    }

    this.isConnecting = true;

    const serviceKey = process.env.SERVICE_AUTH_KEY;
    const serviceName = process.env.SERVICE_NAME || 'attendance-service';
    const realtimeUrl = process.env.REALTIME_SERVICE_URL || 'http://localhost:3003';

    console.log('🔌 Attempting to connect to realtime service...');
    console.log('Service Name:', serviceName);
    console.log('Realtime URL:', realtimeUrl + '/service');
    console.log('Service Key configured:', !!serviceKey);

    if (!serviceKey) {
      console.error('❌ SERVICE_AUTH_KEY not configured in environment!');
      console.error('Please add SERVICE_AUTH_KEY to your .env file');
      this.isConnecting = false;
      this.scheduleReconnect();
      return;
    }

    try {
      // Generate fresh token for this connection
      const serviceToken = generateServiceToken(serviceName, serviceKey);
      console.log('📝 Service token generated, length:', serviceToken.length);

      // Create socket connection
      this.socket = io(`${realtimeUrl}/service`, {
        auth: {
          serviceToken
        },
        transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 20000,
      });

      // Set up event handlers
      this.setupEventHandlers();

    } catch (error) {
      console.error('❌ Failed to create socket connection:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Successfully connected to realtime service');
      console.log('Socket ID:', this.socket?.id);
      this.isConnecting = false;
      this.clearReconnectTimer();
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`📴 Disconnected from realtime service: ${reason}`);
      this.isConnecting = false;
      
      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect' || reason === 'transport close') {
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      console.error('Error details:', error);
      this.isConnecting = false;

      // Handle specific error types
      if (error.message.includes('token')) {
        console.log('🔄 Token issue detected, regenerating...');
        this.regenerateTokenAndReconnect();
      } else if (error.message.includes('ECONNREFUSED')) {
        console.error('⚠️ Realtime service appears to be down at', process.env.REALTIME_SERVICE_URL);
        this.scheduleReconnect();
      } else {
        this.scheduleReconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  }

  private regenerateTokenAndReconnect(): void {
    if (!this.socket) return;

    const serviceKey = process.env.SERVICE_AUTH_KEY;
    const serviceName = process.env.SERVICE_NAME || 'attendance-service';

    if (!serviceKey) {
      console.error('❌ Cannot regenerate token: SERVICE_AUTH_KEY not configured');
      return;
    }

    try {
      console.log('🔄 Regenerating service token...');
      const newToken = generateServiceToken(serviceName, serviceKey);
      
      // Update auth and reconnect
      this.socket.auth = { serviceToken: newToken };
      this.socket.connect();
    } catch (error) {
      console.error('❌ Failed to regenerate token:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    const delay = 5000; // 5 seconds
    console.log(`⏱️ Scheduling reconnection in ${delay}ms...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  public emit(event: string, data: any): void {
    if (!this.socket?.connected) {
      console.warn(`⚠️ Cannot emit '${event}': Not connected to realtime service`);
      console.log('Queued event data:', data);
      // Optionally, queue events to send when connected
      return;
    }

    console.log(`📡 Emitting event: ${event}`);
    this.socket.emit(event, data);
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public disconnect(): void {
    this.clearReconnectTimer();
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

// Create singleton instance
const realtimeClient = new RealtimeClient();

export default realtimeClient;
