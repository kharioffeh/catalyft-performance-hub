#!/bin/bash

# Setup API Keys for ARIA
echo "🤖 ARIA API Key Setup"
echo "====================="
echo ""
echo "This script will help you configure your API keys for ARIA."
echo "Your keys will be saved in the .env file."
echo ""

# Function to update or add key in .env
update_env_key() {
    local key=$1
    local value=$2
    local env_file="/workspace/mobile/.env"
    
    if grep -q "^${key}=" "$env_file"; then
        # Key exists, update it
        sed -i "s|^${key}=.*|${key}=${value}|" "$env_file"
    else
        # Key doesn't exist, add it
        echo "${key}=${value}" >> "$env_file"
    fi
}

# Check if .env exists
if [ ! -f "/workspace/mobile/.env" ]; then
    echo "Creating .env file..."
    cp /workspace/mobile/.env.example /workspace/mobile/.env
fi

echo "Please enter your API keys (they will be masked in display):"
echo ""

# OpenAI API Key
echo "1. OpenAI API Key"
echo "   Get it from: https://platform.openai.com/api-keys"
echo -n "   Enter your OpenAI API key (starts with sk-): "
read -s OPENAI_KEY
echo ""

if [ ! -z "$OPENAI_KEY" ]; then
    update_env_key "OPENAI_API_KEY" "$OPENAI_KEY"
    echo "   ✓ OpenAI API key saved"
else
    echo "   ⚠ Skipped OpenAI API key"
fi

echo ""

# OpenAI ARIA Key (optional)
echo "2. OpenAI ARIA Key (Optional - for separate billing)"
echo "   Leave blank to use the same key as above"
echo -n "   Enter your ARIA-specific OpenAI key (or press Enter to skip): "
read -s ARIA_KEY
echo ""

if [ ! -z "$ARIA_KEY" ]; then
    update_env_key "OPENAI_ARIA_KEY" "$ARIA_KEY"
    echo "   ✓ ARIA API key saved"
else
    echo "   ⚠ Skipped ARIA-specific key (will use main OpenAI key)"
fi

echo ""

# Supabase Configuration
echo "3. Supabase Configuration"
echo "   Get these from: https://app.supabase.com/project/_/settings/api"
echo ""

echo -n "   Enter your Supabase URL: "
read SUPABASE_URL

if [ ! -z "$SUPABASE_URL" ]; then
    update_env_key "SUPABASE_URL" "$SUPABASE_URL"
    echo "   ✓ Supabase URL saved"
else
    echo "   ⚠ Skipped Supabase URL"
fi

echo -n "   Enter your Supabase Anon Key: "
read -s SUPABASE_KEY
echo ""

if [ ! -z "$SUPABASE_KEY" ]; then
    update_env_key "SUPABASE_ANON_KEY" "$SUPABASE_KEY"
    echo "   ✓ Supabase Anon Key saved"
else
    echo "   ⚠ Skipped Supabase Anon Key"
fi

echo ""
echo "================================"
echo "Configuration complete!"
echo ""
echo "Running verification..."
echo ""

# Run verification script
node /workspace/mobile/scripts/verify-openai-setup.js

echo ""
echo "🎯 Next Steps:"
echo "1. If all checks pass, run: npm run ios (or android)"
echo "2. Navigate to the ARIA chat screen"
echo "3. Test with: 'Hello ARIA, how can you help me?'"
echo ""
echo "📝 To update keys later, run this script again or edit .env directly"