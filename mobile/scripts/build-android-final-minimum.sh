#!/bin/bash

# Android Final Minimum Build Script
# Uses the absolute smallest possible memory allocation

set -e

echo "🚀 Starting Android Final Minimum Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Copy final minimum gradle properties
echo "⚙️  Applying final minimum configuration..."
cp android/gradle-final-minimum.properties android/gradle.properties

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set final minimum Gradle memory options
export GRADLE_OPTS="-Xmx64m -XX:MaxMetaspaceSize=16m -XX:+UseG1GC"

# Build the APK with final minimum memory
echo "📱 Building Android APK (final minimum)..."
cd android

# Use gradlew with final minimum memory
./gradlew assembleRelease \
  -Xmx64m \
  -XX:MaxMetaspaceSize=16m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android final minimum build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"