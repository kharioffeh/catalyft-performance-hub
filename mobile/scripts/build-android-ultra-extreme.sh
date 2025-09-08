#!/bin/bash

# Android Ultra Extreme Build Script
# Uses the absolute smallest possible memory allocation

set -e

echo "🚀 Starting Android Ultra Extreme Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Copy ultra extreme gradle properties
echo "⚙️  Applying ultra extreme configuration..."
cp android/gradle-ultra-extreme.properties android/gradle.properties

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set ultra extreme Gradle memory options
export GRADLE_OPTS="-Xmx512m -XX:MaxMetaspaceSize=128m -XX:+UseG1GC"

# Build the APK with ultra extreme memory
echo "📱 Building Android APK (ultra extreme)..."
cd android

# Use gradlew with ultra extreme memory
./gradlew assembleRelease \
  -Xmx512m \
  -XX:MaxMetaspaceSize=128m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android ultra extreme build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"