#!/bin/bash

echo "🔍 Checking GitHub Actions E2E Test Status"
echo "==========================================="
echo ""

# Check if we can access the repository URL
REPO_URL="https://github.com/kharioffeh/catalyft-performance-hub"
echo "📍 Repository: $REPO_URL"
echo "🔗 Actions URL: $REPO_URL/actions"
echo ""

# Get the latest commit
echo "📝 Latest commit:"
git log --oneline -1
echo ""

# Check if workflow files exist
echo "📋 Workflow files:"
ls -la .github/workflows/
echo ""

# Show E2E test files
echo "🧪 E2E Test files:"
ls -la mobile/e2e/ | grep -E "\.(ts|js)$"
echo ""

# Run validation
echo "✅ Running E2E validation:"
cd mobile && npm run detox:validate
echo ""

echo "🎯 Next Steps:"
echo "1. Visit $REPO_URL/actions to see workflow runs"
echo "2. Look for 'E2E Tests' workflow"
echo "3. Check both iOS and Android job status"
echo "4. Review logs if any failures occur"
echo ""
echo "ℹ️  The workflow should start automatically after pushing to main branch"
echo "⏱️  Expected run time: 15-30 minutes total (iOS: ~15min, Android: ~20min)"