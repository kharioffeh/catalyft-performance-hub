#!/bin/bash

# Quick Build Script for Catalyft Mobile App

echo "🚀 Catalyft Mobile - Quick Build & Test"
echo "========================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}Installing EAS CLI...${NC}"
    npm install -g eas-cli
fi

# Check if logged in
echo -e "${BLUE}Checking Expo login...${NC}"
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}Please login to Expo:${NC}"
    eas login
fi

echo ""
echo -e "${GREEN}Choose your build option:${NC}"
echo ""
echo "1) 📱 Test on iPhone with Expo Go (FREE, INSTANT)"
echo "2) 🍎 Build iOS for TestFlight (Needs Apple Dev Account)"
echo "3) 🤖 Build Android APK (FREE)"
echo "4) 📦 Build BOTH iOS and Android"
echo "5) 🚀 Just start Expo Go for immediate testing"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo -e "${GREEN}Starting Expo Go...${NC}"
        echo ""
        echo "📱 To test on your iPhone:"
        echo "1. Install 'Expo Go' from the App Store"
        echo "2. Scan the QR code below with your camera"
        echo "3. Tap the notification to open in Expo Go"
        echo ""
        npx expo start
        ;;
    
    2)
        echo -e "${GREEN}Building iOS for TestFlight...${NC}"
        echo -e "${YELLOW}Note: Requires Apple Developer Account ($99/year)${NC}"
        eas build --platform ios --profile preview
        echo ""
        echo "✅ After build completes:"
        echo "1. Check your email for TestFlight invitation"
        echo "2. Install TestFlight app on your iPhone"
        echo "3. Accept invitation and install your app"
        ;;
    
    3)
        echo -e "${GREEN}Building Android APK...${NC}"
        eas build --platform android --profile preview
        echo ""
        echo "✅ After build completes (~15 minutes):"
        echo "1. Download the APK"
        echo "2. Transfer to Android device"
        echo "3. Enable 'Install from Unknown Sources'"
        echo "4. Install and test!"
        ;;
    
    4)
        echo -e "${GREEN}Building for both platforms...${NC}"
        eas build --platform all --profile preview
        echo ""
        echo "✅ Builds will run in parallel"
        echo "Android: ~15 minutes"
        echo "iOS: ~20 minutes"
        ;;
    
    5)
        echo -e "${GREEN}Starting Expo development server...${NC}"
        npx expo start --clear
        ;;
    
    *)
        echo -e "${YELLOW}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Build started successfully!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""
echo "Check build status: eas build:list"
echo "Download builds: eas build:download --platform [ios/android]"