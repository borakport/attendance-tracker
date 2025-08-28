# GPS Attendance Tracker - Backend Services

## 🚀 Overview
The backend consists of three microservices working together to provide a complete attendance tracking system with real-time updates.

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Auth Service  │     │Attendance Service│    │ Realtime Service │
│   (Port 3001)   │     │   (Port 3002)    │    │   (Port 3003)    │
│                 │     │                  │    │                  │
│ • User Auth     │     │ • Course Mgmt    │    │ • WebSocket      │
│ • JWT Tokens    │     │ • Sessions       │    │ • Live Updates   │
│ • User Profiles │     │ • GPS Attendance │    │ • Event Broadcasting│
└─────────┬────────┘     └────────┬────────┘    └────────┬────────┘
          │                       │                       │
          └───────────────────────┴───────────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌──────────────┐          ┌──────────────┐
            │  PostgreSQL  │          │    Redis     │
            │ (Port 5432)  │          │ (Port 6379)  │
            └──────────────┘          └──────────────┘
```

## 📦 Services

### 1. Auth Service (Port 3001)
- User registration and authentication
- JWT token generation and validation
- Profile management
- Password reset functionality

### 2. Attendance Service (Port 3002)
- Course creation and management
- Session scheduling and control
- GPS-based attendance marking
- Attendance reports and analytics

### 3. Realtime Service (Port 3003)
- WebSocket connections for live updates
- Event broadcasting to connected clients
- Secure service-to-service communication
- Room-based event distribution

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm or yarn

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm run install:all
```

2. **Set up databases:**
```bash
# Start PostgreSQL and Redis
docker-compose up -d

# Run migrations and seed data
cd services/auth-service
npm run migrate
npm run seed
```

3. **Configure environment variables:**
Copy `.env.example` to `.env` in each service directory and update values.

4. **Start all services:**
```bash
# In separate terminals:
cd services/auth-service && npm run dev
cd services/attendance-service && npm run dev
cd services/realtime-service && npm run dev
```

## 🧪 Testing

### Quick Test
```bash
# Run the test hub (Windows)
./test-hub.ps1

# Run the test hub (Mac/Linux)
./test-hub.sh
```

### API Testing
Use the `test-api.http` files in each service directory with VS Code REST Client extension.

### WebSocket Testing
Open `services/realtime-service/test-websocket.html` in a browser.

## 🔐 Security Features

- JWT-based authentication
- Service-to-service authentication with HMAC tokens
- GPS verification for attendance (no shareable codes)
- Rate limiting on all endpoints
- Input validation and sanitization
- SQL injection prevention via Prisma ORM

## 📍 GPS Attendance Flow

1. **Instructor starts session** at specific location
2. **Students mark attendance** by sending GPS coordinates
3. **Server validates** student is within session radius (10-500m)
4. **Real-time updates** sent to instructor dashboard
5. **No access codes** - purely location-based verification

## 🛠️ Development

### Database Management
```bash
# View database
http://localhost:8080 (Adminer)
Server: postgres
Username: attendance_user
Password: attendance_pass
Database: attendance_db
```

### Service Health Checks
- Auth: http://localhost:3001/health
- Attendance: http://localhost:3002/health
- Realtime: http://localhost:3003/health

### Debug Endpoints
- Connected clients: http://localhost:3003/debug/clients

## 📊 API Documentation

### Auth Service
- `POST /api/v1/auth/signup` - Register new user
- `POST /api/v1/auth/signin` - Login
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/refresh` - Refresh token

### Attendance Service
- `POST /api/v1/courses` - Create course
- `GET /api/v1/courses` - List courses
- `POST /api/v1/courses/join` - Join course
- `POST /api/v1/sessions` - Create session
- `POST /api/v1/sessions/:id/start` - Start session
- `POST /api/v1/attendance/mark` - Mark attendance (GPS required)

### Realtime Events
- `course:created` - New course created
- `session:started` - Session is active
- `attendance:marked` - Student marked attendance
- `session:ended` - Session completed

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Services won't start | Check ports 3001-3003 are free |
| Database connection failed | Ensure PostgreSQL is running |
| No real-time updates | Check Redis is running |
| WebSocket connection failed | Verify JWT token is valid |

## 📝 Environment Variables

### Required for all services:
- `NODE_ENV` - development/production
- `JWT_SECRET` - Must be same across all services
- `SERVICE_AUTH_KEY` - For service-to-service auth
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

## 🚀 Production Deployment

1. Use environment-specific `.env` files
2. Enable HTTPS/WSS for all services
3. Use strong, unique secrets
4. Set up proper logging and monitoring
5. Configure rate limiting
6. Use PM2 or similar for process management

## 📄 License
MIT

## 👥 Contributors
- borakport (Lead Developer)

---
Last Updated: 2025-08-28 04:49:09 UTC
