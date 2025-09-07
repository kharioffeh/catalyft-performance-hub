#!/bin/bash

# Android Play Store Deployment Script
# Deploys Android app to Play Store

set -e

echo "🏪 Starting Android Play Store Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the mobile directory"
    exit 1
fi

# Build for production using the working strategy
echo "🔨 Building Android app for production..."
npm run build:android:pure-react-native

# Upload to Play Store
echo "📤 Uploading to Play Store..."
npx expo upload:android

echo "✅ Android Play Store deployment completed successfully!"
echo "📱 App uploaded to Play Store Console"
echo "🔗 Check Play Store Console: https://play.google.com/console"