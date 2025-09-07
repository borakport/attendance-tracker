# GPS Attendance Tracker

![Project Status](https://img.shields.io/badge/Status-Backend%20Complete-green) ![Progress](https://img.shields.io/badge/Progress-65%25-brightgreen) ![GitHub last commit](https://img.shields.io/github/last-commit/borakport/attendance-tracker) ![GitHub issues](https://img.shields.io/github/issues/borakport/attendance-tracker)
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

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[GitHub Features Guide](docs/GITHUB_FEATURES_GUIDE.md)** - How to use all GitHub automation & workflows
- **[Git Workflow](docs/GIT_WORKFLOW.md)** - Branch strategy and collaboration guidelines  
- **[API Documentation](docs/API_DOCUMENTATION.md)** - Complete API reference
- **[Development Guide](docs/DEVELOPMENT.md)** - Local development setup
- **[Architecture Overview](docs/ARCHITECTURE.md)** - System design and components
- **[Security Policy](docs/SECURITY.md)** - Security guidelines and reporting
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** - Common issues and solutions

### Mobile App Documentation
- **[📱 Mobile App Documentation](mobile/docs/README.md)** - Complete mobile app documentation
- **[🛠️ Mobile Setup Guides](mobile/docs/setup/)** - Installation and development setup
- **[🚀 Implementation Steps](mobile/docs/implementation/)** - Development milestones
- **[📦 Mobile Deployment](mobile/docs/deployment/)** - Production deployment guides

### Quick Links
- 🚀 **[Project Status](docs/PROJECT_STATUS.md)** - Current progress and roadmap
- 🧪 **[Test Data](docs/TEST_DATA.md)** - Login credentials and sample data
- ⚡ **[Quick Reference](docs/QUICK_REFERENCE.md)** - Common commands and shortcuts

## 🤝 Contributing & Open Source

This project is **100% open source** and welcomes contributions from the community!

### 🌟 Why Contribute?
- **Learn & Grow:** Work with modern technologies (Node.js, React Native, PostgreSQL, Docker)
- **Make Impact:** Help educational institutions worldwide track attendance effectively
- **Build Portfolio:** Contribute to a real-world, production-ready application
- **Join Community:** Collaborate with experienced developers

### 🛠️ Areas for Contribution

**Backend Development** (Contact: [@borakport](https://github.com/borakport))
- 🔧 API improvements and new endpoints
- 🚀 Performance optimizations
- 🔒 Security enhancements
- 🧪 Testing and quality assurance

**Web Frontend** (Contact: [@borakport](https://github.com/borakport))
- 🎨 UI/UX improvements
- 📊 Dashboard features
- 📱 Responsive design enhancements

**Mobile Development** (Contact: MON Dina)
- 📱 iOS/Android optimizations
- 🗺️ GPS and location improvements  
- 💾 Offline functionality
- 🎯 Performance optimizations

**Documentation & Community**
- 📚 Documentation improvements
- 🌍 Translation support
- 🎥 Tutorial creation
- 🐛 Bug reports and testing

### 🚀 Getting Started

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make your changes and commit:** `git commit -m 'Add amazing feature'`
4. **Push to your branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### 📖 Development Resources

- **[Contributing Guide](CONTRIBUTING.md)** - Detailed contribution guidelines
- **[Setup Guide](docs/SETUP.md)** - Development environment setup
- **[Architecture](docs/ARCHITECTURE.md)** - System design overview
- **[API Documentation](docs/API.md)** - Complete API reference

### 💬 Community & Support

- **Issues:** Report bugs and request features via [GitHub Issues](https://github.com/borakport/attendance-tracker/issues)
- **Discussions:** Join community discussions for questions and ideas
- **Pull Requests:** Contribute code improvements and new features

**We appreciate all contributions, big or small! 🙏**

## 📄 License

This project is **open source** and available under the **MIT License**.

```
MIT License

Copyright (c) 2025 ORN Borakport (Backend & Web Interface) and MON Dina (Mobile App)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

See the [LICENSE](LICENSE) file for full details.

## � Contributors

This project is a collaborative effort by:

### 🔧 **ORN Borakport** ([@borakport](https://github.com/borakport))
- **Backend Architecture & Development** - Complete microservices backend with authentication, attendance tracking, and real-time features
- **Web Interface** - Administrative dashboard and web portal
- **System Design** - Database schema, API design, and infrastructure setup
- **DevOps** - Docker containerization, database management, and deployment configuration

### 📱 **MON Dina** 
- **Mobile Application** - Complete React Native app for iOS and Android
- **Mobile UI/UX** - User interface design and user experience optimization
- **Mobile Features** - GPS integration, offline support, and mobile-specific functionality
- **Cross-platform Development** - Ensuring consistent experience across mobile platforms

---

⭐ **If you find this project useful, please give it a star on GitHub!** ⭐