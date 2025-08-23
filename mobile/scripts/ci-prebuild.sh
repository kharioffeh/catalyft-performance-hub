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

# Apply all Android fixes
if [ -f "scripts/fix-android-all.sh" ]; then
    echo "🔧 Applying all Android fixes..."
    chmod +x scripts/fix-android-all.sh
    ./scripts/fix-android-all.sh
else
    # Fallback to individual fixes
    node scripts/fix-voice-gradle.js || true
    node scripts/fix-android-manifest.js || true
    node scripts/fix-gradle-dependencies.js || true
    node scripts/fix-kotlin-version.js || true
    node scripts/fix-expo-plugin.js || true
fi

echo "CI prebuild complete!"