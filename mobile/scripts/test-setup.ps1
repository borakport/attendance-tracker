# GPS Attendance Mobile Setup Script

Write-Host "📱 GPS Attendance Mobile Setup" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Check Node version
Write-Host "✓ Checking Node version..." -ForegroundColor Yellow
node -v

# Check if EAS CLI is installed
try {
    eas whoami > $null 2>&1
    Write-Host "✓ EAS CLI installed" -ForegroundColor Green
} catch {
    Write-Host "❌ EAS CLI not found. Installing..." -ForegroundColor Red
    npm install -g eas-cli
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install

# Check if logged into Expo
Write-Host "🔐 Checking Expo login..." -ForegroundColor Yellow
try {
    eas whoami
} catch {
    Write-Host "Please login to Expo..." -ForegroundColor Yellow
    eas login
}

# Prebuild
Write-Host "🏗️ Prebuilding native projects..." -ForegroundColor Yellow
npx expo prebuild --clean

# Show available build commands
Write-Host ""
Write-Host "✅ Setup complete! Available commands:" -ForegroundColor Green
Write-Host "--------------------------------------" -ForegroundColor Green
Write-Host "npm start                 - Start dev server" -ForegroundColor Cyan
Write-Host "npm run build:dev        - Build development APK" -ForegroundColor Cyan
Write-Host "npm run build:preview    - Build preview APK" -ForegroundColor Cyan
Write-Host "npm run build:ios-dev    - Build iOS development" -ForegroundColor Cyan
Write-Host ""
Write-Host "🚀 To build APK: npm run build:dev" -ForegroundColor Magenta
