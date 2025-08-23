#!/bin/bash

echo "Setting up CI environment..."

# Export CI environment variables
export CI=true
export EXPO_NO_TELEMETRY=1
export EAS_NO_VCS=1

# Clean any existing native folders and caches
echo "Cleaning native folders and caches..."
rm -rf android ios
rm -rf node_modules/.cache
rm -rf $TMPDIR/react-* 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true

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
android.packagingOptions.pickFirst=**/libreanimated.so
android.packagingOptions.pickFirst=**/libworklets.so
expo.gif.enabled=false
expo.webp.enabled=false
expo.webp.animated=false
expo.useLegacyPackaging=false
expo.edgeToEdgeEnabled=false
EX_DEV_CLIENT_NETWORK_INSPECTOR=false
EOF
fi

# Fix react-native-voice Gradle issues if needed
if [ -f "scripts/check-voice-gradle.sh" ]; then
    ./scripts/check-voice-gradle.sh || true
else
    node scripts/fix-voice-gradle.js || true
fi

# Fix Android manifest merger issues
if [ -f "android/app/src/main/AndroidManifest.xml" ]; then
    echo "🔧 Fixing Android manifest merger issues..."
    node scripts/fix-android-manifest.js || true
fi

echo "CI prebuild complete!"