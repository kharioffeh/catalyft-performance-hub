#!/bin/bash

# Android Memory-Optimized Build Script
# Uses maximum memory allocation and reduced architectures

set -e

echo "🚀 Starting Android Memory-Optimized Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Copy memory-optimized gradle properties
echo "⚙️  Applying memory-optimized configuration..."
cp android/gradle-memory-optimized.properties android/gradle.properties

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set maximum Gradle memory options
export GRADLE_OPTS="-Xmx8192m -XX:MaxMetaspaceSize=2048m -XX:+HeapDumpOnOutOfMemoryError -XX:+UseG1GC -XX:+UseStringDeduplication"

# Build the APK with memory optimization
echo "📱 Building Android APK (memory-optimized)..."
cd android

# Use gradlew with maximum memory and single architecture
./gradlew assembleRelease \
  -Xmx8192m \
  -XX:MaxMetaspaceSize=2048m \
  -XX:+UseG1GC \
  -XX:+UseStringDeduplication \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a

echo "✅ Android memory-optimized build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"