#!/bin/bash

# Wrapper script for expo export in CI
# This handles the --platform all issue by exporting platforms separately

echo "Starting CI export validation..."

# Create dist directory
mkdir -p ./dist

# Export iOS
echo "Exporting iOS..."
npx expo export --platform ios --output-dir ./dist-ios --clear || {
  echo "iOS export failed"
  exit 1
}

# Export Android
echo "Exporting Android..."
npx expo export --platform android --output-dir ./dist-android --clear || {
  echo "Android export failed"
  exit 1
}

# Move files to expected location
echo "Consolidating exports..."
cp -r ./dist-ios/* ./dist/ 2>/dev/null || true
cp -r ./dist-android/* ./dist/ 2>/dev/null || true

# Clean up temp directories
rm -rf ./dist-ios ./dist-android

echo "Export validation complete!"
echo "Files in dist:"
ls -la ./dist/ | head -10