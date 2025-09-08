# Quick Reference

Essential commands and information for the GPS Attendance Tracking System.

## Default Credentials

### Admin User
```
Email: admin@attendance.com
Password: password123
```

### Instructors (Sample Accounts)
```
Email: prof.anderson@university.edu
Email: dr.martinez@college.edu
Email: prof.johnson@academy.edu
Email: dr.wilson@institute.edu
Password: password123 (for all instructor accounts)
```

### Students (Sample Accounts)
```
Email: alice.smith@student.edu
Email: bob.johnson@student.edu
Email: charlie.brown@student.edu
Email: diana.prince@student.edu
Password: password123 (for all student accounts)
```

## Hard Link Setup Commands

### Windows
```bash
# Navigate to auth service
cd backend\services\auth-service
cmd /c "mklink /H .env c:\Data\attendance-tracker\backend\.env"

# Navigate to attendance service
cd ..\attendance-service
cmd /c "mklink /H .env c:\Data\attendance-tracker\backend\.env"
```

### macOS/Linux
```bash
# Navigate to auth service
cd backend/services/auth-service
ln ../../.env .env

# Navigate to attendance service
cd ../attendance-service
ln ../../.env .env
```

## Essential Commands

### Docker Operations
```bash
# Start all services
cd backend
docker-compose up -d

# Stop all services
docker-compose down

# Reset everything (including data)
docker-compose down -v

# View container status
docker-compose ps

# View logs
docker-compose logs
docker logs backend-postgres-1
```

### Database Operations
```bash
# Deploy schemas
cd backend\services\auth-service
npx prisma db push
npx prisma generate

cd ..\attendance-service
npx prisma db push
npx prisma generate

# Seed database
cd ..\..
npm run seed

# Access database
docker exec -it backend-postgres-1 psql -U postgres -d gps_attendance_production

# Prisma Studio
cd backend\services\auth-service
npx prisma studio
```

### Service Management
```bash
# Build and start auth service
cd backend\services\auth-service
npm install
npm run build
npm start

# Build and start attendance service
cd ..\attendance-service
npm install
npm run build
npm start

# Build and start realtime service
cd ..\realtime-service
npm install
npm run build
npm start
```

### Development Commands
```bash
# Start mobile app
cd mobile
npm install
npm start

# Start web app
cd web
npm install
npm run dev

# Run tests
npm test

# Code formatting
npm run lint
npm run format
```

## Service URLs

### Development
- **Auth Service:** `http://localhost:3001`
- **Attendance Service:** `http://localhost:3002`
- **Realtime Service:** `http://localhost:3003`
- **Web App:** `http://localhost:3000`
- **MailPit:** `http://localhost:8025`
- **Prisma Studio:** `http://localhost:5555`

### Database
- **PostgreSQL:** `localhost:5432`
- **Redis:** `localhost:6379`
- **Database:** `gps_attendance_production`
- **Username:** `postgres`
- **Password:** `AttendanceSecurePassword2025`

## Common Troubleshooting

### Hard Link Issues
```bash
# Check if hard links exist
ls -la backend/services/auth-service/.env
ls -la backend/services/attendance-service/.env

# Recreate hard links (Windows)
cd backend\services\auth-service
cmd /c "mklink /H .env c:\Data\attendance-tracker\backend\.env"

# Alternative: Copy files instead
copy ..\..\..\.env .env
```

### Database Issues
```bash
# Check database connection
cd backend
node verify-data.js

# Reset PostgreSQL
docker-compose restart postgres

# Check container logs
docker logs backend-postgres-1
```

### Service Issues
```bash
# Check all services
docker-compose ps

# Restart specific service
docker-compose restart auth-service

# View service logs
docker logs backend-auth-service-1
```

## API Testing

### Login (Get Token)
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@attendance.com",
    "password": "password123"
  }'
```

### Test Authenticated Endpoint
```bash
curl -X GET http://localhost:3001/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get System Stats (Admin)
```bash
curl -X GET http://localhost:3002/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN_HERE"
```

## Database Queries

### Check Data Counts
```sql
-- Connect to database first:
-- docker exec -it backend-postgres-1 psql -U postgres -d gps_attendance_production

SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'courses', COUNT(*) FROM courses
UNION ALL
SELECT 'sessions', COUNT(*) FROM sessions
UNION ALL
SELECT 'attendances', COUNT(*) FROM attendances;
```

