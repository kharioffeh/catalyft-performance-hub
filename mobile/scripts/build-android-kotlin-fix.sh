#!/bin/bash

# Android Kotlin Fix Build Script
# Fixes Kotlin compilation reflection issues

set -e

echo "🚀 Starting Android Kotlin Fix Build..."

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

# Build the APK with Kotlin fix
echo "📱 Building Android APK (Kotlin fix)..."
cd android

# Use gradlew with Kotlin fix settings
./gradlew assembleRelease \
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

echo "✅ Android Kotlin fix build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"