# GPS Attendance Tracker

![Project Status](https://img.shields.io/badge/Status-In%20Development-yellow) ![Progress](https://img.shields.io/badge/Progress-25%25-orange) ![GitHub last commit](https://img.shields.io/github/last-commit/borakport/attendance-tracker) ![GitHub issues](https://img.shields.io/github/issues/borakport/attendance-tracker)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.72-61DAFB)](https://reactnative.dev/)
[![Docker](https://img.shields.io/badge/Docker-Required-2496ED)](https://www.docker.com/)

A comprehensive GPS-based attendance tracking system with real-time updates, built with microservices architecture.

## 🌟 Features

- 🔐 **Secure Authentication** - JWT-based auth with refresh tokens
- 📍 **GPS Verification** - Location-based attendance marking
- ⚡ **Real-time Updates** - WebSocket-powered live attendance tracking
- 📱 **Cross-platform Mobile App** - React Native for iOS and Android
- 🎓 **Course Management** - Create and manage courses with invitation codes
- 📊 **Analytics Dashboard** - Attendance statistics and reports
- 🔄 **Offline Support** - Sync when connection restored
- 🌐 **Microservices Architecture** - Scalable and maintainable

## 📸 Screenshots

<!-- Add screenshots here when available -->
[Coming Soon]

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- Docker Desktop
- Git
- React Native development environment

### Installation

```bash
# Clone the repository
git clone https://github.com/borakport/attendance-tracker.git
cd attendance-tracker

# Start backend services
cd backend
docker-compose up -d
cd services/auth-service
npm install
npm run dev

# Start mobile app
cd ../../mobile/AttendanceApp
npm install
npm run android # or npm run ios
```