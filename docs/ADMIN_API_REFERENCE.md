# Admin API Reference

This document provides a comprehensive reference for all admin endpoints available in the GPS Attendance Tracker system.

## Base URLs

- **Auth Service Admin**: `http://localhost:3001/api/auth/admin`
- **Attendance Service Admin**: `http://localhost:3002/api/attendance/admin`

## Authentication

All admin endpoints require:
1. **Authentication**: Valid JWT token in Authorization header
2. **Authorization**: User must have `ADMIN` role
3. **Service Authentication**: Internal service calls require `SERVICE_AUTH_KEY`

```http
Authorization: Bearer <jwt_token>
X-Service-Auth: <service_auth_key>
```

## Auth Service Admin Endpoints

### User Management

#### Get All Users
```http
GET /api/auth/admin/users
```
**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `role` (string): Filter by role (STUDENT, INSTRUCTOR, ADMIN)
- `search` (string): Search in name and email
- `verified` (boolean): Filter by email verification status
- `locked` (boolean): Filter by account lock status

**Response:**
```json
{
  "success": true,
  "message": "Users retrieved successfully",
  "timestamp": "2025-01-03T10:30:00.000Z",
  "data": {
    "users": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "pages": 15
    }
  }
}
```

#### Get User Statistics
```http
GET /api/auth/admin/users/stats
```
**Response:**
```json
{
  "success": true,
  "message": "User statistics retrieved successfully",
  "data": {
    "totalUsers": 150,
    "totalStudents": 120,
    "totalInstructors": 25,
    "totalAdmins": 5,
    "activeUsers": 89,
    "verifiedUsers": 145,
    "recentUsers": [...],
    "userGrowth": {
      "thisWeek": 5,
      "lastWeek": 3,
      "growthRate": 66.7
    }
  }
}
```

#### Export Users
```http
GET /api/auth/admin/users/export
```
**Query Parameters:**
- `format` (string): Export format (csv, json) - default: csv
- `role` (string): Filter by role
- `verified` (boolean): Filter by verification status
- `locked` (boolean): Filter by lock status

**Response:** CSV file download or JSON data

#### Get User by ID
```http
GET /api/auth/admin/users/:id
```
**Response:**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "data": {
    "id": "user-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "STUDENT",
    "emailVerified": true,
    "accountLocked": false,
    "lastLogin": "2025-01-03T09:00:00.000Z",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### Get User Activity
```http
GET /api/auth/admin/users/:id/activity
```
**Response:**
```json
{
  "success": true,
  "message": "User activity retrieved successfully",
  "data": {
    "user": {...},
    "loginHistory": [],
    "recentActions": [],
    "statistics": {
      "totalLogins": 45,
      "averageSessionDuration": 120,
      "lastActivityDate": "2025-01-03T09:00:00.000Z",
      "accountAge": 30
    }
  }
}
```

#### Create User
```http
POST /api/auth/admin/users
```
**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "+1234567890",
  "role": "STUDENT"
}
```

#### Reset User Password
```http
POST /api/auth/admin/users/:id/reset-password
```
**Request Body:**
```json
{
  "newPassword": "NewSecurePass123!"
}
```

#### Toggle User Lock Status
```http
POST /api/auth/admin/users/:id/toggle-lock
```
**Response:**
```json
{
  "success": true,
  "message": "User account locked successfully",
  "data": {
    "id": "user-uuid",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "accountLocked": true
  }
}
```

#### Update User
```http
PUT /api/auth/admin/users/:id
```
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "role": "INSTRUCTOR",
  "emailVerified": true,
  "accountLocked": false
}
```

#### Bulk Update Users
```http
PATCH /api/auth/admin/users/bulk
```
**Request Body:**
```json
{
  "userIds": ["uuid1", "uuid2", "uuid3"],
  "updates": {
    "emailVerified": true,
    "accountLocked": false
  }
}
```

#### Delete User
```http
DELETE /api/auth/admin/users/:id
```

### System Management

#### Get Roles and Permissions
```http
GET /api/auth/admin/roles
```
**Response:**
```json
{
  "success": true,
  "message": "Roles retrieved successfully",
  "data": [
    {
      "value": "STUDENT",
      "label": "Student",
      "description": "Can view and manage their own attendance and courses",
      "permissions": ["view_own_attendance", "view_own_courses", "join_courses"]
    },
    {
      "value": "INSTRUCTOR",
      "label": "Instructor",
      "description": "Can manage courses and track student attendance",
      "permissions": ["manage_courses", "track_attendance", "view_student_data", "manage_sessions"]
    },
    {
      "value": "ADMIN",
      "label": "Administrator",
      "description": "Full system access and user management",
      "permissions": ["manage_users", "manage_courses", "view_all_data", "system_settings", "export_data"]
    }
  ]
}
```

## Attendance Service Admin Endpoints

### Dashboard and Statistics

#### Get Dashboard Statistics
```http
GET /api/attendance/admin/stats
```
**Response:**
```json
{
  "success": true,
  "message": "Dashboard statistics retrieved successfully",
  "data": {
    "totalCourses": 80,
    "activeCourses": 65,
    "totalSessions": 2400,
    "activeSessions": 45,
    "totalStudents": 1200,
    "totalAttendanceRecords": 51000,
    "recentSessions": [...],
    "courseStats": [...],
    "attendanceOverview": {
      "averageAttendanceRate": 85.6,
      "topPerformingCourses": [...],
      "lowAttendanceCourses": [...]
    }
  }
}
```

