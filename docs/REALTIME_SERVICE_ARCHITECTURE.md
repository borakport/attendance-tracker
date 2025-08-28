# Realtime Service Architecture & Integration

**Last Updated:** 2025-08-27 17:31:46 UTC  
**Author:** borakport  
**Service Port:** 3003

## 🏗️ Architecture Overview

The Realtime Service is a WebSocket server that acts as a bridge between backend services and client applications (web/mobile). It doesn't interact with the database directly but receives events from other services and broadcasts them to connected clients.

```
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Auth Service    │ │Attendance Service│ │ Mobile/Web App  │
│ (Port 3001)     │ │ (Port 3002)      │ │ Clients         │
└────────┬────────┘ └────────┬────────┘ └────────┬────────┘
         │                   │                   │
         │ HTTP Request      │ Socket.io Client  │ Socket.io
         │ (emit events)     │ (emit events)     │ Connection
         ▼                   ▼                   ▼
┌────────────────────────────────────────────────────────┐
│                 Realtime Service (Port 3003)          │
│                                                        │
│ • WebSocket Server (Socket.io)                        │
│ • JWT Authentication Middleware                       │
│ • Event Handlers & Room Management                    │
│ • Redis Pub/Sub Integration                           │
└──────────────────┬──────────────────────────┬─────────┘
                   │                          │
                   ▼                          ▼
         ┌──────────────┐              ┌──────────────┐
         │    Redis     │              │ PostgreSQL   │
         │ (Port 6379)  │              │ (Port 5432)  │
         │              │              │              │
         │ • Pub/Sub    │              │ • No Direct  │
         │ • Caching    │              │   Connection │
         └──────────────┘              └──────────────┘
```

## 🔄 How Services Communicate

### 1. Auth Service → Realtime Service
The Auth Service doesn't directly communicate with the Realtime Service in the current implementation, but it provides JWT tokens that the Realtime Service validates.

**Flow:**
1. User signs in via Auth Service
2. Auth Service returns JWT token
3. Client uses this token to connect to Realtime Service
4. Realtime Service validates token using same JWT secret

### 2. Attendance Service → Realtime Service
The Attendance Service emits events to the Realtime Service using Socket.io client connections.

**Current Implementation in Attendance Service:**
```typescript
// In attendance-service controllers
import { io } from 'socket.io-client';

export class CourseController {
  private static realtimeSocket = io('http://localhost:3003');

  // When course is created
  CourseController.realtimeSocket.emit('course:created', {
    courseId: course.id,
    ownerId: userId,
  });

  // When student leaves course
  CourseController.realtimeSocket.emit('course:left', {
    courseId: course.id,
    userId,
  });
}

export class SessionController {
  private static realtimeSocket = io('http://localhost:3003');

  // When session is created
  SessionController.realtimeSocket.emit('session:created', {
    sessionId: session.id,
    courseId: session.courseId,
    sessionName: session.name,
    instructorId: userId,
  });

  // When session starts
  SessionController.realtimeSocket.emit('session:started', {
    sessionId: id,
    courseId: session.courseId,
    sessionName: session.name,
    memberIds: courseMembers.map(m => m.userId),
  });

  // When session ends
  SessionController.realtimeSocket.emit('session:ended', {
    sessionId: id,
    courseId: session.courseId,
    stats: attendanceStats,
  });
}

export class AttendanceController {
  private static realtimeSocket = io('http://localhost:3003');

  // When attendance is marked
  AttendanceController.realtimeSocket.emit('attendance:marked', {
    sessionId,
    attendanceId: attendance.id,
    userId: attendance.userId,
    status: attendance.status,
  });
}
```

### 3. Realtime Service → Redis

The Realtime Service uses Redis for several critical purposes:

#### **Multi-Instance Scaling (Primary Use Case)**
When running multiple realtime service instances behind a load balancer, Redis enables them to communicate:
- **Cross-Instance Broadcasting:** Events emitted by one instance reach clients connected to other instances
- **Shared Room Management:** All instances know which users are in which rooms
- **Load Distribution:** Users can connect to any instance while receiving all events

#### **Socket.io Session Storage**
- **Persistent Sessions:** User connections survive service restarts
- **Sticky Session Alternative:** Users don't need to reconnect to the same server instance
- **Connection State Sharing:** All instances can access user connection information

#### **User Room Assignment Caching**
- **Fast Room Lookups:** Cache which courses/sessions a user belongs to
- **Reduced Database Queries:** Avoid hitting PostgreSQL for every room join operation
- **Real-time Permission Checks:** Quickly verify if user should receive specific events

