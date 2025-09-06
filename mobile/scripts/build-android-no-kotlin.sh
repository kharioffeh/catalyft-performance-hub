#!/bin/bash

# Android No-Kotlin Build Script
# Bypasses Kotlin compilation issues by using minimal configuration

set -e

echo "🚀 Starting Android No-Kotlin Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create minimal app.json that avoids Kotlin-heavy modules
echo "⚙️  Creating minimal configuration..."
cat > app-no-kotlin.json << 'EOF'
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

# Copy Kotlin fix gradle properties
echo "⚙️  Applying Kotlin fix configuration..."
cp android/gradle-kotlin-fix.properties android/gradle.properties

# Prebuild with minimal configuration
echo "🔨 Running prebuild with minimal configuration..."
npx expo prebuild --platform android --clean --config app-no-kotlin.json

# Set Gradle memory options
export GRADLE_OPTS="-Xmx6144m -XX:MaxMetaspaceSize=1536m -XX:+UseG1GC -XX:+UseStringDeduplication"

# Build the APK with no-Kotlin approach
echo "📱 Building Android APK (no-Kotlin)..."
cd android

# Use gradlew with no-Kotlin settings
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

echo "✅ Android no-Kotlin build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-no-kotlin.json