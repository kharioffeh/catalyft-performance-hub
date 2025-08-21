#!/bin/bash

echo "Fixing Android build for CI/CD..."

# Use CI-optimized gradle properties if in CI
if [ "$CI" = "true" ] || [ "$GITHUB_ACTIONS" = "true" ]; then
  echo "CI environment detected, using optimized gradle properties..."
  cp android/gradle-ci.properties android/gradle.properties
fi

# Clear gradle caches
echo "Clearing gradle caches..."
cd android
rm -rf .gradle build app/build
cd ..

# Ensure proper permissions
chmod +x android/gradlew

# Apply patches
echo "Applying patches..."
npx patch-package

echo "Android CI build fixes applied!"