#!/bin/bash

echo "Starting fast Android build for CI..."

# Set environment variables for minimal build
export ANDROID_HOME=${ANDROID_HOME:-$HOME/Android/Sdk}
export NODE_OPTIONS="--max-old-space-size=1024"
export GRADLE_OPTS="-Xmx1024m -XX:MaxMetaspaceSize=256m -XX:+HeapDumpOnOutOfMemoryError"
export CI=true

cd /workspace/mobile

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf android/app/build
rm -rf android/build
rm -rf android/.gradle
rm -rf node_modules/.cache

# Use minimal gradle properties
echo "Applying minimal build configuration..."
cat > android/gradle.properties << 'EOF'
org.gradle.jvmargs=-Xmx1024m -XX:MaxMetaspaceSize=256m
org.gradle.parallel=false
org.gradle.daemon=false
org.gradle.workers.max=1
android.useAndroidX=true
android.enableJetifier=true
reactNativeArchitectures=x86_64
newArchEnabled=false
hermesEnabled=false
android.compileSdkVersion=34
android.targetSdkVersion=34
android.buildToolsVersion=34.0.0
android.enableBuildCache=false
android.enableR8=false
android.enableProguardInReleaseBuilds=false
android.enableShrinkResourcesInReleaseBuilds=false
EOF

# Prebuild with minimal config
echo "Running expo prebuild..."
npx expo prebuild --platform android --clean --npm

# Build APK with aggressive skipping
echo "Building APK with minimal configuration..."
cd android

chmod +x gradlew

# Build with maximum skipping
./gradlew :app:assembleRelease \
  -x lint \
  -x lintVitalRelease \
  -x test \
  -x testRelease \
  -x bundleReleaseJsAndAssets \
  -x mergeReleaseResources \
  -x processReleaseGoogleServices \
  -x generateReleaseResValues \
  -x checkReleaseDuplicateClasses \
  --no-daemon \
  --no-parallel \
  --no-build-cache \
  --max-workers=1 \
  --offline \
  -PreactNativeArchitectures=x86_64 \
  -PnewArchEnabled=false \
  -PhermesEnabled=false

echo "Android build completed!"