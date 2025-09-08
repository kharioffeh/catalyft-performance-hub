#!/bin/bash

# Start Expo Go Development Server
# For free iOS testing without Apple Developer Account

set -e

echo "🚀 Starting Expo Go Development Server..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the mobile directory"
    exit 1
fi

# Start Expo development server
echo "📱 Starting Expo development server..."
echo "📱 Install Expo Go from App Store on your iPhone"
echo "📱 Scan the QR code that appears below"
echo ""

npx expo start --tunnel

echo "✅ Expo Go server started!"
echo "📱 Open Expo Go app on your iPhone"
echo "📱 Scan the QR code above"
echo "📱 Test all features immediately!"