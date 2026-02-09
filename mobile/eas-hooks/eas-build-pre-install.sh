#!/bin/bash
set -e

echo "=== EAS Pre-Install Hook ==="

# Run the postinstall fixes script
if [ -f "scripts/fix-podspec.js" ]; then
  echo "Running fix-podspec.js..."
  node scripts/fix-podspec.js
fi

echo "=== Pre-Install Hook Complete ==="
