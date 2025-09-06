#!/bin/bash

# Android No-Problematic-Modules Build Script
# Completely bypasses all problematic modules

set -e

echo "🚀 Starting Android No-Problematic-Modules Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create minimal app.json with no problematic modules
echo "⚙️  Creating no-problematic-modules configuration..."
cat > app-no-problematic-modules.json << 'EOF'
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

# Copy absolute minimum gradle properties
echo "⚙️  Applying absolute minimum configuration..."
cp android/gradle-absolute-minimum.properties android/gradle.properties

# Prebuild with no-problematic-modules configuration
echo "🔨 Running prebuild with no-problematic-modules configuration..."
npx expo prebuild --platform android --clean --config app-no-problematic-modules.json

# Set absolute minimum Gradle memory options
export GRADLE_OPTS="-Xmx256m -XX:MaxMetaspaceSize=64m -XX:+UseG1GC"

# Build the APK with no-problematic-modules approach
echo "📱 Building Android APK (no-problematic-modules)..."
cd android

# Use gradlew with absolute minimum memory
./gradlew assembleRelease \
  -Xmx256m \
  -XX:MaxMetaspaceSize=64m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android no-problematic-modules build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-no-problematic-modules.json