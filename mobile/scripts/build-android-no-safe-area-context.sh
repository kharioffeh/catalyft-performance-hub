#!/bin/bash

# Android No-Safe-Area-Context Build Script
# Completely bypasses safe area context and other problematic modules

set -e

echo "🚀 Starting Android No-Safe-Area-Context Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create minimal app.json with no problematic modules
echo "⚙️  Creating no-safe-area-context configuration..."
cat > app-no-safe-area-context.json << 'EOF'
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

# Copy final minimum gradle properties
echo "⚙️  Applying final minimum configuration..."
cp android/gradle-final-minimum.properties android/gradle.properties

# Prebuild with no-safe-area-context configuration
echo "🔨 Running prebuild with no-safe-area-context configuration..."
npx expo prebuild --platform android --clean --config app-no-safe-area-context.json

# Set final minimum Gradle memory options
export GRADLE_OPTS="-Xmx64m -XX:MaxMetaspaceSize=16m -XX:+UseG1GC"

# Build the APK with no-safe-area-context approach
echo "📱 Building Android APK (no-safe-area-context)..."
cd android

# Use gradlew with final minimum memory
./gradlew assembleRelease \
  -Xmx64m \
  -XX:MaxMetaspaceSize=16m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android no-safe-area-context build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-no-safe-area-context.json