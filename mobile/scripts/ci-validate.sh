#!/bin/bash

echo "Running CI validation..."

# Type check
echo "Running type check..."
npm run type-check || exit 1

# Lint (allow to fail)
echo "Running lint..."
npm run lint || true

# Export iOS
echo "Exporting iOS..."
npx expo export --platform ios --output-dir ./dist-ios --clear || exit 1

# Export Android
echo "Exporting Android..."
npx expo export --platform android --output-dir ./dist-android --clear || exit 1

# Clean up
rm -rf dist-ios dist-android

echo "Validation complete!"