#!/bin/bash

# Android Absolute Final Build Script
# Uses the absolute smallest possible memory allocation

set -e

echo "🚀 Starting Android Absolute Final Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Copy absolute final gradle properties
echo "⚙️  Applying absolute final configuration..."
cp android/gradle-absolute-final.properties android/gradle.properties

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set absolute final Gradle memory options
export GRADLE_OPTS="-Xmx32m -XX:MaxMetaspaceSize=8m -XX:+UseG1GC"

# Build the APK with absolute final memory
echo "📱 Building Android APK (absolute final)..."
cd android

# Use gradlew with absolute final memory
./gradlew assembleRelease \
  -Xmx32m \
  -XX:MaxMetaspaceSize=8m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android absolute final build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"