#!/bin/bash

# Android Essential-Only Build Script
# Builds only the core app without optional Expo modules

set -e

echo "🚀 Starting Android Essential-Only Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create minimal app.json for build
echo "⚙️  Creating minimal app configuration..."
cat > app-minimal.json << 'EOF'
{
  "expo": {
    "name": "Catalyft",
    "slug": "catalyft-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "scheme": "catalyft",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.catalyft.mobile",
      "deploymentTarget": "15.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.catalyft.mobile"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "plugins": [
      [
        "expo-build-properties",
        {
          "android": {
            "compileSdkVersion": 34,
            "targetSdkVersion": 34,
            "minSdkVersion": 23,
            "gradleVersion": "8.4",
            "buildToolsVersion": "34.0.0",
            "kotlinVersion": "1.7.10"
          }
        }
      ]
    ]
  }
}
EOF

# Copy ultra-minimal gradle properties
echo "⚙️  Applying ultra-minimal configuration..."
cp android/gradle-ultra-minimal.properties android/gradle.properties

# Prebuild with minimal configuration
echo "🔨 Running prebuild with minimal configuration..."
npx expo prebuild --platform android --clean --config app-minimal.json

# Set maximum possible Gradle memory options
export GRADLE_OPTS="-Xmx16384m -XX:MaxMetaspaceSize=4096m -XX:+HeapDumpOnOutOfMemoryError -XX:+UseG1GC -XX:+UseStringDeduplication"

# Build the APK with essential-only settings
echo "📱 Building Android APK (essential-only)..."
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

echo "✅ Android essential-only build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-minimal.json