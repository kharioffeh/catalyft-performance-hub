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

# Set Gradle memory options - Maximum allocation
export GRADLE_OPTS="-Xmx8192m -XX:MaxMetaspaceSize=2048m -XX:+HeapDumpOnOutOfMemoryError -XX:+UseG1GC"

# Build the APK
echo "📱 Building Android APK..."
cd android

# Use gradlew with maximum memory allocation to handle Kotlin compilation
./gradlew assembleRelease \
  -Xmx8192m \
  -XX:MaxMetaspaceSize=2048m \
  -XX:+UseG1GC \
  -XX:+UseStringDeduplication \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  -Dkotlin.compiler.execution.strategy=in-process

echo "✅ Android build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"