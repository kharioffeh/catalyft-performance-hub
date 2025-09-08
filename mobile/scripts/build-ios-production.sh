#!/bin/bash

# iOS Production Build Script
# Builds iOS app for production testing

set -e

echo "🚀 Starting iOS Production Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf ios
rm -rf .expo

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform ios --clean

# Build the iOS app
echo "📱 Building iOS app..."
npx expo run:ios --configuration Release

echo "✅ iOS production build completed successfully!"
echo "📦 App location: ios/build/Build/Products/Release-iphoneos/Catalyft.app"