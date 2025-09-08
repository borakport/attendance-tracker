# Database Documentation

This document describes the database schema, operations, and management for the GPS Attendance Tracking System.

## Database Overview

**Database:** PostgreSQL 15  
**ORM:** Prisma  
**Connection:** Docker container on port 5432  
**Database Name:** `gps_attendance_production`

## Environment Configuration

The database connection uses hard links to ensure Prisma CLI access:

```bash
# Windows - Create hard links for Prisma CLI
cd backend\services\auth-service
cmd /c "mklink /H .env c:\Data\attendance-tracker\backend\.env"

cd ..\attendance-service
cmd /c "mklink /H .env c:\Data\attendance-tracker\backend\.env"
```

**Connection String:**
```env
DATABASE_URL=postgresql://postgres:AttendanceSecurePassword2025@localhost:5432/gps_attendance_production?schema=public
```

## Schema Structure

### Core Models

#### Users Table
```sql
Table: users
- id: UUID (Primary Key)
- email: String (Unique)
- password: String (Hashed with bcrypt)
- firstName: String
- lastName: String
- phoneNumber: String?
- role: UserRole (ADMIN, INSTRUCTOR, STUDENT)
- emailVerified: Boolean
- emailVerificationToken: String?
- twoFactorEnabled: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

#### Courses Table
```sql
Table: courses
- id: UUID (Primary Key)
- name: String
- description: String?
- code: String (Unique)
- ownerId: UUID (Foreign Key -> users.id)
- settings: JSON
- isActive: Boolean
- startDate: DateTime?
- endDate: DateTime?
- createdAt: DateTime
- updatedAt: DateTime
```

#### Sessions Table
```sql
Table: sessions
- id: UUID (Primary Key)
- courseId: UUID (Foreign Key -> courses.id)
- createdById: UUID (Foreign Key -> users.id)
- name: String
- description: String?
- startTime: DateTime
- endTime: DateTime
- latitude: Decimal(10,8)
- longitude: Decimal(11,8)
- radiusMeters: Integer (default: 50)
- locationName: String?
- isActive: Boolean
- allowLateEntry: Boolean
- lateMinutes: Integer (default: 15)
- requireSelfie: Boolean
- qrCode: String? (Unique)
- notes: String?
- createdAt: DateTime
- updatedAt: DateTime
```

#### Attendances Table
```sql
Table: attendances
- id: UUID (Primary Key)
- sessionId: UUID (Foreign Key -> sessions.id)
- userId: UUID (Foreign Key -> users.id)
- markedAt: DateTime
- latitude: Decimal(10,8)
- longitude: Decimal(11,8)
- status: AttendanceStatus (PRESENT, LATE, ABSENT)
- distanceFromSession: Float
- selfieUrl: String?
- deviceInfo: JSON?
- ipAddress: String?
- notes: String?
- verifiedBy: String?
- createdAt: DateTime
- updatedAt: DateTime
```

#### Course Members Table
```sql
Table: course_members
- id: UUID (Primary Key)
- courseId: UUID (Foreign Key -> courses.id)
- userId: UUID (Foreign Key -> users.id)
- role: CourseRole (OWNER, PARTICIPANT, MODERATOR)
- joinedAt: DateTime
- updatedAt: DateTime
- UNIQUE(courseId, userId)
```

#### Refresh Tokens Table
```sql
Table: refresh_tokens
- id: UUID (Primary Key)
- token: String (Unique)
- userId: UUID (Foreign Key -> users.id)
- expiresAt: DateTime
- createdAt: DateTime
```

#### System Logs Table
```sql
Table: system_logs
- id: UUID (Primary Key)
- userId: String?
- action: String
- entity: String
- entityId: String?
- metadata: JSON?
- ipAddress: String?
- userAgent: String?
- createdAt: DateTime
```

## Enums

```sql
-- User roles
UserRole: ADMIN | INSTRUCTOR | STUDENT

-- Course member roles  
CourseRole: OWNER | PARTICIPANT | MODERATOR

-- Attendance status
AttendanceStatus: PRESENT | LATE | ABSENT
```

## Database Operations

### Initial Setup

1. **Start PostgreSQL Container:**
   ```bash
   cd backend
   docker-compose up -d postgres
   ```

2. **Deploy Schemas:**
   ```bash
   cd backend\services\auth-service
   npx prisma db push
   npx prisma generate

   cd ..\attendance-service
   npx prisma db push
   npx prisma generate
   ```

3. **Seed Database:**
   ```bash
   cd backend
   npm run seed
   ```

### Database Management

#### Access Database
```bash
# Using Docker
docker exec -it backend-postgres-1 psql -U postgres -d gps_attendance_production

# Using Prisma Studio
cd backend\services\auth-service
npx prisma studio
```

#### Reset Database
```bash
# Stop containers and remove volumes
cd backend
docker-compose down -v

# Restart and redeploy
docker-compose up -d
# Follow setup steps again
```

#### Backup Database
```bash
# Create backup
docker exec backend-postgres-1 pg_dump -U postgres gps_attendance_production > backup.sql

