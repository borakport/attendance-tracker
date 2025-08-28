import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Config } from '@/constants/config';
import Toast from 'react-native-toast-message';

type EventCallback = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isIntentionalDisconnect = false;

  async connect(): Promise<boolean> {
    try {
      if (this.socket?.connected) {
        console.log('✅ Socket already connected');
        return true;
      }

      const token = await AsyncStorage.getItem(Config.STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        console.log('❌ No auth token for socket connection');
        return false;
      }

      this.isIntentionalDisconnect = false;
      
      this.socket = io(Config.API.REALTIME_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.setupEventHandlers();
      
      return new Promise((resolve) => {
        const timeout = setTimeout(() => {
          resolve(false);
        }, 10000);

        this.socket!.on('connect', () => {
          clearTimeout(timeout);
          resolve(true);
        });
      });
    } catch (error) {
      console.error('❌ Socket connection error:', error);
      return false;
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.reconnectAttempts = 0;
      this.emit('connected', { socketId: this.socket?.id });
      
      Toast.show({
        type: 'success',
        text1: 'Connected',
        text2: 'Real-time updates active',
        visibilityTime: 2000,
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.emit('disconnected', { reason });
      
      if (!this.isIntentionalDisconnect) {
        Toast.show({
          type: 'info',
          text1: 'Connection Lost',
          text2: 'Reconnecting...',
          visibilityTime: 2000,
        });
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        Toast.show({
          type: 'error',
          text1: 'Connection Failed',
          text2: 'Unable to connect to server',
        });
      }
    });

    // Attendance events
    this.socket.on('attendance:marked', (data) => {
      console.log('📍 Attendance marked event:', data);
      this.emit('attendance:marked', data);
      
      Toast.show({
        type: 'info',
        text1: 'Attendance Update',
        text2: `${data.userName} marked ${data.status}`,
      });
    });

    this.socket.on('attendance:confirmed', (data) => {
      console.log('✅ Attendance confirmed:', data);
      this.emit('attendance:confirmed', data);
      
      Toast.show({
        type: 'success',
        text1: 'Attendance Confirmed',
        text2: `Your attendance is ${data.status}`,
      });
    });

    // Session events
    this.socket.on('session:started', (data) => {
      console.log('🔴 Session started:', data);
      this.emit('session:started', data);
      
      Toast.show({
        type: 'info',
        text1: 'Session Started',
        text2: data.sessionName || 'A session has started',
      });
    });

    this.socket.on('session:ended', (data) => {
      console.log('🏁 Session ended:', data);
      this.emit('session:ended', data);
      
      Toast.show({
        type: 'info',
        text1: 'Session Ended',
        text2: data.sessionName || 'A session has ended',
      });
    });

    // Course events
    this.socket.on('course:joined', (data) => {
      console.log('📚 Course joined:', data);
      this.emit('course:joined', data);
    });

    this.socket.on('member:joined', (data) => {
      console.log('👤 New member:', data);
      this.emit('member:joined', data);
    });

    // Debug events (development only)
    if (Config.APP.DEBUG) {
      this.socket.onAny((event, ...args) => {
        console.log(`🔧 Socket Event: ${event}`, args);
      });
    }
  }

  // Room management
  joinCourse(courseId: string) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected');
      return;
    }
    this.socket.emit('course:join', courseId);
    console.log(`📚 Joined course room: ${courseId}`);
  }

  leaveCourse(courseId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('course:leave', courseId);
    console.log(`📚 Left course room: ${courseId}`);
  }

  monitorSession(sessionId: string) {
    if (!this.socket?.connected) {
      console.warn('⚠️ Socket not connected');
      return;
    }
    this.socket.emit('session:monitor', sessionId);
    console.log(`📍 Monitoring session: ${sessionId}`);
  }

  unmonitorSession(sessionId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('session:unmonitor', sessionId);
    console.log(`📍 Stopped monitoring session: ${sessionId}`);
  }

  // Event subscription
  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
    
    // If socket exists and event is a socket event, add listener
    if (this.socket && !['connected', 'disconnected'].includes(event)) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback: EventCallback) {
    this.listeners.get(event)?.delete(callback);
    
    // Remove from socket if exists
    if (this.socket && !['connected', 'disconnected'].includes(event)) {
      this.socket.off(event, callback);
    }
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event callback for ${event}:`, error);
      }
    });
  }

  // Custom event emission to server
  sendEvent(event: string, data: any) {
    if (!this.socket?.connected) {
      console.warn(`⚠️ Cannot send event '${event}': Not connected`);
      return;
    }
    this.socket.emit(event, data);
  }

  disconnect() {
    this.isIntentionalDisconnect = true;
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.listeners.clear();
    console.log('🔌 Socket disconnected');
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getSocketId(): string | null {
    return this.socket?.id || null;
  }
}

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ WebSocket connected:', this.socket?.id);
      this.emit('connected', { socketId: this.socket?.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason);
      this.emit('disconnected', { reason });
    });

    // Attendance events
    this.socket.on('attendance:marked', (data) => {
      console.log('📍 Attendance marked:', data);
      this.emit('attendance:marked', data);
    });

    this.socket.on('attendance:confirmed', (data) => {
      console.log('✅ Attendance confirmed:', data);
      this.emit('attendance:confirmed', data);
    });

    // Session events
    this.socket.on('session:started', (data) => {
      console.log('🔴 Session started:', data);
      this.emit('session:started', data);
    });

    this.socket.on('session:ended', (data) => {
      console.log('🏁 Session ended:', data);
      this.emit('session:ended', data);
    });

    // Course events
    this.socket.on('course:joined', (data) => {
      console.log('📚 Course joined:', data);
      this.emit('course:joined', data);
    });
  }

  joinCourse(courseId: string) {
    this.socket?.emit('course:join', courseId);
  }

  monitorSession(sessionId: string) {
    this.socket?.emit('session:monitor', sessionId);
  }

  // Event emitter pattern for components to subscribe
  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)?.add(callback);
  }

  off(event: string, callback: Function) {
    this.listeners.get(event)?.delete(callback);
  }

  private emit(event: string, data: any) {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.listeners.clear();
  }
}

export default new SocketService();
