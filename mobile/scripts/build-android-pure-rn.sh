#!/bin/bash

# Android Pure React Native Build Script
# Bypasses Expo completely to avoid memory issues

set -e

echo "🚀 Starting Android Pure React Native Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create a pure React Native app.json
echo "⚙️  Creating pure React Native configuration..."
cat > app-pure-rn.json << 'EOF'
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

# Copy micro gradle properties
echo "⚙️  Applying micro configuration..."
cp android/gradle-micro.properties android/gradle.properties

# Prebuild with pure React Native configuration
echo "🔨 Running prebuild with pure React Native configuration..."
npx expo prebuild --platform android --clean --config app-pure-rn.json

# Set minimal Gradle memory options
export GRADLE_OPTS="-Xmx4096m -XX:MaxMetaspaceSize=1024m -XX:+UseG1GC -XX:+UseStringDeduplication"

# Build the APK with pure React Native
echo "📱 Building Android APK (pure React Native)..."
cd android

# Use gradlew with minimal memory and single worker
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

echo "✅ Android pure React Native build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-pure-rn.json