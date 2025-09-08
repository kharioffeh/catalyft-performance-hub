#!/bin/bash

# Android Kotlin Reflection Fix Build Script
# Fixes Kotlin compilation reflection issues

set -e

echo "🚀 Starting Android Kotlin Reflection Fix Build..."

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

# Build the APK with Kotlin reflection fix
echo "📱 Building Android APK (Kotlin reflection fix)..."
cd android

# Use gradlew with Kotlin reflection fix settings
./gradlew assembleRelease \
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

echo "✅ Android Kotlin reflection fix build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"