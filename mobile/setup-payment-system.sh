#!/bin/bash

# Catalyft Payment System Setup Script
echo "🚀 Catalyft Payment System Setup"
echo "================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to prompt for input
prompt_for_value() {
    local prompt_text=$1
    local var_name=$2
    read -p "$prompt_text: " value
    eval "$var_name='$value'"
}

echo -e "${YELLOW}📋 Prerequisites Check${NC}"
echo "Please ensure you have:"
echo "✓ Stripe account with products created"
echo "✓ Supabase project set up"
echo "✓ Access to Supabase Dashboard"
echo ""
read -p "Press Enter to continue..."

# Collect Configuration
echo -e "\n${YELLOW}🔧 Step 1: Configuration${NC}"
prompt_for_value "Supabase Project URL (https://xxx.supabase.co)" SUPABASE_URL
prompt_for_value "Supabase Anon Key" SUPABASE_ANON_KEY
prompt_for_value "Stripe Publishable Key (pk_live_...)" STRIPE_PUBLISHABLE_KEY

echo -e "\n${BLUE}Enter your Stripe Price IDs:${NC}"
prompt_for_value "Premium Monthly Price ID" PREMIUM_MONTHLY_ID
prompt_for_value "Premium Yearly Price ID" PREMIUM_YEARLY_ID
prompt_for_value "Elite Monthly Price ID" ELITE_MONTHLY_ID
prompt_for_value "Elite Yearly Price ID" ELITE_YEARLY_ID

# Create .env.local
cat > .env.local << EOF
EXPO_PUBLIC_SUPABASE_URL=$SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY
EXPO_PUBLIC_STRIPE_PREMIUM_MONTHLY=$PREMIUM_MONTHLY_ID
EXPO_PUBLIC_STRIPE_PREMIUM_YEARLY=$PREMIUM_YEARLY_ID
EXPO_PUBLIC_STRIPE_ELITE_MONTHLY=$ELITE_MONTHLY_ID
EXPO_PUBLIC_STRIPE_ELITE_YEARLY=$ELITE_YEARLY_ID
EOF

echo -e "${GREEN}✅ Created .env.local${NC}"

echo -e "\n${GREEN}🎉 Setup Complete!${NC}"
echo "Your webhook URL: $SUPABASE_URL/functions/v1/stripe-webhook"
