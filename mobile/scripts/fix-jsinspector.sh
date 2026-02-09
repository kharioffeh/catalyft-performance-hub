#!/bin/bash
# Fix jsinspector-modern header not found issue

set -e

echo "🔧 Fixing jsinspector-modern headers..."

# Navigate to ios folder
cd ios 2>/dev/null || cd mobile/ios 2>/dev/null || true

# Check if Pods folder exists
if [ -d "Pods" ]; then
  PODS_HEADERS="Pods/Headers/Public"

  # Create symbolic link from jsinspector-modern to React-jsinspector if needed
  if [ -d "$PODS_HEADERS/React-jsinspector" ] && [ ! -d "$PODS_HEADERS/jsinspector-modern" ]; then
    echo "Creating jsinspector-modern symlink..."
    ln -sf "React-jsinspector" "$PODS_HEADERS/jsinspector-modern"
    echo "✅ Created symlink: jsinspector-modern -> React-jsinspector"
  fi

  # Also check Private headers
  PRIVATE_HEADERS="Pods/Headers/Private"
  if [ -d "$PRIVATE_HEADERS/React-jsinspector" ] && [ ! -d "$PRIVATE_HEADERS/jsinspector-modern" ]; then
    echo "Creating private jsinspector-modern symlink..."
    ln -sf "React-jsinspector" "$PRIVATE_HEADERS/jsinspector-modern"
    echo "✅ Created private symlink: jsinspector-modern -> React-jsinspector"
  fi
else
  echo "⚠️ Pods folder not found, skipping jsinspector fix"
fi

echo "✅ jsinspector fix complete"
