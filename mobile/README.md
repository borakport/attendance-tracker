# GPS Attendance Mobile App

## 📱 Overview
React Native mobile app for GPS-based attendance tracking with real-time updates.

## � Documentation

All mobile app documentation has been organized in the [`docs/`](./docs/) directory:

- **[📖 Complete Documentation](./docs/README.md)** - Start here for all mobile documentation
- **[🛠️ Setup Guides](./docs/setup/)** - Installation and development setup
- **[🚀 Implementation Progress](./docs/implementation/)** - Development milestones and features
- **[📦 Deployment](./docs/deployment/)** - Production deployment guides
- **[🔧 Fixes & Updates](./docs/fixes/)** - Bug fixes and improvements
- **[📋 Main App Documentation](./docs/MOBILE_APP_DOCUMENTATION.md)** - Comprehensive app documentation

## �🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- EAS CLI (`npm install -g eas-cli`)
- Expo account (for building)
- Android Studio (for Android development)
- Xcode (for iOS development, Mac only)
- Android device/emulator with API level 23+ (Android 6.0+)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure EAS:**
```bash
# Login to your Expo account
eas login

# Configure the project
eas build:configure
```

3. **Build development client:**
```bash
# For Android APK
npm run build:dev

# For iOS (Mac only)
npm run build:ios-dev
```

4. **Download and install the APK:**
- Wait for build to complete (~15-20 minutes)
- Download APK from the provided link
- Install on device/emulator

5. **Start development server:**
```bash
npm start
```

## 🏗️ Build Commands

### Development Builds
```bash
# Android APK (for testing)
eas build --platform android --profile development

# iOS Simulator build
eas build --platform ios --profile development
```

### Preview Builds
```bash
# Android APK (release mode)
eas build --platform android --profile preview
```

### Production Builds
```bash
# Android App Bundle (for Play Store)
eas build --platform android --profile production

# iOS (for App Store)
eas build --platform ios --profile production
```

## 🔧 Configuration

### For Physical Device Testing

1. **Find your computer's IP:**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig | grep inet
```

2. **Update `.env` file:**
```env
EXPO_PUBLIC_API_URL=http://YOUR_IP:3001/api/v1
EXPO_PUBLIC_ATTENDANCE_API_URL=http://YOUR_IP:3002/api/v1
EXPO_PUBLIC_REALTIME_URL=http://YOUR_IP:3003
```

3. **Ensure backend is accessible:**
- All services running
- Firewall allows connections
- Same network as device

## 📦 Native Modules Included

### Location & Maps
- expo-location (GPS tracking)
- expo-task-manager (Background tasks)
- react-native-maps (Map display)
- expo-sensors (Device sensors)

### Media & Camera
- expo-camera (Selfie verification)
- expo-image-picker (Profile photos)
- expo-media-library (Photo storage)

### Notifications & Background
- expo-notifications (Push notifications)
- expo-background-fetch (Background sync)

### Security & Storage
- expo-secure-store (Token storage)
- expo-local-authentication (Biometric auth)
- @react-native-async-storage (Data persistence)

## 📲 Features

- **GPS Attendance**: Location-based verification
- **Real-time Updates**: WebSocket notifications
- **Offline Support**: Queue and sync
- **Biometric Auth**: Fingerprint/Face ID
- **Camera Selfies**: Photo verification
- **Background Tracking**: Auto attendance
- **Push Notifications**: Session alerts
- **Maps Integration**: Visual location

## 🎨 Project Structure

```
src/
├── components/      # Reusable UI components
├── screens/        # Screen components
├── navigation/     # Navigation setup
├── services/       # API & external services
├── store/         # Redux state management
├── hooks/         # Custom React hooks
├── utils/         # Helper functions
├── constants/     # App constants
├── styles/        # Global styles
└── types/         # TypeScript definitions
```

## 🐛 Troubleshooting

### Build Fails
- Clear cache: `expo prebuild --clear`
- Delete node_modules and reinstall
- Check EAS status: https://status.expo.dev

### Location Not Working
- Check permissions in device settings
- Ensure location services enabled
- Test with high accuracy mode

### API Connection Issues
- Verify backend services running
- Check IP address in .env
- Test with curl/Postman first

### APK Won't Install
- Enable "Install from unknown sources"
- Uninstall previous versions
- Check minimum Android version (5.0+)

## 📝 Development Workflow

1. Make changes to code
2. Save files (hot reload works)
3. Test on development client
4. For native changes, rebuild APK

## 🚢 Deployment

### Android Release
1. Update version in app.json
2. Build: `eas build --platform android --profile production`
3. Submit: `eas submit --platform android`

### iOS Release
1. Update version in app.json
2. Build: `eas build --platform ios --profile production`
3. Submit: `eas submit --platform ios`

## 📄 Environment Variables

All environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in the app.

Example:
```javascript
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

## 🔐 Security Notes

- Never commit .env files
- Use secure storage for tokens
- Implement certificate pinning for production
- Enable ProGuard for production builds

---

Developer: borakport
Last Updated: 2025-08-28
