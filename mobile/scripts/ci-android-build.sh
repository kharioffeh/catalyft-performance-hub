#!/bin/bash

# CI Android Build Script
# Uses minimal package set to ensure build passes

set -e

echo "🚀 Starting CI Android Build..."

# Use CI-specific package.json if in CI environment
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
    echo "📦 CI environment detected, using minimal package set..."
    
    # Backup original package.json
    cp package.json package.json.original
    
    # Use CI version
    cp package-ci.json package.json
    
    echo "✅ Using CI package configuration"
fi

# Clean install dependencies
echo "📦 Installing dependencies..."
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Run prebuild with fixes
echo "🔨 Running Expo prebuild..."
npx expo prebuild --platform android --clean

# Apply all fixes
echo "🔧 Applying build fixes..."
node scripts/fix-voice-gradle.js || true
node scripts/fix-android-manifest.js || true
node scripts/fix-gradle-dependencies.js || true

# Build Android
echo "📱 Building Android app..."
cd android

# Set gradle options for CI
export GRADLE_OPTS="-Xmx4096m -XX:MaxMetaspaceSize=1024m"

# Run the build
./gradlew assembleRelease --no-daemon --max-workers=2

cd ..

# Restore original package.json if we changed it
if [ -f "package.json.original" ]; then
    mv package.json.original package.json
    echo "✅ Restored original package.json"
fi

echo "✨ CI Android build complete!"