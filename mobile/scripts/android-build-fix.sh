#!/bin/bash

echo "Applying Android build fixes..."

# Clean Android build cache
echo "Cleaning Android build cache..."
cd android 2>/dev/null && {
  ./gradlew clean 2>/dev/null || true
  rm -rf .gradle
  rm -rf app/build
  rm -rf build
  cd ..
}

# Clean Reanimated build cache
echo "Cleaning Reanimated cache..."
rm -rf node_modules/react-native-reanimated/android/.cxx
rm -rf node_modules/react-native-reanimated/android/build

# Set environment variables for build
export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/25.1.8937393
export CMAKE_VERSION=3.22.1

echo "Android build fixes applied!"