#### **Event Message Queuing** (Future Enhancement)
- **Offline Message Storage:** Queue events for users who are temporarily disconnected
- **Event Replay:** Allow clients to catch up on missed events when they reconnect
- **Guaranteed Delivery:** Ensure critical notifications aren't lost

**Redis Integration:**
```typescript
// In realtime-service/src/config/redis.ts
import { createClient } from 'redis';

export const pubClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
});

export const subClient = pubClient.duplicate();

export const connectRedis = async (): Promise<void> => {
  await pubClient.connect();
  await subClient.connect();
  console.log('Redis Pub/Sub connected');
};
```

#### **Practical Example: Why Redis Matters**

**Without Redis (Single Instance Only):**
```
Student A connects to → Realtime Server 1
Student B connects to → Realtime Server 2

When Student A marks attendance:
❌ Only students connected to Server 1 get the update
❌ Student B (on Server 2) misses the notification
❌ Instructor might be on Server 2 and miss critical updates
```

**With Redis (Multi-Instance Support):**
```
Student A connects to → Realtime Server 1 ──┐
Student B connects to → Realtime Server 2 ──┤
Instructor connects to → Realtime Server 3 ──┤
                                             │
                    ┌────────────────────────┴─────────────────────────┐
                    │           Redis Adapter                          │
                    │   • Syncs events across all instances           │
                    │   • Manages rooms across servers                │
                    │   • Shares session data                         │
                    └──────────────────────────────────────────────────┘

When Student A marks attendance:
✅ Event goes through Redis to ALL instances
✅ Student B gets real-time notification
✅ Instructor sees update immediately
✅ System scales horizontally without losing functionality
```

#### **Redis Usage in Practice**

**1. Socket.io Adapter Setup:**
```typescript
import { createAdapter } from '@socket.io/redis-adapter';

// Enable cross-instance communication
io.adapter(createAdapter(pubClient, subClient));

// Now when you emit to a room, it reaches ALL instances
io.to(`session:${sessionId}`).emit('attendance:update', data);
```

**2. User Room Caching:**
```typescript
// Cache user's course memberships for fast room joining
const cacheUserRooms = async (userId: string, courseIds: string[]) => {
  const roomList = courseIds.map(id => `course:${id}`);
  await pubClient.setex(`user:${userId}:rooms`, 3600, JSON.stringify(roomList));
};

// Fast room lookup without database query
const getUserRooms = async (userId: string): Promise<string[]> => {
  const cached = await pubClient.get(`user:${userId}:rooms`);
  return cached ? JSON.parse(cached) : [];
};
```

**3. Session Persistence:**
```typescript
// Store socket session data
const storeSession = async (socketId: string, sessionData: any) => {
  await pubClient.setex(`socket:${socketId}`, 1800, JSON.stringify(sessionData));
};

// Retrieve session after reconnection
const getSession = async (socketId: string) => {
  const data = await pubClient.get(`socket:${socketId}`);
  return data ? JSON.parse(data) : null;
};
```

## 🎯 Event Handlers & Room Management

### Event Handlers Structure
The Realtime Service is organized into separate handlers for different domains:

```
src/handlers/
├── attendance.handler.ts    # Attendance-related events
├── course.handler.ts        # Course management events
└── session.handler.ts       # Session lifecycle events
```

### Room Management Strategy
The service uses Socket.io rooms to organize client connections:

**Room Types:**
- `user:{userId}` - Individual user notifications
- `course:{courseId}` - Course-wide broadcasts
- `session:{sessionId}` - Session-specific events
- `instructor:{userId}` - Instructor-only notifications

### Attendance Handler Details
```typescript
export class AttendanceHandler {
  handleConnection(socket: AuthenticatedSocket) {
    // Handle attendance marking events
    socket.on('attendance:marked', (data: any) => {
      // Notify instructors/admins monitoring the session
      this.io.to(`session:${data.sessionId}`).emit('attendance:update', {
        sessionId: data.sessionId,
        userId: data.userId,
        userName: data.userName,
        status: data.status,
        markedAt: data.markedAt,
        type: 'marked',
      });
    });

    // Handle bulk attendance updates
    socket.on('attendance:bulk-update', (data: any) => {
      this.io.to(`session:${data.sessionId}`).emit('attendance:bulk-update', data);
    });

    // Handle attendance status changes
    socket.on('attendance:status-changed', (data: any) => {
      this.io.to(`session:${data.sessionId}`).emit('attendance:status-changed', data);
      
      // Notify the affected user
      this.io.to(`user:${data.userId}`).emit('attendance:status-updated', {
        sessionId: data.sessionId,
        status: data.newStatus,
        notes: data.notes,
      });
    });
  }
}
```

