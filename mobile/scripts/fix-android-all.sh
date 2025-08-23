#!/bin/bash

# Comprehensive Android Fix Script
# Applies all fixes in the correct order

set -e

echo "🚀 Applying all Android fixes..."
echo ""

# 1. Fix voice package Gradle issues
if [ -f "scripts/fix-voice-gradle.js" ]; then
    echo "1️⃣ Fixing react-native-voice Gradle..."
    node scripts/fix-voice-gradle.js || true
    echo ""
fi

# 2. Fix Android manifest
if [ -f "scripts/fix-android-manifest.js" ]; then
    echo "2️⃣ Fixing Android manifest..."
    node scripts/fix-android-manifest.js || true
    echo ""
fi

# 3. Fix Gradle dependencies
if [ -f "scripts/fix-gradle-dependencies.js" ]; then
    echo "3️⃣ Fixing Gradle dependencies..."
    node scripts/fix-gradle-dependencies.js || true
    echo ""
fi

# 4. Fix Kotlin version
if [ -f "scripts/fix-kotlin-version.js" ]; then
    echo "4️⃣ Fixing Kotlin version..."
    node scripts/fix-kotlin-version.js || true
    echo ""
fi

# 5. Fix expo-root-project plugin
if [ -f "scripts/fix-expo-plugin.js" ]; then
    echo "5️⃣ Fixing expo-root-project plugin..."
    node scripts/fix-expo-plugin.js || true
    echo ""
fi

# 6. Fix AndroidX conflicts
if [ -f "scripts/fix-androidx-conflict.js" ]; then
    echo "6️⃣ Fixing AndroidX conflicts..."
    node scripts/fix-androidx-conflict.js || true
    echo ""
fi

# 7. Ensure gradlew is executable
if [ -f "android/gradlew" ]; then
    chmod +x android/gradlew
    echo "✅ Gradle wrapper permissions fixed"
fi

echo ""
echo "✨ All Android fixes applied!"
echo ""
echo "You can now run:"
echo "  cd android && ./gradlew assembleRelease"
echo ""