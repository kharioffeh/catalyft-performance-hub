#!/bin/bash

# Android Ultimate Minimum Build Script
# Uses the absolute smallest possible memory allocation

set -e

echo "🚀 Starting Android Ultimate Minimum Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Copy ultimate minimum gradle properties
echo "⚙️  Applying ultimate minimum configuration..."
cp android/gradle-ultimate-minimum.properties android/gradle.properties

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set ultimate minimum Gradle memory options
export GRADLE_OPTS="-Xmx128m -XX:MaxMetaspaceSize=32m -XX:+UseG1GC"

# Build the APK with ultimate minimum memory
echo "📱 Building Android APK (ultimate minimum)..."
cd android

# Use gradlew with ultimate minimum memory
./gradlew assembleRelease \
  -Xmx128m \
  -XX:MaxMetaspaceSize=32m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android ultimate minimum build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"