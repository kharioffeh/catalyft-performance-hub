#!/bin/bash

# Android Production Build Script
# Handles memory requirements for large React Native projects

set -e

echo "🚀 Starting Android Production Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set Gradle memory options
export GRADLE_OPTS="-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+HeapDumpOnOutOfMemoryError"

# Build the APK
echo "📱 Building Android APK..."
cd android

# Use gradlew with conservative settings to avoid Kotlin compilation issues
./gradlew assembleRelease \
  -Xmx4096m \
  -XX:MaxMetaspaceSize=1024m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  -Dkotlin.compiler.execution.strategy=in-process

echo "✅ Android build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"