# Restore backup
docker exec -i backend-postgres-1 psql -U postgres gps_attendance_production < backup.sql
```

## Data Statistics

After seeding, the database contains:

| Table | Records | Description |
|-------|---------|-------------|
| users | 527 | 2 admins, 25 instructors, 500 students |
| courses | 80 | Academic courses with realistic content |
| sessions | 2,406 | Class sessions with GPS coordinates |
| attendances | 60,542 | Attendance records with realistic patterns |
| course_members | 2,453 | Course enrollment relationships |
| refresh_tokens | 671 | Active user authentication tokens |
| system_logs | 5,000 | System activity audit trail |

## Default User Credentials

### Admin User
- **Email:** `admin@attendance.com`
- **Password:** `password123`

### Instructors (Sample Accounts)
- **Email:** `prof.anderson@university.edu`
- **Email:** `dr.martinez@college.edu`
- **Email:** `prof.johnson@academy.edu`
- **Email:** `dr.wilson@institute.edu`
- **Password:** `password123` (for all instructor accounts)

### Students (Sample Accounts)
- **Email:** `alice.smith@student.edu`
- **Email:** `bob.johnson@student.edu`
- **Email:** `charlie.brown@student.edu`
- **Email:** `diana.prince@student.edu`
- **Password:** `password123` (for all student accounts)

## Indexing Strategy

### Primary Indexes
- All primary keys (UUID)
- Unique constraints (email, course code, QR codes)

### Performance Indexes
```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Course queries
CREATE INDEX idx_courses_owner ON courses(ownerId);
CREATE INDEX idx_courses_active ON courses(isActive);

-- Session queries
CREATE INDEX idx_sessions_course ON sessions(courseId);
CREATE INDEX idx_sessions_start_time ON sessions(startTime);
CREATE INDEX idx_sessions_active ON sessions(isActive);

-- Attendance queries
CREATE INDEX idx_attendances_session ON attendances(sessionId);
CREATE INDEX idx_attendances_user ON attendances(userId);
CREATE INDEX idx_attendances_status ON attendances(status);
CREATE INDEX idx_attendances_marked_at ON attendances(markedAt);

-- Course membership
CREATE INDEX idx_course_members_course ON course_members(courseId);
CREATE INDEX idx_course_members_user ON course_members(userId);

-- Token management
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(userId);
```

## Data Relationships

### User → Courses
- One-to-many: User owns multiple courses
- Many-to-many: User joins multiple courses (via course_members)

### Course → Sessions
- One-to-many: Course has multiple sessions

### Session → Attendances
- One-to-many: Session has multiple attendance records

### User → Attendances
- One-to-many: User has multiple attendance records

## Queries Examples

### Get User's Courses
```sql
SELECT c.* FROM courses c
JOIN course_members cm ON c.id = cm.courseId
WHERE cm.userId = $1;
```

### Get Session Attendance
```sql
SELECT u.firstName, u.lastName, a.status, a.markedAt, a.distanceFromSession
FROM attendances a
JOIN users u ON a.userId = u.id
WHERE a.sessionId = $1
ORDER BY a.markedAt;
```

### Get User Attendance Statistics
```sql
SELECT 
  COUNT(*) as totalSessions,
  COUNT(CASE WHEN a.status = 'PRESENT' THEN 1 END) as presentCount,
  COUNT(CASE WHEN a.status = 'LATE' THEN 1 END) as lateCount,
  COUNT(CASE WHEN a.status = 'ABSENT' THEN 1 END) as absentCount
FROM sessions s
LEFT JOIN attendances a ON s.id = a.sessionId AND a.userId = $1
JOIN course_members cm ON s.courseId = cm.courseId
WHERE cm.userId = $1 AND s.endTime < NOW();
```

## Troubleshooting

### Common Issues

**Connection Failed:**
```bash
# Check if PostgreSQL is running
docker-compose ps

# Check connection string
echo $DATABASE_URL
```

**Migration Failed:**
```bash
# Reset and redeploy
npx prisma db push --force-reset
```

**Hard Link Issues:**
```bash
# Verify hard links exist
ls -la backend/services/auth-service/.env
ls -la backend/services/attendance-service/.env

# Recreate if missing
cmd /c "mklink /H .env c:\Data\attendance-tracker\backend\.env"
```

### Monitoring

#### Database Size
```sql
SELECT pg_size_pretty(pg_database_size('gps_attendance_production'));
```

#### Active Connections
```sql
SELECT count(*) FROM pg_stat_activity WHERE datname = 'gps_attendance_production';
```

#### Table Sizes
```sql
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Security Considerations

- All passwords are hashed using bcrypt
- UUIDs used for all primary keys to prevent enumeration
- Soft deletes implemented where needed
- Audit logs in system_logs table
- Row-level security can be implemented for multi-tenancy
- Connection pooling limits concurrent connections
- Regular backups and point-in-time recovery available