### Course Management

#### Get All Courses
```http
GET /api/attendance/admin/courses
```
**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search in course name and code
- `isActive` (boolean): Filter by active status
- `university` (string): Filter by university
- `department` (string): Filter by department

**Response:**
```json
{
  "success": true,
  "message": "Courses retrieved successfully",
  "data": {
    "courses": [
      {
        "id": "course-uuid",
        "name": "Introduction to Computer Science",
        "code": "CS101",
        "university": "Tech University",
        "department": "Computer Science",
        "isActive": true,
        "memberCount": 45,
        "sessionCount": 30,
        "attendanceRate": 87.5,
        "instructor": {
          "firstName": "Dr. Jane",
          "lastName": "Smith"
        }
      }
    ],
    "pagination": {...}
  }
}
```

#### Get Course Details
```http
GET /api/attendance/admin/courses/:id
```
**Response:**
```json
{
  "success": true,
  "message": "Course details retrieved successfully",
  "data": {
    "course": {
      "id": "course-uuid",
      "name": "Introduction to Computer Science",
      "code": "CS101",
      "description": "Fundamentals of programming and computer science",
      "university": "Tech University",
      "department": "Computer Science",
      "isActive": true,
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "members": [...],
    "sessions": [...],
    "statistics": {
      "totalMembers": 45,
      "totalSessions": 30,
      "averageAttendance": 87.5,
      "attendanceDistribution": {...}
    }
  }
}
```

#### Update Course Status
```http
PATCH /api/attendance/admin/courses/:id/status
```
**Request Body:**
```json
{
  "isActive": false
}
```

### Session Management

#### Get All Sessions
```http
GET /api/attendance/admin/sessions
```
**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `courseId` (string): Filter by course
- `isActive` (boolean): Filter by active status
- `startDate` (string): Filter sessions after date
- `endDate` (string): Filter sessions before date

**Response:**
```json
{
  "success": true,
  "message": "Sessions retrieved successfully",
  "data": {
    "sessions": [
      {
        "id": "session-uuid",
        "name": "Lecture 5: Data Structures",
        "startTime": "2025-01-03T10:00:00.000Z",
        "endTime": "2025-01-03T11:30:00.000Z",
        "isActive": false,
        "qrCode": "SESSION123",
        "attendanceCount": 42,
        "course": {
          "name": "Introduction to Computer Science",
          "code": "CS101"
        }
      }
    ],
    "pagination": {...}
  }
}
```

#### Force End Session
```http
PATCH /api/attendance/admin/sessions/:id/end
```
**Response:**
```json
{
  "success": true,
  "message": "Session ended successfully",
  "data": {
    "session": {
      "id": "session-uuid",
      "isActive": false,
      "endTime": "2025-01-03T10:45:00.000Z"
    }
  }
}
```

### Attendance Management

#### Get Attendance Records
```http
GET /api/attendance/admin/attendance
```
**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `courseId` (string): Filter by course
- `sessionId` (string): Filter by session
- `userId` (string): Filter by user
- `status` (string): Filter by status (PRESENT, ABSENT, LATE)
- `startDate` (string): Filter records after date
- `endDate` (string): Filter records before date

**Response:**
```json
{
  "success": true,
  "message": "Attendance records retrieved successfully",
  "data": {
    "records": [
      {
        "id": "attendance-uuid",
        "status": "PRESENT",
        "timestamp": "2025-01-03T10:15:00.000Z",
        "location": {
          "latitude": 40.7128,
          "longitude": -74.0060
        },
        "user": {
          "firstName": "John",
          "lastName": "Doe",
          "email": "john@example.com"
        },
        "session": {
          "name": "Lecture 5: Data Structures",
          "startTime": "2025-01-03T10:00:00.000Z"
        },
        "course": {
          "name": "Introduction to Computer Science",
          "code": "CS101"
        }
      }
    ],
    "pagination": {...},
    "summary": {
      "totalRecords": 51000,
      "presentCount": 43350,
      "absentCount": 6120,
      "lateCount": 1530,
      "attendanceRate": 85.0
    }
  }
}
```

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2025-01-03T10:30:00.000Z",
  "error": {
    "code": "ERROR_CODE",
    "details": "Additional error details"
  }
}
```

## Common HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Rate Limiting

Admin endpoints are subject to rate limiting:
- **Window**: 15 minutes
- **Max Requests**: 1000 per window
- **Skip in Development**: Yes

## Security Notes

1. All admin endpoints require valid JWT authentication
2. Service-to-service calls require `SERVICE_AUTH_KEY`
3. Password resets force users to change password on next login
4. Cannot delete or lock the last admin user
5. Bulk operations are logged for audit purposes
6. Export functions may have additional security restrictions in production

## Usage Examples

### JavaScript/TypeScript
```javascript
const token = 'your-jwt-token';
const serviceKey = 'your-service-auth-key';

const response = await fetch('/api/auth/admin/users', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'X-Service-Auth': serviceKey,
    'Content-Type': 'application/json'
  }
});

const data = await response.json();
```

### cURL
```bash
curl -X GET "http://localhost:3001/api/auth/admin/users?page=1&limit=10" \
  -H "Authorization: Bearer your-jwt-token" \
  -H "X-Service-Auth: your-service-auth-key"
```

This comprehensive API reference covers all admin endpoints available in both the auth and attendance services. Use this as a guide for implementing admin functionality in your web application.
