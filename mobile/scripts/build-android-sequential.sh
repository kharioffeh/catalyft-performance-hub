#!/bin/bash

# Android Sequential Build Script
# Compiles modules one at a time to avoid memory issues

set -e

echo "🚀 Starting Android Sequential Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Copy micro gradle properties
echo "⚙️  Applying micro configuration..."
cp android/gradle-micro.properties android/gradle.properties

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set minimal Gradle memory options
export GRADLE_OPTS="-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+UseG1GC -XX:+UseStringDeduplication"

# Build the APK with sequential compilation
echo "📱 Building Android APK (sequential)..."
cd android

# Use gradlew with minimal memory and sequential compilation
./gradlew assembleRelease \
  -Xmx4096m \
  -XX:MaxMetaspaceSize=1024m \
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

echo "✅ Android sequential build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"