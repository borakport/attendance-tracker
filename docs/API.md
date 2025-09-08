# API Documentation

Complete API reference for the GPS Attendance Tracking System.

## Base URLs

- **Auth Service:** `http://localhost:3001`
- **Attendance Service:** `http://localhost:3002`
- **Realtime Service:** `http://localhost:3003`

## Authentication

All protected endpoints require a JWT token:

```http
Authorization: Bearer <jwt_token>
```

## Auth Service API

### Authentication

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "STUDENT",
      "firstName": "John",
      "lastName": "Doe"
    },
    "tokens": {
      "accessToken": "jwt_token",
      "refreshToken": "refresh_token"
    }
  }
}
```

#### Register
```http
POST /auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

#### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh_token"
}
```

#### Logout
```http
POST /auth/logout
Authorization: Bearer <jwt_token>
```

### User Management

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <jwt_token>
```

#### Update Profile
```http
PUT /auth/profile
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890"
}
```

#### Change Password
```http
POST /auth/change-password
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "currentPassword": "oldpass",
  "newPassword": "newpass"
}
```

## Attendance Service API

### Courses

#### Get My Courses
```http
GET /courses/my-courses
Authorization: Bearer <jwt_token>
```

#### Join Course
```http
POST /courses/join
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "courseCode": "CS101"
}
```

#### Create Course (Instructor/Admin)
```http
POST /courses
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Computer Science 101",
  "description": "Introduction to Programming",
  "code": "CS101"
}
```

### Sessions

#### Get Course Sessions
```http
GET /courses/{courseId}/sessions
Authorization: Bearer <jwt_token>
```

#### Create Session (Instructor)
```http
POST /sessions
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "courseId": "course_uuid",
  "name": "Week 1 Lecture",
  "startTime": "2025-09-08T09:00:00Z",
  "endTime": "2025-09-08T10:30:00Z",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "radiusMeters": 50
}
```

#### Get Session Details
```http
GET /sessions/{sessionId}
Authorization: Bearer <jwt_token>
```

### Attendance

#### Mark Attendance
```http
POST /attendance/mark
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "sessionId": "session_uuid",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timestamp": "2025-09-08T09:15:00Z"
}
```

#### Get My Attendance
```http
GET /attendance/my-attendance?courseId={courseId}
Authorization: Bearer <jwt_token>
```

#### Get Session Attendance (Instructor)
```http
GET /sessions/{sessionId}/attendance
Authorization: Bearer <jwt_token>
```

## Admin API

### User Management

#### Get All Users
```http
GET /admin/users?page=1&limit=10&role=STUDENT
Authorization: Bearer <admin_jwt_token>
```

#### Create User
```http
POST /admin/users
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "TempPass123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "INSTRUCTOR"
}
```

#### Update User
```http
PUT /admin/users/{userId}
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "INSTRUCTOR"
}
```

#### Delete User
```http
DELETE /admin/users/{userId}
Authorization: Bearer <admin_jwt_token>
```

### Course Management

#### Get All Courses
```http
GET /admin/courses?page=1&limit=10
Authorization: Bearer <admin_jwt_token>
```

#### Update Course
```http
PUT /admin/courses/{courseId}
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "name": "Updated Course Name",
  "description": "Updated description",
  "isActive": true
}
```

### Analytics

#### Get System Stats
```http
GET /admin/stats
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "data": {
    "totalUsers": 527,
    "totalCourses": 80,
    "totalSessions": 2406,
    "totalAttendance": 60542,
    "activeUsers": 352
  }
}
```

## WebSocket Events (Realtime Service)

### Connection
```javascript
const socket = io('http://localhost:3003', {
  auth: {
    token: 'jwt_token'
  }
});
```

### Events

#### Join Session Room
```javascript
socket.emit('join-session', { sessionId: 'session_uuid' });
```

#### Listen for Attendance Updates
```javascript
socket.on('attendance-marked', (data) => {
  console.log('New attendance:', data);
});
```

#### Listen for Session Updates
```javascript
socket.on('session-updated', (data) => {
  console.log('Session updated:', data);
});
```

## Error Responses

All APIs return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Common HTTP Status Codes

- **200 OK** - Successful request
- **201 Created** - Resource created successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Insufficient permissions
- **404 Not Found** - Resource not found
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error

## Rate Limiting

All endpoints have rate limiting applied:

- **Auth endpoints:** 5 requests per minute
- **General endpoints:** 100 requests per minute
- **Admin endpoints:** 200 requests per minute

## Testing with Default Credentials

### Admin Access
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@attendance.com",
    "password": "password123"
  }'
```

### Instructor Access
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "prof.anderson@university.edu", 
    "password": "password123"
  }'
```

### Student Access
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice.smith@student.edu",
    "password": "password123"
  }'
```

## Postman Collection

A Postman collection is available with all endpoints pre-configured. Import the collection and set up environment variables:

- `baseUrl_auth`: `http://localhost:3001`
- `baseUrl_attendance`: `http://localhost:3002`
- `accessToken`: Retrieved from login response

## API Versioning

Current API version: **v1**

All endpoints are prefixed with `/api/v1` (handled internally by services).

## Support

For API questions or issues:
1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review error responses and status codes
3. Verify authentication tokens are valid
4. Ensure all required fields are provided
