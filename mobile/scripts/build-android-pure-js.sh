#!/bin/bash

# Android Pure JavaScript Build Script
# Builds without any native modules to avoid memory issues

set -e

echo "🚀 Starting Android Pure JavaScript Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create minimal app.json with no native modules
echo "⚙️  Creating pure-js configuration..."
cat > app-pure-js.json << 'EOF'
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

# Copy extreme minimum gradle properties
echo "⚙️  Applying extreme minimum configuration..."
cp android/gradle-extreme-minimum.properties android/gradle.properties

# Prebuild with pure-js configuration
echo "🔨 Running prebuild with pure-js configuration..."
npx expo prebuild --platform android --clean --config app-pure-js.json

# Set extreme minimum Gradle memory options
export GRADLE_OPTS="-Xmx1024m -XX:MaxMetaspaceSize=256m -XX:+UseG1GC"

# Build the APK with pure-js approach
echo "📱 Building Android APK (pure-js)..."
cd android

# Use gradlew with extreme minimum memory
./gradlew assembleRelease \
  -Xmx1024m \
  -XX:MaxMetaspaceSize=256m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -Dkotlin.compiler.execution.strategy=in-process \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android pure-js build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-pure-js.json