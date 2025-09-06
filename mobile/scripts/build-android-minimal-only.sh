#!/bin/bash

# Android Minimal Only Build Script
# Completely bypasses all problematic modules

set -e

echo "🚀 Starting Android Minimal Only Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create minimal app.json with no problematic modules
echo "⚙️  Creating minimal-only configuration..."
cat > app-minimal-only.json << 'EOF'
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

# Copy ultra extreme gradle properties
echo "⚙️  Applying ultra extreme configuration..."
cp android/gradle-ultra-extreme.properties android/gradle.properties

# Prebuild with minimal-only configuration
echo "🔨 Running prebuild with minimal-only configuration..."
npx expo prebuild --platform android --clean --config app-minimal-only.json

# Set ultra extreme Gradle memory options
export GRADLE_OPTS="-Xmx512m -XX:MaxMetaspaceSize=128m -XX:+UseG1GC"

# Build the APK with minimal-only approach
echo "📱 Building Android APK (minimal-only)..."
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

echo "✅ Android minimal-only build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-minimal-only.json