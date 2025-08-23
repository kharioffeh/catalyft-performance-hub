@echo off
echo ============================================
echo   Catalyft iOS/Apple Watch Setup (Windows)
echo ============================================
echo.

echo [1/6] Installing Expo CLI and EAS CLI...
call npm install -g expo-cli eas-cli

echo.
echo [2/6] Installing project dependencies...
cd /d "%~dp0\.."
call npm install --legacy-peer-deps

echo.
echo [3/6] Installing iOS-specific packages...
call npm install react-native-health react-native-permissions --save --legacy-peer-deps

echo.
echo [4/6] Logging into Expo/EAS...
echo Please login with your Expo account (create one free at expo.dev)
call eas login

echo.
echo [5/6] Configuring iOS build...
call eas build:configure

echo.
echo ============================================
echo   Setup Complete! Next Steps:
echo ============================================
echo.
echo 1. Get an Apple Developer Account ($99/year)
echo    https://developer.apple.com/programs/
echo.
echo 2. Configure your Apple credentials:
echo    eas credentials
echo.
echo 3. Build for iOS (runs in cloud):
echo    eas build --platform ios --profile development
echo.
echo 4. Download the .ipa file when ready
echo.
echo 5. Install on iPhone using:
echo    - Apple Configurator 2 (from another Mac)
echo    - Or upload to TestFlight
echo.
echo ============================================
echo   Alternative: Use a Mac in Cloud
echo ============================================
echo.
echo Services that provide Mac access:
echo - MacStadium: $79/month
echo - MacInCloud: $20/month
echo - AWS EC2 Mac: $25/day
echo.
pause