# API Documentation

## Base URLs
- Auth Service: `http://localhost:3001/api/v1`
- Attendance Service: `http://localhost:3002/api/v1`
- Realtime Service: `ws://localhost:3003`

## Authentication Endpoints

### Register User
**POST** `/auth/signup`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Registration successful. Please verify your email.",
  "data": {
    "userId": "uuid",
    "email": "user@example.com"
  }
}
```

### Login
**POST** `/auth/signin`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  }
}
```

### Refresh Token
**POST** `/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",
    "refreshToken": "new-refresh-token"
  }
}
```

### Logout
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "refreshToken": "refresh-token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Course Endpoints

### Create Course
**POST** `/courses`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "name": "Mathematics 101",
  "description": "Introduction to Calculus",
  "settings": {
    "gpsRadius": 50,
    "allowLateEntry": true,
    "lateEntryMinutes": 15
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Mathematics 101",
    "code": "ABC123",
    "ownerId": "user-uuid",
    "createdAt": "2025-08-26T13:34:25Z"
  }
}
```

### Join Course
**POST** `/courses/join`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "courseCode": "ABC123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Successfully joined course",
  "data": {
    "courseId": "uuid",
    "courseName": "Mathematics 101"
  }
}
```

### Get User Courses
**GET** `/courses`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Query Parameters:**
- `role`: `owner` | `participant` | `all` (default: `all`)
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": "uuid",
        "name": "Mathematics 101",
        "code": "ABC123",
        "role": "owner",
        "memberCount": 45,
        "nextSession": "2025-08-27T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 2,
      "totalPages": 1
    }
  }
}
```

## Session Endpoints

### Create Session
**POST** `/sessions`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "courseId": "course-uuid",
  "name": "Lecture 5 - Derivatives",
  "startTime": "2025-08-27T10:00:00Z",
  "endTime": "2025-08-27T11:30:00Z",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "radiusMeters": 50,
  "allowLateEntry": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "session-uuid",
    "courseId": "course-uuid",
    "name": "Lecture 5 - Derivatives",
    "isActive": false,
    "createdAt": "2025-08-26T13:34:25Z"
  }
}
```

### Start Session
**POST** `/sessions/:id/start`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Session started successfully",
  "data": {
    "sessionId": "session-uuid",
    "isActive": true,
    "startedAt": "2025-08-27T10:00:00Z"
  }
}
```

## Attendance Endpoints

### Mark Attendance
**POST** `/attendance/mark`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Request Body:**
```json
{
  "sessionId": "session-uuid",
  "latitude": 37.7749,
  "longitude": -122.4194
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Attendance marked successfully",
  "data": {
    "attendanceId": "attendance-uuid",
    "status": "PRESENT",
    "markedAt": "2025-08-27T10:05:00Z",
    "distanceFromSession": 15.5
  }
}
```

### Get Session Attendance
**GET** `/attendance/session/:sessionId`

**Headers:**
```
Authorization: Bearer <access-token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "session-uuid",
      "name": "Lecture 5",
      "startTime": "2025-08-27T10:00:00Z"
    },
    "attendance": [
      {
        "userId": "user-uuid",
        "userName": "John Doe",
        "status": "PRESENT",
        "markedAt": "2025-08-27T10:05:00Z"
      }
    ],
    "statistics": {
      "total": 45,
      "present": 40,
      "late": 3,
      "absent": 2
    }
  }
}
```

## WebSocket Events

### Connection
```javascript
const socket = io('ws://localhost:3003', {
  auth: {
    token: 'jwt-token'
  }
});
```

### Join Course Room
```javascript
socket.emit('join:course', { courseId: 'course-uuid' });
```

### Join Session Room
```javascript
socket.emit('join:session', { sessionId: 'session-uuid' });
```

### Listen for Attendance Updates
```javascript
socket.on('attendance:marked', (data) => {
  console.log('New attendance:', data);
  // {
  //   userId: 'user-uuid',
  //   userName: 'John Doe',
  //   status: 'PRESENT',
  //   markedAt: '2025-08-27T10:05:00Z'
  // }
});
```

### Session Events
```javascript
// Session started
socket.on('session:started', (data) => {
  console.log('Session started:', data);
});

// Session ended
socket.on('session:ended', (data) => {
  console.log('Session ended:', data);
});
```

## Error Responses

### Validation Error
**Status:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  }
}
```

### Authentication Error
**Status:** `401 Unauthorized`
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### Not Found Error
**Status:** `404 Not Found`
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### Server Error
**Status:** `500 Internal Server Error`
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## Rate Limiting

All endpoints are rate-limited:
- Authentication endpoints: 5 requests per 15 minutes
- General API endpoints: 100 requests per 15 minutes
- WebSocket connections: 10 per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1693058065
```