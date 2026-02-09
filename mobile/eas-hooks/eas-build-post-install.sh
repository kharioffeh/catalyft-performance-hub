#!/bin/bash
set -e

echo "=== EAS Post-Install Hook ==="

# Run the postinstall fixes script again after npm install
if [ -f "scripts/fix-podspec.js" ]; then
  echo "Running fix-podspec.js after npm install..."
  node scripts/fix-podspec.js
fi

echo "=== Post-Install Hook Complete ==="
