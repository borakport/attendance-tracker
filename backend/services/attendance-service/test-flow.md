# Attendance Service Testing Guide

**Last Updated:** 2025-08-27 13:35:32 UTC  
**Author:** borakport

## Prerequisites

1. All services must be running:
   - Auth Service: `http://localhost:3001`
   - Attendance Service: `http://localhost:3002`
   - Realtime Service: `http://localhost:3003`

2. Database must be seeded with test data

## Test Flow Sequence

### 🔐 Step 1: Authentication
Get auth tokens for testing (these will be used in all subsequent requests)

```bash
# Get Instructor Token
curl -X POST http://localhost:3001/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor@attendance.com","password":"Instructor@123"}'

# Get Student Token
curl -X POST http://localhost:3001/api/v1/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"student1@attendance.com","password":"Student@123"}'
```

**Line-by-line explanation:**

1. `curl -X POST` - Makes a POST HTTP request using curl
2. `http://localhost:3001/api/v1/auth/signin` - Target endpoint for authentication
3. `-H "Content-Type: application/json"` - Sets the request header to indicate JSON payload
4. `-d '{"email":"...", "password":"..."}'` - Sends JSON data containing login credentials

**Expected Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "user": {
      "id": "user-id-123",
      "email": "instructor@attendance.com",
      "firstName": "John",
      "lastName": "Instructor",
      "role": "INSTRUCTOR"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

Save the `accessToken` from the response - you'll use it in all subsequent API calls.

### 📚 Step 2: Course Management
Test course-related operations

```bash
# List all courses (for instructor/student)
curl -X GET http://localhost:3002/api/v1/courses \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"

# Create a new course (instructor only)
curl -X POST http://localhost:3002/api/v1/courses \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Course API",
    "description": "Testing course creation",
    "startDate": "2025-09-01",
    "endDate": "2025-12-31",
    "settings": {
      "gpsRadius": 100,
      "allowLateEntry": true,
      "lateEntryMinutes": 20
    }
  }'
```

### 🎯 Step 3: Session Management
Test session lifecycle

```bash
# Create a session
curl -X POST http://localhost:3002/api/v1/sessions \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "COURSE_ID_FROM_STEP_2",
    "name": "Test Session",
    "description": "Testing session creation",
    "startTime": "2025-08-27T14:00:00Z",
    "endTime": "2025-08-27T16:00:00Z",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "radiusMeters": 75,
    "locationName": "Test Location"
  }'

# Start the session
curl -X POST http://localhost:3002/api/v1/sessions/SESSION_ID/start \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "actualLatitude": 37.7749,
    "actualLongitude": -122.4194
  }'
```

### ✅ Step 4: Attendance Marking
Test attendance functionality

```bash
# Mark attendance (student must be enrolled in course)
curl -X POST http://localhost:3002/api/v1/attendance/mark \
  -H "Authorization: Bearer YOUR_STUDENT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "ACTIVE_SESSION_ID",
    "latitude": 37.7749,
    "longitude": -122.4194,
    "deviceInfo": {
      "platform": "web",
      "model": "Chrome",
      "osVersion": "Windows 11",
      "appVersion": "1.0.0"
    }
  }'

# Get session attendance (instructor view)
curl -X GET http://localhost:3002/api/v1/attendance/session/SESSION_ID \
  -H "Authorization: Bearer YOUR_INSTRUCTOR_TOKEN"
```

## Testing Tools Available

### 1. HTTP REST Client Files
- `test-api.http` - VS Code REST Client format for manual testing
- Contains all endpoints with examples
- Replace placeholder values with actual IDs

### 2. PowerShell Script
- `test-api.ps1` - Automated testing script for Windows
- Run with: `powershell -ExecutionPolicy Bypass -File test-api.ps1`
- Automatically gets tokens and tests basic flow

### 3. Bash Script  
- `test-api.sh` - Automated testing script for Unix/Linux
- Run with: `chmod +x test-api.sh && ./test-api.sh`
- Cross-platform alternative to PowerShell

### 4. WebSocket Tester
- `../realtime-service/test-websocket.html` - Interactive WebSocket testing
- Open in browser to test real-time events
- Requires auth token from signin

## Common Test Scenarios

### Scenario 1: Complete Attendance Flow
1. Instructor creates course
2. Student joins course with code
3. Instructor creates session
4. Instructor starts session
5. Student marks attendance
6. Instructor views attendance
7. Instructor ends session

### Scenario 2: GPS Validation Testing
1. Create session with specific location
2. Try marking attendance from different locations
3. Verify GPS distance validation works
4. Test with coordinates outside radius

### Scenario 3: Real-time Events
1. Open WebSocket tester
2. Connect with auth token
3. Join course room
4. Start session and observe real-time notifications
5. Mark attendance and see live updates

## Troubleshooting

### Common Issues:
1. **401 Unauthorized** - Check if auth token is valid and not expired
2. **403 Forbidden** - User doesn't have permission for this action
3. **404 Not Found** - Check if course/session IDs exist
4. **400 Bad Request** - Check request payload format

### Service Health Checks:
```bash
curl http://localhost:3001/health  # Auth Service
curl http://localhost:3002/health  # Attendance Service  
curl http://localhost:3003/health  # Realtime Service
```

### Database Queries:
```sql
-- Check seeded data
SELECT id, name, code FROM "Course";
SELECT id, name, status FROM "Session" WHERE status = 'ACTIVE';
SELECT email, role FROM "User";
```

## Environment Setup

Make sure all environment variables are set:
```bash
# .env file should contain:
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
REDIS_HOST="localhost"
REDIS_PORT="6379"
```

## Expected Test Results

Successful test run should show:
- ✅ Authentication tokens obtained
- ✅ Health checks pass
- ✅ Course operations work
- ✅ Session lifecycle functions
- ✅ Attendance marking works
- ✅ Real-time events trigger
- ✅ GPS validation enforced