### Course Handler Details
```typescript
export class CourseHandler {
  handleConnection(socket: AuthenticatedSocket) {
    // Handle course creation
    socket.on('course:created', (data: any) => {
      socket.join(`course:${data.courseId}`);
      this.io.to(`user:${data.ownerId}`).emit('course:created', data);
    });

    // Handle student joining course
    socket.on('course:joined', (data: any) => {
      const userSocket = this.getUserSocket(data.userId);
      if (userSocket) {
        userSocket.join(`course:${data.courseId}`);
      }
      
      this.io.to(`course:${data.courseId}`).emit('course:member-joined', data);
    });
  }
}
```

### Session Handler Details
```typescript
export class SessionHandler {
  handleConnection(socket: AuthenticatedSocket) {
    // Handle session creation
    socket.on('session:created', (data: any) => {
      this.io.to(`course:${data.courseId}`).emit('session:created', data);
    });

    // Handle session start
    socket.on('session:started', (data: any) => {
      // Join all members to session room
      data.memberIds?.forEach((memberId: string) => {
        const memberSocket = this.getUserSocket(memberId);
        if (memberSocket) {
          memberSocket.join(`session:${data.sessionId}`);
        }
      });

      this.io.to(`course:${data.courseId}`).emit('session:started', data);
    });

    // Handle session end
    socket.on('session:ended', (data: any) => {
      this.io.to(`session:${data.sessionId}`).emit('session:ended', data);
      
      // Clean up session room
      this.io.in(`session:${data.sessionId}`).socketsLeave(`session:${data.sessionId}`);
    });
  }
}
```

## 🔐 Authentication & Security

### JWT Authentication Middleware
```typescript
// src/middleware/socket.auth.ts
export const authenticateSocket = async (socket: Socket, next: Function) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
    
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    (socket as any).userId = decoded.userId;
    (socket as any).userRole = decoded.role;
    
    next();
  } catch (error) {
    next(new Error('Invalid authentication token'));
  }
};
```

### CORS Configuration
```typescript
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:8080', 
      'http://127.0.0.1:5500', // Live Server default
      'http://localhost:5500', // Live Server alternative
    ];
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for development - change in production
    }
  },
  credentials: true,
};
```

## 📱 Client Integration Examples

### Web Client Connection
```javascript
// Connect to realtime service
const socket = io('http://localhost:3003', {
  auth: {
    token: localStorage.getItem('authToken')
  }
});

// Listen for attendance updates
socket.on('attendance:update', (data) => {
  console.log('New attendance marked:', data);
  updateAttendanceUI(data);
});

// Listen for session events
socket.on('session:started', (data) => {
  console.log('Session started:', data);
  showSessionStarted(data);
});

// Join a session room for real-time updates
socket.emit('join-session', { sessionId: 'session-123' });
```

### Mobile Client Connection
```javascript
// React Native with socket.io-client
import io from 'socket.io-client';

const socket = io('http://192.168.1.100:3003', {
  auth: {
    token: await AsyncStorage.getItem('authToken')
  }
});

socket.on('attendance:status-updated', (data) => {
  Alert.alert('Attendance Updated', `Your status: ${data.status}`);
});
```

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# Realtime Service (.env)
PORT=3003
JWT_SECRET=your-jwt-secret-key
REDIS_URL=redis://localhost:6379
NODE_ENV=development

# For production
CORS_ORIGINS=https://yourapp.com,https://yourmobile.app
```

### Service Dependencies
```json
// package.json dependencies
{
  "socket.io": "^4.7.2",
  "redis": "^4.6.7",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.5",
  "express": "^4.18.2",
  "dotenv": "^16.3.1"
}
```

## 🚀 Scaling Considerations

### Horizontal Scaling with Redis
```typescript
// For multiple realtime service instances
import { createAdapter } from '@socket.io/redis-adapter';

