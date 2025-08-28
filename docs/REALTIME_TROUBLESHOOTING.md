# Realtime Service Troubleshooting Guide

**Last Updated:** 2025-08-27 17:31:46 UTC  
**Author:** borakport

## 🚨 Common Issues & Solutions

### 1. WebSocket Connection Issues

#### Issue: `xhr poll error` in Browser Console
**Symptoms:**
```
GET http://localhost:3003/socket.io/?EIO=4&transport=polling&t=xyz net::ERR_FAILED
```

**Possible Causes:**
- Realtime service not running
- CORS configuration blocking connection
- Wrong port or URL

**Solutions:**
```bash
# 1. Verify service is running
curl http://localhost:3003/health

# 2. Check service logs
cd backend/services/realtime-service
npm start

# 3. Test with correct URL in client
const socket = io('http://localhost:3003', {
  auth: { token: 'your-jwt-token' }
});
```

#### Issue: Authentication Failed
**Symptoms:**
```
Socket.io error: Invalid authentication token
```

**Solutions:**
```javascript
// 1. Check token format
console.log('Token:', localStorage.getItem('authToken'));

// 2. Verify JWT secret matches across services
// In .env files: JWT_SECRET=same-secret-everywhere

// 3. Check token expiration
const decoded = jwt.decode(token);
console.log('Token expires:', new Date(decoded.exp * 1000));
```

### 2. Events Not Flowing

#### Issue: Attendance Events Not Received
**Symptoms:**
- API call succeeds but no realtime notification
- WebSocket connected but no `attendance:update` events

**Debugging Steps:**
```bash
# 1. Check attendance service logs
cd backend/services/attendance-service
tail -f logs/combined.log

# 2. Verify realtime service receives events
cd backend/services/realtime-service
# Look for: "attendance:marked" in console

# 3. Test manual event emission
```

**Manual Testing:**
```javascript
// In browser console connected to realtime service
socket.emit('attendance:marked', {
  sessionId: 'test-session-id',
  userId: 'test-user-id',
  userName: 'Test User',
  status: 'PRESENT',
  markedAt: new Date().toISOString()
});
```

#### Issue: Not Receiving Session Updates
**Symptoms:**
- `session:started` events not received
- Students not notified when session begins

**Check Room Membership:**
```javascript
// In realtime service logs, verify:
// "Client joined room: session:xxx"

// Test room joining
socket.emit('join-room', 'session:your-session-id');
```

### 3. Service Communication Problems

#### Issue: Socket.io Client Connection from Attendance Service
**Symptoms:**
- Attendance service can't connect to realtime service
- `realtimeSocket.emit` calls fail silently

**Check Connection:**
```typescript
// In attendance service controller
console.log('Realtime socket connected:', 
  AttendanceController.realtimeSocket.connected
);

// Add connection event handlers
AttendanceController.realtimeSocket.on('connect', () => {
  console.log('✅ Connected to realtime service');
});

AttendanceController.realtimeSocket.on('connect_error', (error) => {
  console.error('❌ Failed to connect to realtime service:', error);
});
```

### 4. Redis Integration Issues

#### Issue: Redis Connection Failed
**Symptoms:**
```
Redis connection error: ECONNREFUSED
```

**Solutions:**
```bash
# 1. Check Redis is running
redis-cli ping
# Should return: PONG

# 2. Start Redis if not running
redis-server

# 3. Check Redis URL in .env
REDIS_URL=redis://localhost:6379
```

#### Issue: Redis Pub/Sub Not Working
**Symptoms:**
- Events published but not received
- Multiple service instances not syncing

**Debug Redis Pub/Sub:**
```bash
# Terminal 1: Monitor all Redis activity
redis-cli monitor

# Terminal 2: Test publish
redis-cli publish attendance:marked '{"test": "data"}'

# Terminal 3: Test subscribe
redis-cli subscribe attendance:marked
```

### 5. Performance Issues

#### Issue: High Memory Usage
**Symptoms:**
- Service becomes slow with many connections
- Memory usage keeps increasing

**Solutions:**
```javascript
// 1. Monitor connection count
console.log('Connected clients:', io.engine.clientsCount);

// 2. Clean up disconnected sockets
io.on('disconnect', (socket) => {
  // Ensure proper cleanup
  socket.removeAllListeners();
});

// 3. Implement connection limits
const io = new Server(server, {
  maxHttpBufferSize: 1e6, // 1MB
  pingTimeout: 60000,
  pingInterval: 25000
});
```

#### Issue: Event Flooding
**Symptoms:**
- Too many events being sent
- Clients becoming unresponsive

**Rate Limiting:**
```javascript
// Implement simple rate limiting
const eventCounts = new Map();

socket.on('attendance:marked', (data) => {
  const userId = socket.userId;
  const count = eventCounts.get(userId) || 0;
  
  if (count > 10) { // Max 10 events per minute
    socket.emit('error', 'Rate limit exceeded');
    return;
  }
  
  eventCounts.set(userId, count + 1);
  setTimeout(() => eventCounts.delete(userId), 60000);
  
  // Process event normally
});
```

## 🔍 Debugging Tools & Techniques

