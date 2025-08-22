#!/bin/bash

# ARIA API Keys Setup Script
# This script helps configure OpenAI and Supabase API keys for the ARIA AI coach

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to mask input
read_secret() {
    local prompt="$1"
    local var_name="$2"
    
    echo -n "$prompt"
    read -s $var_name
    echo
}

echo -e "${BLUE}================================${NC}"
echo -e "${BLUE}   ARIA API Keys Setup${NC}"
echo -e "${BLUE}================================${NC}"
echo

# Determine the correct path to .env file
if [ -f ".env" ]; then
    # We're in the mobile directory
    ENV_FILE=".env"
    ENV_EXAMPLE=".env.example"
    SCRIPT_DIR="scripts"
elif [ -f "mobile/.env" ] || [ -f "mobile/.env.example" ]; then
    # We're in the project root
    ENV_FILE="mobile/.env"
    ENV_EXAMPLE="mobile/.env.example"
    SCRIPT_DIR="mobile/scripts"
else
    # Try to find mobile directory
    if [ -d "../mobile" ]; then
        ENV_FILE="../mobile/.env"
        ENV_EXAMPLE="../mobile/.env.example"
        SCRIPT_DIR="../mobile/scripts"
    else
        ENV_FILE=".env"
        ENV_EXAMPLE=".env.example"
        SCRIPT_DIR="scripts"
    fi
fi

# Check if .env file exists
if [ -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}Found existing .env file. Keys will be updated.${NC}"
else
    # Create from example if it doesn't exist
    if [ -f "$ENV_EXAMPLE" ]; then
        cp "$ENV_EXAMPLE" "$ENV_FILE"
        echo -e "${GREEN}Created .env file from .env.example${NC}"
    else
        # Create a new .env file
        touch "$ENV_FILE"
        echo -e "${GREEN}Created new .env file${NC}"
    fi
fi

echo
echo -e "${BLUE}Please enter your API keys:${NC}"
echo -e "${YELLOW}(Your input will be hidden for security)${NC}"
echo

# OpenAI API Key
read_secret "OpenAI API Key (required, starts with sk-): " OPENAI_KEY
if [ -z "$OPENAI_KEY" ]; then
    echo -e "${RED}Error: OpenAI API key is required${NC}"
    exit 1
fi

# OpenAI ARIA Key (optional)
read_secret "OpenAI ARIA Key (optional, press Enter to skip): " ARIA_KEY

# Supabase URL
echo -n "Supabase URL (e.g., https://xxxxx.supabase.co): "
read SUPABASE_URL
if [ -z "$SUPABASE_URL" ]; then
    echo -e "${YELLOW}Warning: Supabase URL not provided${NC}"
fi

# Supabase Anon Key
read_secret "Supabase Anon Key: " SUPABASE_KEY
if [ -z "$SUPABASE_KEY" ]; then
    echo -e "${YELLOW}Warning: Supabase Anon Key not provided${NC}"
fi

echo
echo -e "${BLUE}Updating .env file...${NC}"

# Update or add keys to .env file
update_env_var() {
    local key="$1"
    local value="$2"
    local file="$ENV_FILE"
    
    if grep -q "^${key}=" "$file" 2>/dev/null; then
        # Update existing key
        sed -i.bak "s|^${key}=.*|${key}=${value}|" "$file"
    else
        # Add new key
        echo "${key}=${value}" >> "$file"
    fi
}

# Update the .env file
update_env_var "OPENAI_API_KEY" "$OPENAI_KEY"
if [ ! -z "$ARIA_KEY" ]; then
    update_env_var "OPENAI_ARIA_KEY" "$ARIA_KEY"
fi
if [ ! -z "$SUPABASE_URL" ]; then
    update_env_var "SUPABASE_URL" "$SUPABASE_URL"
fi
if [ ! -z "$SUPABASE_KEY" ]; then
    update_env_var "SUPABASE_ANON_KEY" "$SUPABASE_KEY"
fi

echo -e "${GREEN}✓ API keys have been saved to $ENV_FILE${NC}"
echo

# Run verification
echo -e "${BLUE}Running verification...${NC}"
echo

VERIFY_SCRIPT="$SCRIPT_DIR/verify-openai-setup.js"
if [ -f "$VERIFY_SCRIPT" ]; then
    node "$VERIFY_SCRIPT"
else
    echo -e "${YELLOW}Verification script not found at $VERIFY_SCRIPT${NC}"
    echo -e "${GREEN}Your keys have been saved. You can verify manually later.${NC}"
fi

echo
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Start the Metro bundler: cd mobile && npm start"
echo "2. Run the app: npm run ios (or npm run android)"
echo "3. Test ARIA in the app!"