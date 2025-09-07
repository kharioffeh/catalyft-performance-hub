#!/bin/bash

# Android No-Expo-Modules-At-All Build Script
# Builds without any Expo modules to avoid memory issues

set -e

echo "🚀 Starting Android No-Expo-Modules-At-All Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create minimal app.json with no Expo modules
echo "⚙️  Creating no-expo-modules-at-all configuration..."
cat > app-no-expo-modules-at-all.json << 'EOF'
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
    "plugins": []
  }
}
EOF

# Copy absolute final gradle properties
echo "⚙️  Applying absolute final configuration..."
cp android/gradle-absolute-final.properties android/gradle.properties

# Prebuild with no-expo-modules-at-all configuration
echo "🔨 Running prebuild with no-expo-modules-at-all configuration..."
npx expo prebuild --platform android --clean --config app-no-expo-modules-at-all.json

# Set absolute final Gradle memory options
export GRADLE_OPTS="-Xmx32m -XX:MaxMetaspaceSize=8m -XX:+UseG1GC"

# Build the APK with no-expo-modules-at-all approach
echo "📱 Building Android APK (no-expo-modules-at-all)..."
cd android

# Use gradlew with absolute final memory
./gradlew assembleRelease \
  -Xmx32m \
  -XX:MaxMetaspaceSize=8m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android no-expo-modules-at-all build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-no-expo-modules-at-all.json