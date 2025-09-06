#!/bin/bash

# Android Extreme Minimum Build Script
# Uses the absolute smallest possible memory allocation

set -e

echo "🚀 Starting Android Extreme Minimum Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Copy extreme minimum gradle properties
echo "⚙️  Applying extreme minimum configuration..."
cp android/gradle-extreme-minimum.properties android/gradle.properties

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set extreme minimum Gradle memory options
export GRADLE_OPTS="-Xmx1024m -XX:MaxMetaspaceSize=256m -XX:+UseG1GC"

# Build the APK with extreme minimum memory
echo "📱 Building Android APK (extreme minimum)..."
cd android

# Use gradlew with extreme minimum memory
./gradlew assembleRelease \
  -Xmx1024m \
  -XX:MaxMetaspaceSize=256m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android extreme minimum build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"