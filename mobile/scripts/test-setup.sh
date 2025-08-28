#!/bin/bash

echo "📱 GPS Attendance Mobile Setup"
echo "=============================="

# Check Node version
echo "✓ Checking Node version..."
node -v

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g eas-cli
else
    echo "✓ EAS CLI installed"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if logged into Expo
echo "🔐 Checking Expo login..."
eas whoami || eas login

# Prebuild
echo "🏗️ Prebuilding native projects..."
npx expo prebuild --clean

# Show available build commands
echo ""
echo "✅ Setup complete! Available commands:"
echo "--------------------------------------"
echo "npm start                 - Start dev server"
echo "npm run build:dev        - Build development APK"
echo "npm run build:preview    - Build preview APK"
echo "npm run build:ios-dev    - Build iOS development"
echo ""
echo "🚀 To build APK: npm run build:dev"
