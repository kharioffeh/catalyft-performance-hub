#!/bin/bash

echo "Setting up CI environment..."

# Export CI environment variables
export CI=true
export EXPO_NO_TELEMETRY=1
export EAS_NO_VCS=1

# Clean any existing native folders
echo "Cleaning native folders..."
rm -rf android ios

# Run prebuild with explicit configuration
echo "Running prebuild..."
npx expo prebuild --clean --npm

# Fix Android gradle.properties for CI
if [ -f android/gradle.properties ]; then
  echo "Fixing Android gradle.properties for CI..."
  cat > android/gradle.properties << 'EOF'
# CI BUILD CONFIGURATION
org.gradle.jvmargs=-Xmx1024m -XX:MaxMetaspaceSize=256m
org.gradle.parallel=false
org.gradle.daemon=false
org.gradle.workers.max=1
android.useAndroidX=true
android.enableJetifier=true
reactNativeArchitectures=x86_64
newArchEnabled=false
hermesEnabled=false
android.compileSdkVersion=35
android.targetSdkVersion=35
android.buildToolsVersion=35.0.0
android.enableR8=false
android.enableBuildCache=false
android.lintOptions.abortOnError=false
android.lintOptions.checkReleaseBuilds=false
android.enableProguardInReleaseBuilds=false
android.enableShrinkResourcesInReleaseBuilds=false
org.gradle.caching=false
kotlin.incremental=false
android.enablePngCrunchInReleaseBuilds=false
android.packagingOptions.pickFirsts=**/libc++_shared.so,**/libjsc.so
android.packagingOptions.excludes=META-INF/DEPENDENCIES
expo.gif.enabled=false
expo.webp.enabled=false
expo.webp.animated=false
expo.useLegacyPackaging=false
expo.edgeToEdgeEnabled=false
EX_DEV_CLIENT_NETWORK_INSPECTOR=false
EOF
fi

echo "CI prebuild complete!"