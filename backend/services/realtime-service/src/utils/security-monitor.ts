import { EventEmitter } from 'events';

interface SecurityEvent {
  timestamp: Date;
  service: string;
  event: string;
  ip: string;
  status: 'allowed' | 'denied' | 'rate-limited';
  reason?: string;
}

class SecurityMonitor extends EventEmitter {
  private events: SecurityEvent[] = [];
  private readonly MAX_EVENTS = 1000;
  
  logEvent(event: SecurityEvent) {
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.MAX_EVENTS) {
      this.events.shift();
    }
    
    // Emit for real-time monitoring
    this.emit('security-event', event);
    
    // Log suspicious activity
    if (event.status === 'denied') {
      console.warn(`🚨 Security Alert: ${event.reason} from ${event.service} at ${event.ip}`);
    }
  }
  
  getRecentEvents(minutes: number = 60): SecurityEvent[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.events.filter(e => e.timestamp > cutoff);
  }
  
  getSuspiciousActivity(): SecurityEvent[] {
    return this.events.filter(e => e.status !== 'allowed');
  }
}

export const securityMonitor = new SecurityMonitor();
