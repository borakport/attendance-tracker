Important Development Notes

Last Updated: 2025-08-26 17:16:17 UTC
Developer: borakport
🔴 Critical Information
Database Connection

    URL Format: postgresql://attendance_user:attendance_pass@localhost:5432/attendance_db
    Docker Container Name: attendance_postgres
    Must Start Docker: Before any database operations

Test Accounts (NEVER USE IN PRODUCTION)
Code

Admin:       admin@attendance.com       / Admin@123
Instructor:  instructor@attendance.com  / Instructor@123
Student 1:   student1@attendance.com    / Student@123
Student 2:   student2@attendance.com    / Student@123
Student 3:   student3@attendance.com    / Student@123

Generated Course Codes

    Format: CS101[XXXX] where XXXX is random
    Generated during seed execution
    Must be noted from console output

🟡 Environment Specific
Windows Development

    Use Git Bash for Unix-like commands
    Docker Desktop must be running
    Use batch scripts in backend/ folder:
        start-db.bat - Start containers
        stop-db.bat - Stop containers
        reset-db.bat - Reset database

Port Allocations

    3001: Auth Service
    3002: Attendance Service (future)
    3003: Realtime Service (future)
    5432: PostgreSQL
    6379: Redis
    8080: Adminer (Database GUI)

🟢 Development Workflow
Daily Start Routine

    Start Docker Desktop
    Run backend/start-db.bat
    Start auth service: npm run dev
    Check Adminer: http://localhost:8080

Before Committing

    Test the changes
    Update documentation if needed
    Use conventional commits
    Push to develop branch

Branching Strategy

    main: Production
    develop: Active development (default)
    feature/*: New features
    bugfix/*: Bug fixes
    hotfix/*: Emergency fixes

🔵 API Endpoints (Planned)
Authentication

    POST /api/v1/auth/signup
    POST /api/v1/auth/signin
    POST /api/v1/auth/refresh
    POST /api/v1/auth/logout

Courses

    GET /api/v1/courses
    POST /api/v1/courses
    POST /api/v1/courses/join

Sessions

    POST /api/v1/sessions
    POST /api/v1/sessions/:id/start
    POST /api/v1/sessions/:id/end

Attendance

    POST /api/v1/attendance/mark
    GET /api/v1/attendance/session/:sessionId

📍 GPS Testing Data
San Francisco Coordinates

    Downtown: 37.7749, -122.4194
    Alternate: 37.7751, -122.4180
    Test Radius: 50-75 meters

Distance Calculation

Using Haversine formula for GPS verification
🔧 Troubleshooting Quick Fixes
Problem	Solution
Cannot connect to database	Start Docker: docker-compose up -d
Port 5432 already in use	Check Docker or kill process
Prisma error	Run npx prisma generate
Migration failed	Check DATABASE_URL in .env
Seed failed	Run npm run db:reset
📅 Project Timeline

    Started: 2025-08-26 15:00 UTC
    Database Design: 2025-08-26 16:00 UTC
    GitHub Setup: 2025-08-26 16:45 UTC
    Current Phase: Waiting for database connection
    Next Phase: Authentication Service

🎯 Next Immediate Tasks

    ✅ Start Docker Desktop
    ✅ Run database migrations
    ✅ Seed test data
    ⏳ Implement auth service core
    ⏳ Create auth endpoints
    ⏳ Test authentication flow

Remember: This file contains critical information. Keep it updated!
