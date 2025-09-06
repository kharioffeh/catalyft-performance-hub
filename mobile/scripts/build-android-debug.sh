#!/bin/bash

# Android Debug Build Script
# Uses debug build to avoid Kotlin compilation issues

set -e

echo "🚀 Starting Android Debug Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Copy Kotlin fix gradle properties
echo "⚙️  Applying Kotlin fix configuration..."
cp android/gradle-kotlin-fix.properties android/gradle.properties

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set Gradle memory options
export GRADLE_OPTS="-Xmx6144m -XX:MaxMetaspaceSize=1536m -XX:+UseG1GC -XX:+UseStringDeduplication"

# Build the APK with debug build (easier compilation)
echo "📱 Building Android APK (debug)..."
cd android

# Use gradlew with debug build
./gradlew assembleDebug \
  -Xmx6144m \
  -XX:MaxMetaspaceSize=1536m \
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

echo "✅ Android debug build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/debug/app-debug.apk"