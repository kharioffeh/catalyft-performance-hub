#!/bin/bash

# Android Ultra-Minimal Build Script
# Compiles with maximum memory and minimal features

set -e

echo "🚀 Starting Android Ultra-Minimal Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Copy ultra-minimal gradle properties
echo "⚙️  Applying ultra-minimal configuration..."
cp android/gradle-ultra-minimal.properties android/gradle.properties

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set maximum possible Gradle memory options
export GRADLE_OPTS="-Xmx16384m -XX:MaxMetaspaceSize=4096m -XX:+HeapDumpOnOutOfMemoryError -XX:+UseG1GC -XX:+UseStringDeduplication"

# Build the APK with ultra-minimal settings
echo "📱 Building Android APK (ultra-minimal)..."
cd android

# Use gradlew with maximum memory and single architecture
./gradlew assembleRelease \
  -Xmx16384m \
  -XX:MaxMetaspaceSize=4096m \
  -XX:+UseG1GC \
  -XX:+UseStringDeduplication \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1

echo "✅ Android ultra-minimal build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"