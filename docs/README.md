# GPS Attendance Tracking System Documentation

## Project Overview
A comprehensive attendance tracking system using GPS verification for educational institutions and organizations. Built with microservices architecture, real-time updates, and mobile-first approach.

**Created Date:** 2025-08-26  
**Author:** borakport  
**Version:** 1.0.0  
**Platform:** Cross-platform (Windows/macOS/Linux)

## Table of Contents
- [Architecture Overview](./ARCHITECTURE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Development Guide](./DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Database Documentation](./DATABASE.md)

## Quick Start

### Prerequisites
- Node.js v18+ 
- Docker Desktop (Windows/macOS/Linux)
- PostgreSQL 15+ (via Docker)
- Redis 7+ (via Docker)
- React Native development environment
- Git Bash (recommended for Windows)

### Windows Setup

#### Backend Setup
```batch
REM Open Command Prompt or PowerShell
cd backend

REM Start Docker containers
docker-compose up -d
REM OR use the batch file
start-db.bat

REM Setup auth service
cd services\auth-service
npm install
npm run dev
```

#### Using Git Bash (Recommended for Windows)
```bash
# Git Bash provides Linux-like commands on Windows
cd backend
docker-compose up -d

cd services/auth-service
npm install
npm run dev
```

### macOS/Linux Setup
```bash
cd backend
docker-compose up -d
cd services/auth-service
npm install
npm run dev
```

### Mobile App Setup
```batch
REM Windows Command Prompt
cd mobile\AttendanceApp
npm install

REM For Android
npm run android

REM For iOS (macOS only)
cd ios && pod install && cd ..
npm run ios
```

## Features
- 🔐 Secure authentication with JWT
- 📍 GPS-based attendance verification
- ⚡ Real-time updates via WebSocket
- 📱 Native mobile apps (iOS & Android)
- 🎓 Course management system
- 📊 Attendance analytics
- 🔄 Offline support with sync
- 💻 Cross-platform support (Windows/macOS/Linux)

## Tech Stack

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL with Prisma ORM
- **Cache:** Redis
- **Real-time:** Socket.io
- **Authentication:** JWT with refresh tokens
- **Security:** Helmet, CORS, Rate Limiting
- **Containerization:** Docker Desktop

### Mobile
- **Framework:** React Native with TypeScript
- **Navigation:** React Navigation v6
- **State Management:** Redux Toolkit
- **UI Components:** React Native Paper
- **Forms:** React Hook Form
- **Validation:** Yup

## Project Structure
```
attendance-tracker/
├── backend/              # Microservices backend
│   ├── services/         # Individual services
│   ├── shared/           # Shared utilities
│   ├── docker-compose.yml
│   ├── start-db.bat      # Windows helper script
│   ├── stop-db.bat       # Windows helper script
│   └── reset-db.bat      # Windows helper script
├── mobile/               # React Native app
├── docs/                 # Documentation
└── README.md             # Project overview
```

## Platform-Specific Notes

### Windows Users
- Use Docker Desktop for Windows
- Recommended: Install Git Bash for Unix-like commands
- Use PowerShell or Command Prompt for native Windows commands
- Path separators: Use `\` in Windows commands, `/` in Git Bash

### macOS Users
- Use Docker Desktop for Mac
- Use Terminal for all commands
- Install Xcode for iOS development

### Linux Users
- Install Docker and Docker Compose
- Use native terminal
- May need to use `sudo` for Docker commands

## Contributing
Please read [DEVELOPMENT.md](./DEVELOPMENT.md) for development guidelines.

## License
MIT License - See LICENSE file for details

## Support
- Author: borakport
- Last Updated: 2025-08-26