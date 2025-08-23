#!/bin/bash

# Check if @react-native-voice/voice needs Gradle fixes
# This runs during CI to determine if the fix is needed

VOICE_GRADLE=""

# Check for the new package location first
if [ -f "node_modules/@react-native-voice/voice/android/build.gradle" ]; then
    VOICE_GRADLE="node_modules/@react-native-voice/voice/android/build.gradle"
elif [ -f "node_modules/react-native-voice/android/build.gradle" ]; then
    VOICE_GRADLE="node_modules/react-native-voice/android/build.gradle"
fi

if [ -z "$VOICE_GRADLE" ]; then
    echo "✅ react-native-voice not found, no fix needed"
    exit 0
fi

# Check if it uses deprecated 'compile' syntax
if grep -q "compile " "$VOICE_GRADLE"; then
    echo "⚠️  Found deprecated 'compile' in $VOICE_GRADLE"
    echo "Running fix..."
    node scripts/fix-voice-gradle.js
else
    echo "✅ No deprecated Gradle syntax found in $VOICE_GRADLE"
fi