#!/bin/bash

# Android No-Gesture-Handler Build Script
# Completely bypasses gesture handler and other problematic modules

set -e

echo "🚀 Starting Android No-Gesture-Handler Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create minimal app.json with no problematic modules
echo "⚙️  Creating no-gesture-handler configuration..."
cat > app-no-gesture-handler.json << 'EOF'
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

# Copy ultimate minimum gradle properties
echo "⚙️  Applying ultimate minimum configuration..."
cp android/gradle-ultimate-minimum.properties android/gradle.properties

# Prebuild with no-gesture-handler configuration
echo "🔨 Running prebuild with no-gesture-handler configuration..."
npx expo prebuild --platform android --clean --config app-no-gesture-handler.json

# Set ultimate minimum Gradle memory options
export GRADLE_OPTS="-Xmx128m -XX:MaxMetaspaceSize=32m -XX:+UseG1GC"

# Build the APK with no-gesture-handler approach
echo "📱 Building Android APK (no-gesture-handler)..."
cd android

# Use gradlew with ultimate minimum memory
./gradlew assembleRelease \
  -Xmx128m \
  -XX:MaxMetaspaceSize=32m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android no-gesture-handler build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-no-gesture-handler.json