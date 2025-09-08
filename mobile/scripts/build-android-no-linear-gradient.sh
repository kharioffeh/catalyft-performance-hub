#!/bin/bash

# Android No-Linear-Gradient Build Script
# Completely bypasses linear gradient and other problematic modules

set -e

echo "🚀 Starting Android No-Linear-Gradient Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create minimal app.json with no problematic modules
echo "⚙️  Creating no-linear-gradient configuration..."
cat > app-no-linear-gradient.json << 'EOF'
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

# Prebuild with no-linear-gradient configuration
echo "🔨 Running prebuild with no-linear-gradient configuration..."
npx expo prebuild --platform android --clean --config app-no-linear-gradient.json

# Set absolute final Gradle memory options
export GRADLE_OPTS="-Xmx32m -XX:MaxMetaspaceSize=8m -XX:+UseG1GC"

# Build the APK with no-linear-gradient approach
echo "📱 Building Android APK (no-linear-gradient)..."
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

echo "✅ Android no-linear-gradient build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-no-linear-gradient.json