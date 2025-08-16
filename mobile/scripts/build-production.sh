#!/bin/bash

# Production Build Script
# This script builds production-ready versions of the app

set -e

echo "🚀 Starting Production Build Process"
echo "===================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the mobile directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the mobile directory"
    exit 1
fi

# Parse arguments
BUILD_ANDROID=false
BUILD_IOS=false
SKIP_PREBUILD=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --android)
            BUILD_ANDROID=true
            shift
            ;;
        --ios)
            BUILD_IOS=true
            shift
            ;;
        --skip-prebuild)
            SKIP_PREBUILD=true
            shift
            ;;
        --all)
            BUILD_ANDROID=true
            BUILD_IOS=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: $0 [--android] [--ios] [--all] [--skip-prebuild]"
            exit 1
            ;;
    esac
done

# Default to building both if no platform specified
if [ "$BUILD_ANDROID" = false ] && [ "$BUILD_IOS" = false ]; then
    BUILD_ANDROID=true
    BUILD_IOS=true
fi

# Install dependencies
print_status "Installing dependencies..."
npm install --legacy-peer-deps

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist android/app/build ios/build

# Run prebuild unless skipped
if [ "$SKIP_PREBUILD" = false ]; then
    if [ "$BUILD_ANDROID" = true ]; then
        print_status "Running Android prebuild..."
        CI=1 npx expo prebuild --platform android --clean
    fi
    
    if [ "$BUILD_IOS" = true ]; then
        print_status "Running iOS prebuild..."
        CI=1 npx expo prebuild --platform ios --clean
    fi
fi

# Build Android
if [ "$BUILD_ANDROID" = true ]; then
    print_status "Building Android production APK..."
    cd android
    chmod +x gradlew
    
    # Build release APK
    ./gradlew :app:assembleRelease -x test -x lint --no-daemon
    
    # Check if build succeeded
    if [ -f "app/build/outputs/apk/release/app-release.apk" ]; then
        print_status "Android APK built successfully!"
        echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"
        
        # Get APK size
        APK_SIZE=$(du -h app/build/outputs/apk/release/app-release.apk | cut -f1)
        echo "📏 APK size: $APK_SIZE"
    else
        print_error "Android build failed!"
        exit 1
    fi
    
    cd ..
fi

# Build iOS
if [ "$BUILD_IOS" = true ]; then
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_warning "iOS builds can only be created on macOS. Skipping iOS build."
    else
        print_status "Building iOS production archive..."
        cd ios
        
        # Install pods
        print_status "Installing CocoaPods..."
        pod install
        
        # Find workspace and scheme
        WORKSPACE=$(ls -1 *.xcworkspace | head -1)
        SCHEME=$(xcodebuild -list -json -workspace "$WORKSPACE" | /usr/bin/python3 -c 'import sys,json; print(json.load(sys.stdin)["workspace"]["schemes"][0])')
        
        print_status "Building with workspace: $WORKSPACE, scheme: $SCHEME"
        
        # Build for release
        xcodebuild -workspace "$WORKSPACE" \
            -scheme "$SCHEME" \
            -configuration Release \
            -sdk iphoneos \
            -derivedDataPath build \
            -archivePath build/Release.xcarchive \
            archive \
            CODE_SIGNING_ALLOWED=NO \
            CODE_SIGNING_REQUIRED=NO
        
        if [ -d "build/Release.xcarchive" ]; then
            print_status "iOS archive built successfully!"
            echo "📦 Archive location: ios/build/Release.xcarchive"
            print_warning "Note: You'll need to sign and export this archive for distribution"
        else
            print_error "iOS build failed!"
            exit 1
        fi
        
        cd ..
    fi
fi

# Create Expo production build (for OTA updates)
print_status "Creating Expo production bundle..."
npx expo export --platform all --output-dir ./dist

echo ""
echo "======================================"
print_status "Production build completed!"
echo ""
echo "Next steps:"
echo "1. For Android: Sign the APK with your release keystore"
echo "2. For iOS: Open the archive in Xcode to sign and export"
echo "3. Test the builds on real devices"
echo "4. Upload to respective app stores"
echo ""
print_warning "Remember to test thoroughly before releasing to production!"