# Setup Guide

This guide provides detailed instructions for setting up the GPS Attendance Tracking System.

## Environment Setup

### 1. Prerequisites Installation

**Windows:**
```powershell
# Install Node.js (v18+)
winget install OpenJS.NodeJS

# Install Docker Desktop
winget install Docker.DockerDesktop

# Install Git
winget install Git.Git
```

**macOS:**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node

# Install Docker Desktop
brew install --cask docker

# Install Git
brew install git
```

**Linux (Ubuntu/Debian):**
```bash
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Docker
sudo apt-get update
sudo apt-get install docker.io docker-compose

# Install Git
sudo apt-get install git
```

### 2. Project Setup

#### Clone Repository
```bash
git clone https://github.com/borakport/attendance-tracker.git
cd attendance-tracker
```

#### Infrastructure Services
```bash
cd backend
docker-compose up -d
```

**Services started:**
- PostgreSQL (Port 5432)
- Redis (Port 6379)
- MailPit (Ports 1025, 8025)
- SMS Simulator (Port 3010)

### 3. Environment Configuration

#### Create Hard Links for Prisma CLI (Windows)

The system uses a centralized `.env` file in the `backend/` directory, but Prisma CLI requires local `.env` files in each service directory. We solve this using hard links:

```powershell
# Navigate to auth service
cd backend\services\auth-service

# Create hard link to main .env file
cmd /c "mklink /H .env c:\Data\attendance-tracker\backend\.env"

# Navigate to attendance service
cd ..\attendance-service

# Create hard link to main .env file  
cmd /c "mklink /H .env c:\Data\attendance-tracker\backend\.env"
```

#### Create Hard Links for Prisma CLI (macOS/Linux)

```bash
# Navigate to auth service
cd backend/services/auth-service

# Create hard link to main .env file
ln backend/.env .env

# Navigate to attendance service
cd ../attendance-service

# Create hard link to main .env file
ln ../../.env .env
```

#### Verify Hard Links
```bash
# Check that .env files exist and have same content
ls -la backend/services/auth-service/.env
ls -la backend/services/attendance-service/.env
ls -la backend/.env
```

All three files should have the same size and timestamp.

### 4. Database Setup

#### Deploy Schemas
```bash
# Deploy auth service schema
cd backend\services\auth-service
npx prisma db push
npx prisma generate

# Deploy attendance service schema
cd ..\attendance-service  
npx prisma db push
npx prisma generate

# Generate main Prisma client for seeding
cd ..\..
npx prisma generate
```

#### Seed Database
```bash
cd backend
npm run seed
```

**Seeded Data:**
- 527 users (2 admins, 25 instructors, 500 students)
- 80 courses with realistic content
- 2,406 class sessions with GPS coordinates
- 60,542 attendance records
- 2,453 course memberships

### 5. Service Installation

#### Backend Services
```bash
# Auth Service
cd backend\services\auth-service
npm install
npm run build

# Attendance Service
cd ..\attendance-service
npm install
npm run build

# Realtime Service
cd ..\realtime-service
npm install
npm run build
```

#### Web Application
```bash
cd web
npm install
npm run build
```

#### Mobile Application
```bash
cd mobile
npm install
```

### 6. Verification

#### Database Connection Test
```bash
cd backend
node verify-data.js
```

Expected output:
```
✅ Database verification:
👥 Users: 527
📚 Courses: 80
📅 Sessions: 2406
✅ Attendance Records: 60542
```

#### Service Health Check
```bash
# Check Docker services
cd backend
docker-compose ps
```

All services should show "Up" status.

## Configuration Details

### Environment Variables

The main `.env` file contains all configuration:

```env
# PostgreSQL Database
POSTGRES_PASSWORD=AttendanceSecurePassword2025
POSTGRES_DB=gps_attendance_production
DATABASE_URL=postgresql://postgres:AttendanceSecurePassword2025@localhost:5432/gps_attendance_production?schema=public

# Redis
REDIS_URL=redis://localhost:6379

