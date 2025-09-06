#!/bin/bash

# Android No-Native-At-All Build Script
# Builds without any native modules to avoid memory issues

set -e

echo "🚀 Starting Android No-Native-At-All Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create minimal app.json with no native modules
echo "⚙️  Creating no-native-at-all configuration..."
cat > app-no-native-at-all.json << 'EOF'
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

# Prebuild with no-native-at-all configuration
echo "🔨 Running prebuild with no-native-at-all configuration..."
npx expo prebuild --platform android --clean --config app-no-native-at-all.json

# Set ultra extreme Gradle memory options
export GRADLE_OPTS="-Xmx512m -XX:MaxMetaspaceSize=128m -XX:+UseG1GC"

# Build the APK with no-native-at-all approach
echo "📱 Building Android APK (no-native-at-all)..."
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

echo "✅ Android no-native-at-all build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-no-native-at-all.json