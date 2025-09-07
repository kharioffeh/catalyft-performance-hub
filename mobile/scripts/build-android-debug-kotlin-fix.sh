#!/bin/bash

# Android Debug Kotlin Fix Build Script
# Uses debug build to avoid Kotlin compilation issues

set -e

echo "🚀 Starting Android Debug Kotlin Fix Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Copy Kotlin reflection fix gradle properties
echo "⚙️  Applying Kotlin reflection fix configuration..."
cp android/gradle-kotlin-reflection-fix.properties android/gradle.properties

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set Gradle memory options
export GRADLE_OPTS="-Xmx64m -XX:MaxMetaspaceSize=16m -XX:+UseG1GC -XX:+UseStringDeduplication"

# Build the APK with debug build (easier compilation)
echo "📱 Building Android APK (debug kotlin fix)..."
cd android

# Use gradlew with debug build
./gradlew assembleDebug \
  -Xmx64m \
  -XX:MaxMetaspaceSize=16m \
  -XX:+UseG1GC \
  -XX:+UseStringDeduplication \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android debug kotlin fix build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/debug/app-debug.apk"