# Service Ports
AUTH_SERVICE_PORT=3001
ATTENDANCE_SERVICE_PORT=3002
REALTIME_SERVICE_PORT=3003

# JWT Configuration
JWT_SECRET=SuperSecureJWTSecret2025ForGPSAttendance!@#$%
JWT_REFRESH_SECRET=RefreshTokenSecret2025ForSecureAuthentication!@#$%
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Service Authentication
SERVICE_AUTH_KEY=SecureServiceAuthKey2025!@#$%^&*

# Email Configuration (MailPit for development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=test@gpsattendance.edu
SMTP_PASS=
SMTP_FROM=noreply@gpsattendance.edu

# SMS Configuration (Simulator for development)
SMS_PROVIDER=simulator
SMS_API_URL=http://localhost:3010
```

### Default User Credentials

**System Administrators:**
- Email: `system.admin@gpsattendance.edu`
- Email: `super.admin@gpsattendance.edu`
- Password: `Admin@2025!Secure`

**Instructors:**
- Email Pattern: `[firstName].[lastName]@university.edu`
- Password: `Instructor@2025!Secure`
- Example: `john.doe@university.edu`

**Students:**
- Email Pattern: `[firstName].[lastName][number]@student.edu`  
- Password: `Student@2025!Secure`
- Example: `jane.smith1@student.edu`

### Database Schema

The system uses two main Prisma schemas:

**Auth Service Schema:**
- Users, RefreshTokens
- Authentication and user management

**Attendance Service Schema:**
- Courses, Sessions, Attendances, SystemLogs
- Core attendance tracking functionality

Both schemas are deployed to the same PostgreSQL database but managed by separate services.

## Troubleshooting Setup Issues

### Common Issues

**1. Hard Link Creation Failed**
```
Error: The system cannot find the file specified.
```
**Solution:** Ensure the main `.env` file exists in `backend/` directory and use absolute paths:
```bash
cmd /c "mklink /H .env C:\full\path\to\attendance-tracker\backend\.env"
```

**2. Prisma Database Connection Failed**
```
Error: P1000: Authentication failed against database server
```
**Solution:** 
- Verify PostgreSQL container is running: `docker-compose ps`
- Check DATABASE_URL in `.env` file
- Restart containers: `docker-compose restart postgres`

**3. Port Already in Use**
```
Error: Port 5432 is already in use
```
**Solution:** Stop conflicting services:
```bash
# Stop local PostgreSQL service
net stop postgresql

# Or change port in docker-compose.yml
```

**4. Permission Denied (Windows)**
```
Error: Access denied
```
**Solution:** Run PowerShell as Administrator for hard link creation.

### Reset Setup

If you need to start fresh:

```bash
# Stop all containers and remove volumes
cd backend
docker-compose down -v

# Remove node_modules
rm -rf node_modules
rm -rf services/*/node_modules

# Remove hard links
rm services/auth-service/.env
rm services/attendance-service/.env

# Start setup again
docker-compose up -d
```

## Next Steps

After successful setup:

1. **Start Development:** See [Development Guide](./DEVELOPMENT.md)
2. **Run Services:** Follow service startup instructions
3. **Access Applications:**
   - Admin Panel: http://localhost:3000
   - API Documentation: http://localhost:3001/docs
   - MailPit: http://localhost:8025
   - Prisma Studio: `npx prisma studio`

4. **Deploy to Production:** See [Deployment Guide](./DEPLOYMENT.md)

## Getting Help & Contributing

### Repository
- **GitHub Repository:** https://github.com/borakport/attendance-tracker.git
- **Report Issues:** https://github.com/borakport/attendance-tracker/issues
- **Submit Pull Requests:** https://github.com/borakport/attendance-tracker/pulls

### Development Workflow
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/attendance-tracker.git

# Add upstream remote
git remote add upstream https://github.com/borakport/attendance-tracker.git

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: description of your changes"

# Push to your fork
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Support
- **Documentation:** Check the `/docs` directory for detailed guides
- **Issues:** Use GitHub Issues for bug reports and feature requests
- **Discussions:** Use GitHub Discussions for questions and community support