### Find User by Email
```sql
SELECT id, email, "firstName", "lastName", role, "emailVerified", "createdAt"
FROM users 
WHERE email = 'admin@attendance.com';
```

### Get Course with Most Sessions
```sql
SELECT c.name, c.code, COUNT(s.id) as session_count
FROM courses c
LEFT JOIN sessions s ON c.id = s."courseId"
GROUP BY c.id, c.name, c.code
ORDER BY session_count DESC
LIMIT 5;
```

## File Structure

### Important Files
```
backend/
├── .env                          # Main environment configuration
├── docker-compose.yml            # Container orchestration
├── seed.ts                       # Database seeding script
├── package.json                  # Main dependencies
└── services/
    ├── auth-service/
    │   ├── .env                  # Hard link to main .env
    │   ├── package.json          # Service dependencies
    │   └── prisma/schema.prisma  # Auth database schema
    └── attendance-service/
        ├── .env                  # Hard link to main .env
        ├── package.json          # Service dependencies
        └── prisma/schema.prisma  # Attendance database schema
```

### Configuration Files
```
docs/
├── README.md                     # Main documentation
├── SETUP.md                      # Detailed setup guide
├── API.md                        # API documentation
├── DATABASE.md                   # Database documentation
├── DEVELOPMENT.md                # Development guide
├── DEPLOYMENT.md                 # Production deployment
├── ARCHITECTURE.md               # System architecture
├── SECURITY.md                   # Security considerations
├── TROUBLESHOOTING.md            # Common issues
└── QUICK_REFERENCE.md            # This file
```

## Environment Variables

### Key Variables
```env
# Database
DATABASE_URL=postgresql://postgres:AttendanceSecurePassword2025@localhost:5432/gps_attendance_production?schema=public
POSTGRES_PASSWORD=AttendanceSecurePassword2025
POSTGRES_DB=gps_attendance_production

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=SuperSecureJWTSecret2025ForGPSAttendance!@#$%
JWT_REFRESH_SECRET=RefreshTokenSecret2025ForSecureAuthentication!@#$%
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Services
AUTH_SERVICE_PORT=3001
ATTENDANCE_SERVICE_PORT=3002
REALTIME_SERVICE_PORT=3003
SERVICE_AUTH_KEY=SecureServiceAuthKey2025!@#$%^&*

# Email (Development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@gpsattendance.edu
```

## Git Commands

### Basic Workflow
```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: description of changes"

# Push to remote
git push origin feature/your-feature-name

# Merge to main branch
git checkout main
git merge feature/your-feature-name
git push origin main
```

## Monitoring Commands

### System Health
```bash
# Check Docker resources
docker stats

# Check disk space
df -h  # Linux/macOS
dir C:\ # Windows

# Check database size
docker exec -it backend-postgres-1 psql -U postgres -d gps_attendance_production -c "SELECT pg_size_pretty(pg_database_size('gps_attendance_production'));"

# Check active connections
docker exec -it backend-postgres-1 psql -U postgres -d gps_attendance_production -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'gps_attendance_production';"
```

### Service Status
```bash
# Check if all services respond
curl -f http://localhost:3001/health && echo "Auth OK"
curl -f http://localhost:3002/health && echo "Attendance OK"  
curl -f http://localhost:3003/health && echo "Realtime OK"
```

## Backup Commands

### Database Backup
```bash
# Create backup
docker exec backend-postgres-1 pg_dump -U postgres gps_attendance_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker exec -i backend-postgres-1 psql -U postgres gps_attendance_production < backup_file.sql
```

### Environment Backup
```bash
# Backup configuration
cp backend/.env backup_env_$(date +%Y%m%d_%H%M%S)
```

## Reset Procedures

### Complete Reset
```bash
# Stop everything
docker-compose down -v

# Clean Docker
docker system prune -a

# Remove node_modules
rm -rf backend/node_modules
rm -rf backend/services/*/node_modules
rm -rf mobile/node_modules
rm -rf web/node_modules

# Start fresh
cd backend
docker-compose up -d
# Follow setup guide from step 3
```

### Soft Reset
```bash
# Just restart services
docker-compose restart

# Reseed database
cd backend
npm run seed
```

This quick reference covers the most commonly used commands and information for daily development and maintenance of the GPS Attendance Tracking System.
