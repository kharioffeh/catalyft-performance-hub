#!/bin/bash

# iOS Free Testing Script
# Tests iOS app without Apple Developer Account

set -e

echo "🆓 Starting iOS Free Testing..."

# Option 1: Expo Go Testing
echo "📱 Option 1: Expo Go Testing"
echo "1. Install Expo Go from App Store on your iPhone"
echo "2. Run: npm start"
echo "3. Scan QR code with Expo Go"
echo "4. Test all features immediately"
echo ""

# Option 2: Development Build
echo "📱 Option 2: Development Build (7 days free)"
echo "1. Connect iPhone via USB"
echo "2. Run: npx expo run:ios --device"
echo "3. Test for 7 days"
echo ""

# Option 3: Simulator
echo "📱 Option 3: iOS Simulator (Mac only)"
echo "1. Run: npx expo run:ios"
echo "2. Test in simulator"
echo ""

echo "✅ Free testing options ready!"
echo "💡 Recommended: Start with Expo Go for immediate testing"