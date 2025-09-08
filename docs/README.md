# GPS Attendance Tracking System

A comprehensive GPS-based attendance tracking system with real-time location verification, built with microservices architecture.

**Open Source Project** - Licensed under MIT License  
**Contributors:** ORN Borakport (Backend & Web) and MON Dina (Mobile App)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Docker Desktop
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/borakport/attendance-tracker.git
   cd attendance-tracker
   ```

2. **Start infrastructure services**
   ```bash
   cd backend
   docker-compose up -d
   ```

3. **Set up environment configuration**
   ```bash
   # Create hard links for Prisma CLI access (Windows)
   cd backend\services\auth-service
   cmd /c "mklink /H .env c:\Data\attendance-tracker\backend\.env"
   
   cd ..\attendance-service
   cmd /c "mklink /H .env c:\Data\attendance-tracker\backend\.env"
   ```

4. **Initialize database**
   ```bash
   cd backend\services\auth-service
   npx prisma db push
   npx prisma generate
   
   cd ..\attendance-service  
   npx prisma db push
   npx prisma generate
   
   cd ..\..
   npm run seed
   ```

5. **Start services**
   ```bash
   # Auth Service
   cd backend\services\auth-service
   npm install && npm run build && npm start
   
   # Attendance Service  
   cd ..\attendance-service
   npm install && npm run build && npm start
   
   # Realtime Service
   cd ..\realtime-service
   npm install && npm run build && npm start
   ```

6. **Start mobile app**
   ```bash
   cd mobile
   npm install
   npm start
   ```

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │    Web App      │    │   Admin Panel   │
│  (React Native)│    │   (Next.js)     │    │   (Next.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
              ┌─────────────────────────────────────┐
              │           API Gateway               │
              └─────────────────────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  Auth Service   │    │Attendance Service│    │ Realtime Service│
│    (Port 3001)  │    │   (Port 3002)   │    │   (Port 3003)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
              ┌─────────────────────────────────────┐
              │            Data Layer               │
              │  PostgreSQL  │  Redis  │  Storage   │
              └─────────────────────────────────────┘
```

## 📚 Documentation

- **[Setup Guide](./SETUP.md)** - Detailed installation and configuration
- **[API Documentation](./API.md)** - Complete API reference
- **[Architecture](./ARCHITECTURE.md)** - System design and components
- **[Development](./DEVELOPMENT.md)** - Development environment setup
- **[Deployment](./DEPLOYMENT.md)** - Production deployment guide
- **[Database](./DATABASE.md)** - Database schema and operations
- **[Security](./SECURITY.md)** - Security considerations
- **[Troubleshooting](./TROUBLESHOOTING.md)** - Common issues and solutions

## 🔐 Default Credentials

**Admin User:**
- Email: `admin@attendance.com`
- Password: `password123`

**Instructors (Sample Accounts):**
- Email: `prof.anderson@university.edu`
- Email: `dr.martinez@college.edu`
- Email: `prof.johnson@academy.edu`
- Email: `dr.wilson@institute.edu`
- Password: `password123` (for all instructor accounts)

**Students (Sample Accounts):**
- Email: `alice.smith@student.edu`
- Email: `bob.johnson@student.edu`
- Email: `charlie.brown@student.edu`
- Email: `diana.prince@student.edu`
- Password: `password123` (for all student accounts)

## 📊 Database Statistics

After seeding, the database contains:
- **49 users** (1 admin, 8 instructors, 40 students)
- **24 courses** with realistic academic content
- **Multiple class sessions** with GPS coordinates
- **60,542 attendance records** 
- **2,453 course memberships**

## 🛠️ Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js microservices
- PostgreSQL + Prisma ORM
- Redis for caching
- JWT authentication
- WebSocket for real-time updates

**Frontend:**
- React Native (Mobile)
- Next.js (Web & Admin)
- TypeScript
- TailwindCSS

**Infrastructure:**
- Docker & Docker Compose
- Nginx (production)
- SSL/TLS encryption

## 📈 Features

### ✅ Core Features
- **GPS-based attendance tracking**
- **Real-time location verification**
- **QR code session joining**
- **Course management**
- **Real-time updates via WebSocket**
- **Role-based access control**
- **Comprehensive admin panel**

### ✅ Security Features
- **JWT authentication with refresh tokens**
- **Password hashing with bcrypt**
- **Rate limiting**
- **Input validation**
- **SQL injection prevention**
- **CORS protection**

### ✅ Mobile Features
- **Cross-platform (iOS/Android)**
- **Offline-first design**
- **Push notifications**
- **Interactive maps**
- **Camera integration for selfies**
- **Biometric authentication support**

## 🔄 Development Workflow

1. **Feature Development**
   ```bash
   git checkout -b feature/your-feature-name
   # Make changes
   git commit -m "feat: add new feature"
   git push origin feature/your-feature-name
   ```

2. **Testing**
   ```bash
   npm test                    # Unit tests
   npm run test:integration   # Integration tests
   npm run test:e2e          # End-to-end tests
   ```

3. **Code Quality**
   ```bash
   npm run lint              # ESLint
   npm run format            # Prettier
   npm run type-check        # TypeScript
   ```

## 📞 Support

- **Documentation Issues:** Check [Troubleshooting](./TROUBLESHOOTING.md)
- **Development Questions:** See [Development Guide](./DEVELOPMENT.md)
- **Deployment Help:** Review [Deployment Guide](./DEPLOYMENT.md)

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.