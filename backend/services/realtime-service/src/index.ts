import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectRedis } from './config/redis';
import { authenticateSocket, AuthenticatedSocket } from './middleware/socket.auth';
import { authenticateService, ServiceSocket } from './middleware/service.auth';
import { CourseHandler } from './handlers/course.handler';
import { SessionHandler } from './handlers/session.handler';
import { AttendanceHandler } from './handlers/attendance.handler';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Realtime service is running',
    timestamp: new Date().toISOString(),
  });
});

// Socket.io setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      // Allow all origins in development
      if (process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://localhost:3002',
          'http://localhost:3003',
          'http://localhost:8081',
        ];
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Create handlers
const courseHandler = new CourseHandler(io);
const sessionHandler = new SessionHandler(io);
const attendanceHandler = new AttendanceHandler(io);

// Namespace for authenticated clients (web/mobile apps)
const clientNamespace = io.of('/');

// Namespace for service-to-service communication (no auth required)
const serviceNamespace = io.of('/service');

// Apply authentication only to client namespace
clientNamespace.use(authenticateSocket);

// Client namespace connection handler
clientNamespace.on('connection', (socket: AuthenticatedSocket) => {
  console.log(`Client connected: ${socket.id} (User: ${socket.userId})`);
  
  // Join user's personal room
  if (socket.userId) {
    socket.join(`user:${socket.userId}`);
    console.log(`User ${socket.userId} joined personal room`);
  }
  
  // Register event handlers for clients
  courseHandler.handleConnection(socket);
  sessionHandler.handleConnection(socket);
  attendanceHandler.handleConnection(socket);
  
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Service namespace connection handler (with authentication)
serviceNamespace.use(authenticateService);

serviceNamespace.on('connection', (socket: ServiceSocket) => {
  console.log(`� Secure service connected: ${socket.serviceName} (${socket.id})`);
  
  // Rate limiting for service events
  const eventCounts = new Map<string, number>();
  const RATE_LIMIT_WINDOW = 60000; // 1 minute
  const MAX_EVENTS_PER_WINDOW = 100;
  
  // Reset counts every minute
  setInterval(() => {
    eventCounts.clear();
  }, RATE_LIMIT_WINDOW);
  
  // Rate limit check
  const checkRateLimit = (event: string): boolean => {
    const key = `${socket.serviceName}:${event}`;
    const count = eventCounts.get(key) || 0;
    if (count >= MAX_EVENTS_PER_WINDOW) {
      console.warn(`⚠️ Rate limit exceeded for ${key}`);
      return false;
    }
    eventCounts.set(key, count + 1);
    return true;
  };
  
  // Validate that events come from authorized services
  const validateServicePermission = (event: string): boolean => {
    const permissions: Record<string, string[]> = {
      'attendance-service': [
        'course:created', 'course:joined', 'course:left',
        'session:created', 'session:started', 'session:ended',
        'attendance:marked'
      ],
      'auth-service': [
        'user:created', 'user:verified', 'user:updated'
      ],
      // Add more service permissions as needed
    };
    
    const allowedEvents = permissions[socket.serviceName!] || [];
    return allowedEvents.includes(event);
  };
  
  // Handle events from other services with validation
  socket.on('course:created', (data) => {
    if (!checkRateLimit('course:created')) return;
    if (!validateServicePermission('course:created')) {
      console.error(`❌ Service ${socket.serviceName} not authorized for course:created`);
      return;
    }
    
    console.log(`📚 [${socket.serviceName}] Course created:`, data);
    clientNamespace.to(`user:${data.ownerId}`).emit('course:created', data);
  });
  
  socket.on('course:joined', (data) => {
    if (!checkRateLimit('course:joined')) return;
    if (!validateServicePermission('course:joined')) {
      console.error(`❌ Service ${socket.serviceName} not authorized for course:joined`);
      return;
    }
    
    console.log(`📚 [${socket.serviceName}] Course joined:`, data);
    clientNamespace.to(`user:${data.userId}`).emit('course:joined', data);
    clientNamespace.to(`course:${data.courseId}`).emit('member:joined', data);
  });
  
  socket.on('course:left', (data) => {
    if (!checkRateLimit('course:left')) return;
    if (!validateServicePermission('course:left')) {
      console.error(`❌ Service ${socket.serviceName} not authorized for course:left`);
      return;
    }
    
    console.log(`📚 [${socket.serviceName}] Course left:`, data);
    clientNamespace.to(`course:${data.courseId}`).emit('member:left', data);
  });
  
  socket.on('session:created', (data) => {
    if (!checkRateLimit('session:created')) return;
    if (!validateServicePermission('session:created')) {
      console.error(`❌ Service ${socket.serviceName} not authorized for session:created`);
      return;
    }
    
    console.log(`📅 [${socket.serviceName}] Session created:`, data);
    if (data.memberIds && Array.isArray(data.memberIds)) {
      data.memberIds.forEach((memberId: string) => {
        clientNamespace.to(`user:${memberId}`).emit('session:created', {
          sessionId: data.sessionId,
          courseId: data.courseId,
          courseName: data.courseName,
          sessionName: data.sessionName,
          startTime: data.startTime,
        });
      });
    }
  });
  
  socket.on('session:started', (data) => {
    if (!checkRateLimit('session:started')) return;
    if (!validateServicePermission('session:started')) {
      console.error(`❌ Service ${socket.serviceName} not authorized for session:started`);
      return;
    }
    
    console.log(`🔴 [${socket.serviceName}] Session started:`, data);
    if (data.memberIds && Array.isArray(data.memberIds)) {
      data.memberIds.forEach((memberId: string) => {
        clientNamespace.to(`user:${memberId}`).emit('session:started', {
          sessionId: data.sessionId,
          sessionName: data.sessionName,
        });
      });
    }
    clientNamespace.to(`course:${data.courseId}`).emit('session:active', data);
  });
  
  socket.on('session:ended', (data) => {
    if (!checkRateLimit('session:ended')) return;
    if (!validateServicePermission('session:ended')) {
      console.error(`❌ Service ${socket.serviceName} not authorized for session:ended`);
      return;
    }
    
    console.log(`🏁 [${socket.serviceName}] Session ended:`, data);
    clientNamespace.to(`course:${data.courseId}`).emit('session:ended', data);
  });
  
  socket.on('attendance:marked', (data) => {
    if (!checkRateLimit('attendance:marked')) return;
    if (!validateServicePermission('attendance:marked')) {
      console.error(`❌ Service ${socket.serviceName} not authorized for attendance:marked`);
      return;
    }
    
    console.log(`✅ [${socket.serviceName}] Attendance marked:`, data);
    // Broadcast to session room (instructor monitoring)
    clientNamespace.to(`session:${data.sessionId}`).emit('attendance:marked', data);
    // Notify the user who marked attendance
    if (data.userId) {
      clientNamespace.to(`user:${data.userId}`).emit('attendance:confirmed', {
        status: data.status,
        distance: data.distance,
        markedAt: data.markedAt
      });
    }
  });
  
  socket.on('disconnect', () => {
    console.log(`� Service disconnected: ${socket.serviceName} (${socket.id})`);
  });
  
  // Log any unauthorized events
  socket.onAny((event, ...args) => {
    if (!['course:created', 'course:joined', 'course:left', 'session:created', 'session:started', 'session:ended', 'attendance:marked', 'disconnect'].includes(event)) {
      console.warn(`⚠️ Unhandled event from ${socket.serviceName}: ${event}`);
    }
  });
});

const PORT = process.env.PORT || 3003;

async function startServer() {
  try {
    console.log('Starting server initialization...');
    
    // Validate configuration
    if (!process.env.SERVICE_AUTH_KEY) {
      console.error('❌ CRITICAL: SERVICE_AUTH_KEY not configured!');
      console.error('Please set SERVICE_AUTH_KEY in .env file');
      process.exit(1);
    }
    
    console.log('Connecting to Redis...');
    await connectRedis();
    console.log('Redis connected successfully');
    
    console.log(`Attempting to start server on port ${PORT}...`);
    
    httpServer.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`✅ Realtime service running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Client namespace: / (JWT authentication)`);
      console.log(`Service namespace: /service (API key authentication)`);
      console.log(`🔐 Security: Service authentication ENABLED`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
