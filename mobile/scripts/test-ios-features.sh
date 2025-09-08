#!/bin/bash

# iOS Features Testing Script
# Tests all app features on iOS

set -e

echo "🧪 Starting iOS Features Testing..."

# Test API connections
echo "🔌 Testing API connections..."
npm run test:api-connections

# Test wearable integrations
echo "⌚ Testing wearable integrations..."
npm run test:wearable-integration

# Test real-time features
echo "⚡ Testing real-time features..."
npm run test:real-time-features

# Test social features
echo "👥 Testing social features..."
npm run test:social

echo "✅ iOS features testing completed successfully!"