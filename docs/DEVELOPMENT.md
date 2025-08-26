# Development Guide

## Development Environment Setup

### Prerequisites

#### Windows
- Node.js v18.0.0 or higher (use [nvm-windows](https://github.com/coreybutler/nvm-windows))
- Docker Desktop for Windows
- Git for Windows (includes Git Bash)
- Visual Studio Code
- Windows Terminal (recommended)
- Android Studio (for Android development)

#### macOS
- Node.js v18.0.0 or higher (use [nvm](https://github.com/nvm-sh/nvm))
- Docker Desktop for Mac
- Xcode (for iOS development)
- Android Studio (for Android development)
- Visual Studio Code

#### Linux
- Node.js v18.0.0 or higher
- Docker and Docker Compose
- Git
- Visual Studio Code
- Android Studio

### Recommended VS Code Extensions
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Prisma
- React Native Tools
- GitLens
- Docker
- Remote - WSL (for Windows users)

## Initial Setup

### 1. Clone Repository

#### Windows (Command Prompt/PowerShell)
```batch
git clone <repository-url>
cd attendance-tracker
```

#### Windows (Git Bash) / macOS / Linux
```bash
git clone <repository-url>
cd attendance-tracker
```

### 2. Backend Setup

#### Start Infrastructure

##### Windows (Command Prompt)
```batch
cd backend
docker-compose up -d
REM OR use helper script
start-db.bat
```

##### Windows (PowerShell)
```powershell
cd backend
docker-compose up -d
# OR use helper script
.\start-db.bat
```

##### macOS/Linux
```bash
cd backend
docker-compose up -d
```

#### Verify Docker Containers

##### Windows
```batch
docker ps
REM You should see: attendance_postgres, attendance_redis, attendance_adminer
```

##### macOS/Linux
```bash
docker ps
# You should see: attendance_postgres, attendance_redis, attendance_adminer
```

#### Auth Service Setup

##### All Platforms
```bash
cd services/auth-service
cp .env.example .env  # On Windows, use: copy .env.example .env
# Edit .env with your configurations
npm install
npx prisma migrate dev
npx prisma generate
npm run dev
```

### 3. Mobile App Setup

#### Install Dependencies

##### Windows
```batch
cd mobile\AttendanceApp
npm install

REM For Android
npm run android
```

##### macOS
```bash
cd mobile/AttendanceApp
npm install

# For iOS
cd ios
pod install
cd ..
npm run ios

# For Android
npm run android
```

## Platform-Specific Development Tips

### Windows Development

#### Using Git Bash (Recommended)
Git Bash provides a Unix-like environment on Windows:
```bash
# You can use Unix commands
ls -la
cd backend/services
rm -rf node_modules
```

#### PowerShell Tips
```powershell
# Set execution policy for scripts
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Use Unix-like aliases
New-Alias -Name "ls" -Value "Get-ChildItem"
```

#### Path Issues
- Use forward slashes `/` in Git Bash and configuration files
- Use backslashes `\` in Command Prompt
- PowerShell accepts both

#### Line Ending Issues
Configure Git to handle line endings:
```bash
git config --global core.autocrlf true
```

### Docker on Windows

#### Docker Desktop Settings
1. Ensure WSL 2 backend is enabled (recommended)
2. Allocate sufficient resources (Settings > Resources)
3. Enable file sharing for your project drive

#### Troubleshooting Docker on Windows
```batch
REM Restart Docker Desktop
net stop com.docker.service
net start com.docker.service

REM Or use PowerShell
Restart-Service com.docker.service
```

## Database Management

### Prisma Commands

#### All Platforms
```bash
# Create migration
npx prisma migrate dev --name migration-name

# Apply migrations
npx prisma migrate deploy

# Generate client
npx prisma generate

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database
npx prisma migrate reset
```

### Database Backup

#### Windows
```batch
REM Backup
docker exec -t attendance_postgres pg_dump -U attendance_user attendance_db > backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%.sql

REM Restore
docker exec -i attendance_postgres psql -U attendance_user attendance_db < backup.sql
```

#### macOS/Linux
```bash
# Backup
docker exec -t attendance_postgres pg_dump -U attendance_user attendance_db > backup_$(date +%Y%m%d).sql

# Restore
docker exec -i attendance_postgres psql -U attendance_user attendance_db < backup.sql
```

## Common Windows Issues & Solutions

### Issue: "scripts is disabled on this system"
```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: Docker not starting on Windows
1. Enable Hyper-V and WSL 2
2. Restart Windows
3. Reinstall Docker Desktop

### Issue: Port already in use (Windows)
```batch
REM Find process using port
netstat -ano | findstr :5432

REM Kill process (use PID from previous command)
taskkill /PID <PID> /F
```

### Issue: npm commands not working
```batch
REM Clear npm cache
npm cache clean --force

REM Delete node_modules and reinstall
rmdir /s /q node_modules
del package-lock.json
npm install
```

## Testing

### Backend Testing

#### All Platforms
```bash
cd backend/services/auth-service

# Unit tests
npm test

# Integration tests
npm run test:integration

# Test coverage
npm run test:coverage
```

### Mobile Testing

#### Windows (Android Only)
```batch
cd mobile\AttendanceApp

REM Component tests
npm test

REM E2E tests
npm run e2e:android
```

#### macOS (iOS and Android)
```bash
cd mobile/AttendanceApp

# Component tests
npm test

# E2E tests
npm run e2e:ios
npm run e2e:android
```

## Development Scripts

### Windows Batch Scripts

Create `dev.bat` in project root:
```batch
@echo off
echo Starting Development Environment...
cd backend
start cmd /k "docker-compose up"
timeout /t 10
cd services\auth-service
start cmd /k "npm run dev"
cd ..\attendance-service
start cmd /k "npm run dev"
cd ..\realtime-service
start cmd /k "npm run dev"
echo All services starting...
```

### Unix Shell Scripts (macOS/Linux/Git Bash)

Create `dev.sh` in project root:
```bash
#!/bin/bash
echo "Starting Development Environment..."
cd backend
docker-compose up -d
cd services/auth-service && npm run dev &
cd ../attendance-service && npm run dev &
cd ../realtime-service && npm run dev &
echo "All services started"
```

## Environment Variables

### Windows Environment Variables
Set permanent environment variables:
```batch
REM Command Prompt (Admin)
setx NODE_ENV development
setx DATABASE_URL "postgresql://attendance_user:attendance_pass@localhost:5432/attendance_db"
```

### Unix Environment Variables
```bash
# Add to ~/.bashrc or ~/.zshrc
export NODE_ENV=development
export DATABASE_URL="postgresql://attendance_user:attendance_pass@localhost:5432/attendance_db"
```

## Git Configuration for Windows

```bash
# Handle line endings
git config --global core.autocrlf true

# Use VS Code as default editor
git config --global core.editor "code --wait"

# Set up user information
git config --global user.name "borakport"
git config --global user.email "your-email@example.com"
```

## Resources

### Documentation
- [Node.js on Windows](https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows)
- [Docker Desktop for Windows](https://docs.docker.com/desktop/windows/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Prisma Docs](https://www.prisma.io/docs/)

### Windows-Specific Tools
- [Windows Terminal](https://aka.ms/terminal)
- [PowerShell 7](https://aka.ms/powershell)
- [Git for Windows](https://gitforwindows.org/)
- [nvm-windows](https://github.com/coreybutler/nvm-windows)

## Author
**borakport** - 2025-08-26