# Contributing to GPS Attendance Tracker

Thank you for your interest in contributing to the GPS Attendance Tracker! This project is open source and welcomes contributions from the community.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [How to Contribute](#how-to-contribute)
- [Development Guidelines](#development-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Contact](#contact)

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. Please be respectful and professional in all interactions.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **Docker Desktop**
- **Git**
- **React Native development environment** (for mobile contributions)

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/attendance-tracker.git
   cd attendance-tracker
   ```

2. **Set up Backend Services**
   ```bash
   cd backend
   docker-compose up -d
   cd services/auth-service && npm install
   cd ../attendance-service && npm install
   cd ../realtime-service && npm install
   ```

3. **Set up Web Frontend**
   ```bash
   cd web
   npm install
   ```

4. **Set up Mobile App**
   ```bash
   cd mobile
   npm install
   ```

## Project Structure

```
attendance-tracker/
├── backend/                 # Backend services (ORN Borakport)
│   ├── services/
│   │   ├── auth-service/    # Authentication & user management
│   │   ├── attendance-service/ # Attendance tracking & GPS
│   │   └── realtime-service/   # WebSocket & real-time features
│   └── docker-compose.yml  # Infrastructure services
├── web/                     # Web frontend (ORN Borakport)
├── mobile/                  # React Native app (MON Dina)
└── docs/                    # Documentation
```

## How to Contribute

### 🔧 Backend & API Development
**Contact: [@borakport](https://github.com/borakport)**

Areas for contribution:
- Bug fixes in authentication, attendance tracking, or real-time services
- Performance optimizations
- New API endpoints
- Security enhancements
- Database optimizations
- Testing improvements

**Tech Stack:**
- Node.js, TypeScript, Express.js
- PostgreSQL, Redis, Prisma ORM
- Docker, WebSocket (Socket.IO)

### 🌐 Web Frontend Development
**Contact: [@borakport](https://github.com/borakport)**

Areas for contribution:
- UI/UX improvements
- New admin dashboard features
- Responsive design enhancements
- Performance optimizations
- Accessibility improvements

**Tech Stack:**
- Next.js, React, TypeScript
- Tailwind CSS

### 📱 Mobile App Development
**Contact: MON Dina**

Areas for contribution:
- iOS/Android specific optimizations
- New mobile features
- GPS and location improvements
- Offline functionality enhancements
- UI/UX improvements
- Performance optimizations

**Tech Stack:**
- React Native, TypeScript, Expo
- Native modules, GPS/Location services

### 📚 Documentation & Testing
**Anyone can contribute:**
- Documentation improvements
- Translation support
- Test coverage improvements
- Tutorial creation
- Bug reports and feature requests

## Development Guidelines

### Code Style
- Use **TypeScript** for all new code
- Follow **ESLint** and **Prettier** configurations
- Write **clear, descriptive commit messages**
- Add **JSDoc comments** for functions and classes
- Include **unit tests** for new features

### Commit Convention
We use [Conventional Commits](https://conventionalcommits.org/):

```
feat: add new attendance export feature
fix: resolve GPS location accuracy issue
docs: update API documentation
test: add unit tests for auth service
refactor: improve database query performance
```

### Branch Naming
- `feature/your-feature-name`
- `fix/bug-description`
- `docs/documentation-update`
- `test/test-description`

## Pull Request Process

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Your Changes**
   - Write clean, well-documented code
   - Add or update tests as needed
   - Update documentation if required

3. **Test Your Changes**
   ```bash
   # Backend tests
   cd backend/services/auth-service && npm test
   
   # Web tests
   cd web && npm test
   
   # Mobile tests
   cd mobile && npm test
   ```

4. **Submit Pull Request**
   - Create a clear PR title and description
   - Reference any related issues
   - Ensure all checks pass
   - Request review from relevant maintainers

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Other (specify)

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Related Issues
Fixes #issue_number
```

## Issue Reporting

### Bug Reports
When reporting bugs, please include:
- **Environment** (OS, Node version, browser)
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots** (if applicable)
- **Error messages** (if any)

### Feature Requests
For new features, please include:
- **Problem statement**
- **Proposed solution**
- **Alternative solutions considered**
- **Additional context**

## Development Areas

### High Priority
- [ ] **Backend:** API rate limiting improvements
- [ ] **Mobile:** Offline data synchronization
- [ ] **Web:** Advanced reporting dashboard
- [ ] **Testing:** Automated test coverage
- [ ] **Docs:** API documentation improvements

### Medium Priority
- [ ] **Backend:** Performance monitoring
- [ ] **Mobile:** Push notifications
- [ ] **Web:** Real-time dashboard updates
- [ ] **Security:** Security audit and improvements
- [ ] **i18n:** Multi-language support

### Help Wanted
- [ ] **Translation:** Multi-language support
- [ ] **Testing:** End-to-end test automation
- [ ] **Docs:** Video tutorials
- [ ] **Mobile:** iOS-specific optimizations
- [ ] **Backend:** GraphQL API option

## Recognition

Contributors will be recognized in:
- **README.md** contributors section
- **CONTRIBUTORS.md** detailed contributions
- **Release notes** for significant contributions

## Contact

### Maintainers
- **Backend & Web:** ORN Borakport ([@borakport](https://github.com/borakport))
- **Mobile App:** MON Dina

### Communication
- **GitHub Issues:** For bug reports and feature requests
- **GitHub Discussions:** For questions and general discussion
- **Pull Requests:** For code contributions

## License

By contributing to this project, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to GPS Attendance Tracker! 🚀