### 1. WebSocket Testing Tool
**File:** `backend/services/realtime-service/test-websocket.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>WebSocket Tester</title>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
</head>
<body>
    <h1>Realtime Service Tester</h1>
    <div id="status">Disconnected</div>
    <div id="events"></div>

    <script>
        // Replace with your actual JWT token
        const token = 'your-jwt-token-here';
        
        const socket = io('http://localhost:3003', {
            auth: { token }
        });

        const statusDiv = document.getElementById('status');
        const eventsDiv = document.getElementById('events');

        socket.on('connect', () => {
            statusDiv.textContent = 'Connected ✅';
            statusDiv.style.color = 'green';
        });

        socket.on('disconnect', () => {
            statusDiv.textContent = 'Disconnected ❌';
            statusDiv.style.color = 'red';
        });

        socket.on('connect_error', (error) => {
            statusDiv.textContent = `Error: ${error.message}`;
            statusDiv.style.color = 'red';
        });

        // Listen to all events
        const originalOn = socket.on;
        socket.on = function(event, handler) {
            return originalOn.call(this, event, (data) => {
                console.log(`📨 ${event}:`, data);
                
                const eventElement = document.createElement('div');
                eventElement.innerHTML = `
                    <strong>${event}</strong>: 
                    <pre>${JSON.stringify(data, null, 2)}</pre>
                `;
                eventsDiv.appendChild(eventElement);
                
                handler(data);
            });
        };

        // Test events
        function testAttendanceMarked() {
            socket.emit('attendance:marked', {
                sessionId: 'test-session',
                userId: 'test-user',
                userName: 'Test User',
                status: 'PRESENT',
                markedAt: new Date().toISOString()
            });
        }

        // Add test button
        const button = document.createElement('button');
        button.textContent = 'Test Attendance Event';
        button.onclick = testAttendanceMarked;
        document.body.appendChild(button);
    </script>
</body>
</html>
```

### 2. Service Health Monitoring
```bash
#!/bin/bash
# health-check.sh

echo "=== Realtime Service Health Check ==="

# 1. Check service response
echo "1. Health endpoint:"
curl -s http://localhost:3003/health | jq '.'

# 2. Check Redis connection
echo -e "\n2. Redis connection:"
redis-cli ping

# 3. Check WebSocket upgrade
echo -e "\n3. WebSocket upgrade test:"
curl -i -N -H "Connection: Upgrade" \
     -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Version: 13" \
     -H "Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==" \
     http://localhost:3003/socket.io/

# 4. Check process
echo -e "\n4. Process status:"
ps aux | grep "realtime-service" | grep -v grep
```

### 3. Event Flow Tracing
```javascript
// Add to realtime service for debugging
class EventTracer {
  constructor() {
    this.events = [];
  }

  trace(eventType, data, source = 'unknown') {
    const event = {
      type: eventType,
      data,
      source,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.events.push(event);
    console.log(`🔍 TRACE [${event.id}] ${eventType} from ${source}`);
    
    // Keep only last 100 events
    if (this.events.length > 100) {
      this.events.shift();
    }
  }

  getEvents() {
    return this.events;
  }
}

const tracer = new EventTracer();

// Use in handlers
socket.on('attendance:marked', (data) => {
  tracer.trace('attendance:marked', data, 'attendance-service');
  // ... rest of handler
});
```

## 🛠️ Development Tips

### 1. Hot Reload Setup
```json
// package.json - for development
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "dev:debug": "nodemon --exec 'node --inspect=0.0.0.0:9229 -r ts-node/register src/index.ts'"
  }
}
```

### 2. Environment-Specific Configs
```typescript
// config/environment.ts
export const config = {
  development: {
    cors: { origin: '*' },
    logLevel: 'debug'
  },
  production: {
    cors: { origin: process.env.ALLOWED_ORIGINS?.split(',') },
    logLevel: 'error'
  }
};
```

### 3. Comprehensive Logging
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/realtime-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/realtime-combined.log' }),
    new winston.transports.Console()
  ]
});

// Use in handlers
logger.info('Attendance marked', { 
  sessionId: data.sessionId, 
  userId: data.userId,
  clientCount: io.engine.clientsCount 
});
```

## 📊 Monitoring & Metrics

### Key Metrics to Track
1. **Connection Count:** `io.engine.clientsCount`
2. **Event Rate:** Events per second/minute
3. **Response Time:** Time from emit to client receive
4. **Error Rate:** Failed connections/authentications
5. **Memory Usage:** Node.js heap size
6. **Redis Latency:** Pub/sub message delay

### Simple Metrics Collection
```javascript
class Metrics {
  constructor() {
    this.stats = {
      connections: 0,
      events: {},
      errors: 0
    };
  }

  incrementEvent(eventType) {
    this.stats.events[eventType] = (this.stats.events[eventType] || 0) + 1;
  }

  getStats() {
    return {
      ...this.stats,
      timestamp: new Date().toISOString(),
      memoryUsage: process.memoryUsage(),
      uptime: process.uptime()
    };
  }
}

const metrics = new Metrics();

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.json(metrics.getStats());
});
```

---

**Pro Tip:** Keep this troubleshooting guide handy during development. Most realtime issues are related to connection, authentication, or room management problems that can be quickly diagnosed with these tools.
