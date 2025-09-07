#!/bin/bash

# Android Fallback Build Script
# Uses the most conservative approach possible

set -e

echo "🚀 Starting Android Fallback Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create fallback gradle properties with maximum memory
echo "⚙️  Creating fallback configuration..."
cat > android/gradle.properties << 'EOF'
# Fallback Gradle configuration - Maximum memory allocation
org.gradle.jvmargs=-Xmx20480m -XX:MaxMetaspaceSize=5120m -XX:+HeapDumpOnOutOfMemoryError -XX:+UseG1GC -Dkotlin.compiler.execution.strategy=in-process -XX:+UseStringDeduplication -XX:+UnlockExperimentalVMOptions -XX:+UseCGroupMemoryLimitForHeap -XX:MaxDirectMemorySize=2g

# Disable everything
org.gradle.parallel=false
org.gradle.daemon=false
org.gradle.configureondemand=false
org.gradle.caching=false

# Kotlin settings
kotlin.compiler.execution.strategy=in-process
kotlin.incremental=false
kotlin.incremental.useClasspathSnapshot=false
kotlin.incremental.android=false

# Android settings
android.useAndroidX=true
android.enableJetifier=true

# Single architecture
reactNativeArchitectures=arm64-v8a

# Disable everything
android.enablePngCrunchInReleaseBuilds=false
android.enableShrinkResourcesInReleaseBuilds=false
expo.gif.enabled=false
expo.webp.enabled=false
expo.webp.animated=false
EX_DEV_CLIENT_NETWORK_INSPECTOR=false

# Kotlin version
kotlin.version=1.7.10
kotlin.compiler.version=1.7.10
kotlin.stdlib.version=1.7.10
android.kotlinVersion=1.7.10

# Android settings
android.minSdkVersion=23
android.compileSdkVersion=34
android.targetSdkVersion=34
android.buildToolsVersion=34.0.0

# Disable everything
newArchEnabled=false
hermesEnabled=true
android.enableR8.fullMode=false
android.enableD8.desugaring=false
EOF

# Prebuild with clean
echo "🔨 Running prebuild..."
npx expo prebuild --platform android --clean

# Set maximum possible Gradle memory options
export GRADLE_OPTS="-Xmx20480m -XX:MaxMetaspaceSize=5120m -XX:+HeapDumpOnOutOfMemoryError -XX:+UseG1GC -XX:+UseStringDeduplication"

# Build the APK with fallback settings
echo "📱 Building Android APK (fallback)..."
cd android

# Use gradlew with maximum memory and single worker
./gradlew assembleRelease \
  -Xmx20480m \
  -XX:MaxMetaspaceSize=5120m \
  -XX:+UseG1GC \
  -XX:+UseStringDeduplication \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --stacktrace

echo "✅ Android fallback build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"