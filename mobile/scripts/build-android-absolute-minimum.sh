#!/bin/bash

# Android Absolute Minimum Build Script
# Uses the absolute smallest possible memory allocation

set -e

echo "🚀 Starting Android Absolute Minimum Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Copy absolute minimum gradle properties
echo "⚙️  Applying absolute minimum configuration..."
cp android/gradle-absolute-minimum.properties android/gradle.properties

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set absolute minimum Gradle memory options
export GRADLE_OPTS="-Xmx256m -XX:MaxMetaspaceSize=64m -XX:+UseG1GC"

# Build the APK with absolute minimum memory
echo "📱 Building Android APK (absolute minimum)..."
cd android

# Use gradlew with absolute minimum memory
./gradlew assembleRelease \
  -Xmx256m \
  -XX:MaxMetaspaceSize=64m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android absolute minimum build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"