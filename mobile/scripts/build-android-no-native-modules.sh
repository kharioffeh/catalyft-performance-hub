#!/bin/bash

# Android No-Native-Modules Build Script
# Builds without any native modules to avoid memory issues

set -e

echo "🚀 Starting Android No-Native-Modules Build..."

# Set environment variables
export ANDROID_HOME=/usr/lib/android-sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Clean previous builds
echo "🧹 Cleaning previous builds..."
cd /workspace/mobile
rm -rf android
rm -rf .expo

# Create minimal app.json with no native modules
echo "⚙️  Creating no-native-modules configuration..."
cat > app-no-native-modules.json << 'EOF'
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

# Create minimal gradle properties for no native modules
echo "⚙️  Creating no-native-modules gradle properties..."
cat > android/gradle.properties << 'EOF'
# No Native Modules Gradle configuration
# Minimal memory allocation for no native modules

# Minimal memory allocation
org.gradle.jvmargs=-Xmx256m -XX:MaxMetaspaceSize=64m -XX:+UseG1GC

# Disable everything that uses memory
org.gradle.parallel=false
org.gradle.daemon=false
org.gradle.configureondemand=false
org.gradle.caching=false

# Android settings
android.useAndroidX=true
android.enableJetifier=true

# Single architecture only
reactNativeArchitectures=arm64-v8a

# Disable unnecessary features
android.enablePngCrunchInReleaseBuilds=false
android.enableShrinkResourcesInReleaseBuilds=false

# Use stable Kotlin version
kotlin.version=1.7.10
kotlin.compiler.version=1.7.10
kotlin.stdlib.version=1.7.10
android.kotlinVersion=1.7.10

# Android build settings
android.minSdkVersion=23
android.compileSdkVersion=34
android.targetSdkVersion=34
android.buildToolsVersion=34.0.0

# Disable new architecture
newArchEnabled=false
hermesEnabled=true

# Disable R8 to save memory
android.enableR8.fullMode=false
android.enableD8.desugaring=false
android.enableProguardInReleaseBuilds=false
android.enableR8=false
android.enableD8=false
EOF

# Prebuild with no-native-modules configuration
echo "🔨 Running prebuild with no-native-modules configuration..."
npx expo prebuild --platform android --clean --config app-no-native-modules.json

# Set Gradle memory options
export GRADLE_OPTS="-Xmx256m -XX:MaxMetaspaceSize=64m -XX:+UseG1GC"

# Build the APK with no-native-modules approach
echo "📱 Building Android APK (no-native-modules)..."
cd android

# Use gradlew with no-native-modules settings
./gradlew assembleRelease \
  -Xmx256m \
  -XX:MaxMetaspaceSize=64m \
  -XX:+UseG1GC \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --no-configuration-cache \
  -PreactNativeArchitectures=arm64-v8a \
  --max-workers=1 \
  --continue

echo "✅ Android no-native-modules build completed successfully!"
echo "📦 APK location: android/app/build/outputs/apk/release/app-release.apk"

# Clean up
rm -f app-no-native-modules.json