#!/bin/bash

# Social Features Test Runner
# This script can be run from any location

echo "================================================"
echo "    Catalyft Social Features Test Runner"
echo "================================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Check if we're on the social features branch
if [[ "$CURRENT_BRANCH" != "agent-8-social" ]]; then
    echo -e "${YELLOW}Warning: Not on agent-8-social branch${NC}"
    echo "Attempting to switch to agent-8-social branch..."
    
    # Try to checkout the branch
    git fetch origin
    git checkout agent-8-social 2>/dev/null || git checkout -b agent-8-social origin/agent-8-social
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to switch to agent-8-social branch${NC}"
        exit 1
    fi
    echo -e "${GREEN}Successfully switched to agent-8-social branch${NC}"
fi

# Find the mobile directory
if [ -d "mobile" ]; then
    cd mobile
elif [ -d "../mobile" ]; then
    cd ../mobile
elif [ -d "." ] && [ -f "package.json" ]; then
    # Already in the right directory
    echo "Already in mobile directory"
else
    echo -e "${RED}Cannot find mobile directory${NC}"
    exit 1
fi

echo ""
echo "Working directory: $(pwd)"
echo ""

# Check if test file exists
if [ ! -f "src/scripts/runSocialTests.js" ]; then
    echo -e "${RED}Test file not found: src/scripts/runSocialTests.js${NC}"
    echo "Please ensure you're on the correct branch with the social features implementation"
    exit 1
fi

# Run the tests
echo "Running social features tests..."
echo "================================"
echo ""

node src/scripts/runSocialTests.js

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Tests completed successfully!${NC}"
else
    echo ""
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
fi