#!/bin/bash

# iOS App Store Deployment Script
# Deploys iOS app to App Store

set -e

echo "🏪 Starting iOS App Store Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in the mobile directory"
    exit 1
fi

# Build for production
echo "🔨 Building iOS app for production..."
npx expo build:ios --type archive

# Upload to App Store
echo "📤 Uploading to App Store..."
npx expo upload:ios

echo "✅ iOS App Store deployment completed successfully!"
echo "📱 App uploaded to App Store Connect"
echo "🔗 Check App Store Connect: https://appstoreconnect.apple.com"