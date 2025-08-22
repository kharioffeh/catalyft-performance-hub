#!/bin/bash

# ARIA API Keys Setup Script - Simple Version
# Works from any directory

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   ARIA API Keys Setup${NC}"
echo -e "${BLUE}================================${NC}"
echo

# Find the mobile directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
if [[ "$SCRIPT_DIR" == */scripts ]]; then
    MOBILE_DIR="$(dirname "$SCRIPT_DIR")"
elif [[ "$SCRIPT_DIR" == */mobile ]]; then
    MOBILE_DIR="$SCRIPT_DIR"
else
    # Try to find mobile directory
    if [ -d "mobile" ]; then
        MOBILE_DIR="$(pwd)/mobile"
    elif [ -d "../mobile" ]; then
        MOBILE_DIR="$(cd ../mobile && pwd)"
    elif [ -d "/workspace/mobile" ]; then
        MOBILE_DIR="/workspace/mobile"
    elif [ -d "/workspaces/catalyft-performance-hub/mobile" ]; then
        MOBILE_DIR="/workspaces/catalyft-performance-hub/mobile"
    else
        echo -e "${RED}Error: Cannot find mobile directory${NC}"
        exit 1
    fi
fi

ENV_FILE="$MOBILE_DIR/.env"
ENV_EXAMPLE="$MOBILE_DIR/.env.example"

echo -e "${YELLOW}Working directory: $MOBILE_DIR${NC}"
echo

# Check/create .env file
if [ -f "$ENV_FILE" ]; then
    echo -e "${GREEN}Found existing .env file${NC}"
else
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo -e "${GREEN}Created .env from .env.example${NC}"
    else
        touch "$ENV_FILE"
        echo -e "${GREEN}Created new .env file${NC}"
    fi
fi

echo
echo -e "${BLUE}Enter your API keys:${NC}"
echo

# Read OpenAI key
echo -n "OpenAI API Key (starts with sk-): "
read -s OPENAI_KEY
echo
if [ -z "$OPENAI_KEY" ]; then
    echo -e "${RED}Error: OpenAI API key is required${NC}"
    exit 1
fi

# Read optional ARIA key
echo -n "OpenAI ARIA Key (optional, press Enter to skip): "
read -s ARIA_KEY
echo

# Read Supabase URL
echo -n "Supabase URL (e.g., https://xxxxx.supabase.co): "
read SUPABASE_URL

# Read Supabase key
echo -n "Supabase Anon Key: "
read -s SUPABASE_KEY
echo

echo
echo -e "${BLUE}Updating .env file...${NC}"

# Function to update env variable
update_env() {
    local key="$1"
    local value="$2"
    
    if [ -z "$value" ]; then
        return
    fi
    
    # Remove existing key if present
    grep -v "^${key}=" "$ENV_FILE" > "$ENV_FILE.tmp" 2>/dev/null || true
    mv "$ENV_FILE.tmp" "$ENV_FILE"
    
    # Add new key
    echo "${key}=${value}" >> "$ENV_FILE"
}

# Update all keys
update_env "OPENAI_API_KEY" "$OPENAI_KEY"
update_env "OPENAI_ARIA_KEY" "$ARIA_KEY"
update_env "SUPABASE_URL" "$SUPABASE_URL"
update_env "SUPABASE_ANON_KEY" "$SUPABASE_KEY"

echo -e "${GREEN}✓ Keys saved to $ENV_FILE${NC}"
echo

# Verify if requested
echo -n "Run verification? (y/n): "
read -n 1 VERIFY
echo

if [[ "$VERIFY" == "y" || "$VERIFY" == "Y" ]]; then
    VERIFY_SCRIPT="$MOBILE_DIR/scripts/verify-openai-setup.js"
    if [ -f "$VERIFY_SCRIPT" ]; then
        cd "$MOBILE_DIR" && node scripts/verify-openai-setup.js
    else
        echo -e "${YELLOW}Verification script not found${NC}"
    fi
fi

echo
echo -e "${GREEN}Setup complete!${NC}"
echo
echo "Next steps:"
echo "1. cd $MOBILE_DIR"
echo "2. npm start"
echo "3. npm run ios (or npm run android)"