io.adapter(createAdapter(pubClient, subClient));
```

#### **Performance Benefits of Redis Integration**

**1. Memory Efficiency:**
- **Shared State:** Room memberships stored once in Redis, not duplicated per instance
- **Reduced Memory Per Instance:** Each server doesn't need to track all global state
- **Efficient Cleanup:** Automatic expiration of temporary data (sessions, cache)

**2. Network Efficiency:**
- **Event Deduplication:** Redis ensures events aren't broadcast multiple times
- **Targeted Broadcasting:** Only sends events to instances that have interested clients
- **Optimized Pub/Sub:** Redis's native pub/sub is faster than HTTP-based communication

**3. Database Load Reduction:**
- **Room Cache:** Avoid repeated database queries for user permissions
- **Session Storage:** Reduce database writes for temporary session data
- **Connection Metadata:** Store connection info in Redis instead of PostgreSQL

**4. Fault Tolerance:**
- **Instance Recovery:** New instances can pick up existing sessions from Redis
- **Graceful Failures:** If one instance fails, others continue working seamlessly
- **Data Persistence:** Critical session data survives individual server restarts

#### **Redis Memory Usage Examples**

```typescript
// Typical Redis usage for a 1000-student session:
{
  // Room memberships (per user)
  "user:123:rooms": ["course:456", "session:789"],  // ~50 bytes
  
  // Active sessions (per socket)
  "socket:abc123": {                                // ~200 bytes
    "userId": "123",
    "courses": ["456"],
    "connectedAt": "2025-08-27T10:00:00Z"
  },
  
  // Course member cache (per course)
  "course:456:members": ["123", "124", "125"],      // ~2KB for 100 students
  
  // Session metadata (per active session)
  "session:789:meta": {                            // ~500 bytes
    "courseId": "456",
    "startTime": "2025-08-27T10:00:00Z",
    "attendeeCount": 85
  }
}

// Total Redis memory for 1000 concurrent users: ~500KB
// Without Redis: Each instance would need this data = 500KB × instances
```

### Load Balancing
- Use sticky sessions for Socket.io connections
- Redis adapter enables event broadcasting across instances
- Health check endpoint: `GET /health`

## 🔍 Monitoring & Debugging

### Health Check
```bash
curl http://localhost:3003/health
```

### WebSocket Testing
Use the provided test file: `test-websocket.html`
```html
<!-- Located at: backend/services/realtime-service/test-websocket.html -->
<script>
const socket = io('http://localhost:3003', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('Connected to realtime service');
});
</script>
```

### Event Flow Debugging
1. Check attendance service logs for `realtimeSocket.emit` calls
2. Monitor realtime service console for incoming events
3. Use browser dev tools to inspect WebSocket messages
4. Verify Redis pub/sub with `redis-cli monitor`

## 🐛 Common Issues & Solutions

### Issue: WebSocket Connection Fails
**Solution:** Check CORS configuration and ensure JWT token is valid

### Issue: Events Not Received
**Solution:** 
1. Verify client is in correct room: `socket.join('session:123')`
2. Check server logs for emission events
3. Ensure Redis connection is established

### Issue: Authentication Errors
**Solution:** 
1. Verify JWT_SECRET matches across all services
2. Check token expiration
3. Ensure token is passed in auth headers

## 📋 Testing the Realtime System

### 1. Manual Testing Steps
```bash
# Terminal 1: Start Auth Service
cd backend/services/auth-service
npm start

# Terminal 2: Start Attendance Service  
cd backend/services/attendance-service
npm start

# Terminal 3: Start Realtime Service
cd backend/services/realtime-service
npm start

# Terminal 4: Test the flow
cd backend/services/attendance-service
# Run API tests that trigger realtime events
./test-api.ps1
```

### 2. WebSocket Testing
1. Open `test-websocket.html` in browser
2. Connect with valid JWT token
3. Monitor console for real-time events
4. Trigger attendance marking via API
5. Verify events appear in WebSocket console

### 3. Event Flow Verification
```javascript
// In test-websocket.html console
socket.on('attendance:update', (data) => {
  console.log('✅ Attendance event received:', data);
});

socket.on('session:started', (data) => {
  console.log('✅ Session started:', data);
});
```

## 🔄 Future Enhancements

### Planned Features
- [ ] Message queuing for offline clients
- [ ] Event replay functionality
- [ ] Enhanced room management with permissions
- [ ] Metrics and analytics integration
- [ ] Rate limiting for event emissions

### Performance Optimizations
- [ ] Event batching for high-frequency updates
- [ ] Connection pooling optimization
- [ ] Memory usage monitoring
- [ ] WebSocket compression

---

**Note:** This documentation reflects the current implementation as of August 27, 2025. For the latest updates, check the development log and Git history.
