#!/bin/bash

# Android No-Kotlin-Compilation Build Script
# Bypasses Kotlin compilation issues by using minimal configuration

set -e

echo "🚀 Starting Android No-Kotlin-Compilation Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create a pure React Native app.json
echo "⚙️  Creating no-kotlin-compilation configuration..."
cat > app-no-kotlin-compilation.json << 'EOF'
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

# Copy Kotlin reflection fix gradle properties
echo "⚙️  Applying Kotlin reflection fix configuration..."
cp android/gradle-kotlin-reflection-fix.properties android/gradle.properties

# Prebuild with no-kotlin-compilation configuration
echo "🔨 Running prebuild with no-kotlin-compilation configuration..."
npx expo prebuild --platform android --clean --config app-no-kotlin-compilation.json

# Set Gradle memory options
export GRADLE_OPTS="-Xmx64m -XX:MaxMetaspaceSize=16m -XX:+UseG1GC -XX:+UseStringDeduplication"

# Build the APK with no-kotlin-compilation approach
echo "📱 Building Android APK (no-kotlin-compilation)..."
cd android

# Use gradlew with no-kotlin-compilation settings
./gradlew assembleRelease \
  -Xmx64m \
  -XX:MaxMetaspaceSize=16m \
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

echo "✅ Android no-kotlin-compilation build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-no-kotlin-compilation.json