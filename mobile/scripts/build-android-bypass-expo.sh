#!/bin/bash

# Android Bypass Expo Build Script
# Completely bypasses problematic Expo modules

set -e

echo "🚀 Starting Android Bypass Expo Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create minimal app.json that bypasses problematic modules
echo "⚙️  Creating bypass configuration..."
cat > app-bypass.json << 'EOF'
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
            "kotlinVersion": "1.8.10"
          }
        }
      ]
    ]
  }
}
EOF

# Copy absolute minimum gradle properties
echo "⚙️  Applying absolute minimum configuration..."
cp android/gradle-absolute-minimum.properties android/gradle.properties

# Prebuild with bypass configuration
echo "🔨 Running prebuild with bypass configuration..."
npx expo prebuild --platform android --clean --config app-bypass.json

# Set absolute minimum Gradle memory options
export GRADLE_OPTS="-Xmx2048m -XX:MaxMetaspaceSize=512m -XX:+UseG1GC"

# Build the APK with bypass approach
echo "📱 Building Android APK (bypass expo)..."
cd android

# Use gradlew with absolute minimum memory
./gradlew assembleRelease \
  -Xmx2048m \
  -XX:MaxMetaspaceSize=512m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android bypass expo build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-bypass.json