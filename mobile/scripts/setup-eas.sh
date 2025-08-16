#!/bin/bash

# EAS Build Setup Script
# This script helps you set up and run EAS Build for immediate deployment

set -e

echo "🚀 EAS Build Setup for Immediate Deployment"
echo "==========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if EAS CLI is installed
if ! command -v eas &> /dev/null; then
    print_warning "EAS CLI not found. Installing..."
    npm install -g eas-cli
    print_success "EAS CLI installed!"
else
    print_success "EAS CLI is already installed"
fi

# Check if user is logged in to Expo
print_info "Checking Expo login status..."
if ! eas whoami &> /dev/null; then
    print_warning "Not logged in to Expo. Please log in:"
    eas login
else
    EXPO_USER=$(eas whoami)
    print_success "Logged in as: $EXPO_USER"
    
    # Update app.json with the correct owner
    print_info "Updating app.json with your Expo username..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sed -i '' "s/\"owner\": \"your-expo-username\"/\"owner\": \"$EXPO_USER\"/" app.json
    else
        sed -i "s/\"owner\": \"your-expo-username\"/\"owner\": \"$EXPO_USER\"/" app.json
    fi
fi

# Configure the project
print_info "Configuring EAS project..."
eas build:configure -p all --non-interactive || true

echo ""
echo "==========================================="
echo "📱 QUICK BUILD COMMANDS"
echo "==========================================="
echo ""

echo -e "${GREEN}For Testing (APK for Android):${NC}"
echo "  eas build --platform android --profile preview"
echo ""

echo -e "${GREEN}For iOS Testing (requires Apple Developer account):${NC}"
echo "  eas build --platform ios --profile preview"
echo ""

echo -e "${GREEN}For Both Platforms:${NC}"
echo "  eas build --platform all --profile preview"
echo ""

echo -e "${BLUE}For Production (App Bundle for Google Play):${NC}"
echo "  eas build --platform android --profile production"
echo ""

echo -e "${BLUE}For Production (iOS App Store):${NC}"
echo "  eas build --platform ios --profile production"
echo ""

echo "==========================================="
echo ""

# Ask user what they want to build
echo "What would you like to build now?"
echo "1) Android APK (for testing)"
echo "2) iOS (requires Apple Developer account)"
echo "3) Both platforms"
echo "4) Skip for now"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        print_info "Starting Android build..."
        eas build --platform android --profile preview
        ;;
    2)
        print_info "Starting iOS build..."
        print_warning "Note: This requires an Apple Developer account ($99/year)"
        eas build --platform ios --profile preview
        ;;
    3)
        print_info "Starting builds for both platforms..."
        print_warning "Note: iOS requires an Apple Developer account ($99/year)"
        eas build --platform all --profile preview
        ;;
    4)
        print_info "Skipping build for now."
        echo ""
        echo "You can run builds later using the commands shown above."
        ;;
    *)
        print_error "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "==========================================="
echo "📝 NEXT STEPS"
echo "==========================================="
echo ""
echo "1. Once build completes, you'll get a download link"
echo "2. Download the APK/IPA file"
echo "3. For Android: Install directly on device or upload to Play Store"
echo "4. For iOS: Use Transporter app to upload to App Store Connect"
echo ""
echo "To check build status:"
echo "  eas build:list"
echo ""
echo "To download latest build:"
echo "  eas build:download --platform android"
echo "  eas build:download --platform ios"
echo ""
print_success "EAS Build setup complete!"