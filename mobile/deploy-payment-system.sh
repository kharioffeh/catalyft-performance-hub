#!/bin/bash

# Catalyft Payment System Deployment Script
# This script deploys all payment-related infrastructure

echo "🚀 Deploying Catalyft Payment System..."
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}❌ Supabase CLI not found. Please install it first:${NC}"
    echo "npm install -g supabase"
    exit 1
fi

# Step 1: Deploy Database Migration
echo -e "\n${YELLOW}📊 Step 1: Deploying Database Tables...${NC}"
if [ -f "supabase/migrations/20240101000000_create_payment_tables.sql" ]; then
    supabase db push
    echo -e "${GREEN}✅ Database tables created${NC}"
else
    echo -e "${RED}❌ Migration file not found${NC}"
    exit 1
fi

# Step 2: Deploy Edge Functions
echo -e "\n${YELLOW}⚡ Step 2: Deploying Edge Functions...${NC}"

# Deploy webhook handler
echo "Deploying stripe-webhook function..."
supabase functions deploy stripe-webhook

# Deploy customer creation function
echo "Deploying create-stripe-customer function..."
supabase functions deploy create-stripe-customer

# Deploy subscription creation function
echo "Deploying create-subscription function..."
supabase functions deploy create-subscription

echo -e "${GREEN}✅ Edge functions deployed${NC}"

# Step 3: Set Environment Variables
echo -e "\n${YELLOW}🔐 Step 3: Setting Environment Variables...${NC}"
echo "Please provide your Stripe configuration:"

read -p "Enter your Stripe Secret Key (sk_live_...): " STRIPE_SECRET_KEY
read -p "Enter your Stripe Webhook Secret (whsec_...): " STRIPE_WEBHOOK_SECRET
read -p "Enter Premium Monthly Price ID: " PREMIUM_MONTHLY
read -p "Enter Premium Yearly Price ID: " PREMIUM_YEARLY
read -p "Enter Elite Monthly Price ID: " ELITE_MONTHLY
read -p "Enter Elite Yearly Price ID: " ELITE_YEARLY

# Set the secrets
supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY"
supabase secrets set STRIPE_WEBHOOK_SECRET="$STRIPE_WEBHOOK_SECRET"
supabase secrets set STRIPE_PREMIUM_MONTHLY_PRICE_ID="$PREMIUM_MONTHLY"
supabase secrets set STRIPE_PREMIUM_YEARLY_PRICE_ID="$PREMIUM_YEARLY"
supabase secrets set STRIPE_ELITE_MONTHLY_PRICE_ID="$ELITE_MONTHLY"
supabase secrets set STRIPE_ELITE_YEARLY_PRICE_ID="$ELITE_YEARLY"

echo -e "${GREEN}✅ Environment variables set${NC}"

# Step 4: Get webhook URL
echo -e "\n${YELLOW}🔗 Step 4: Webhook Configuration${NC}"
PROJECT_REF=$(supabase status --output json | jq -r '.project_ref')
WEBHOOK_URL="https://$PROJECT_REF.supabase.co/functions/v1/stripe-webhook"

echo -e "${GREEN}Your webhook endpoint URL is:${NC}"
echo -e "${YELLOW}$WEBHOOK_URL${NC}"
echo ""
echo "Add this URL to Stripe Dashboard:"
echo "1. Go to https://dashboard.stripe.com/webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Paste the URL above"
echo "4. Select all events mentioned in the documentation"
echo ""

# Step 5: Test the setup
echo -e "\n${YELLOW}🧪 Step 5: Testing Setup...${NC}"
echo "To test your webhook locally, run:"
echo -e "${YELLOW}stripe listen --forward-to $WEBHOOK_URL${NC}"
echo ""
echo "Then in another terminal:"
echo -e "${YELLOW}stripe trigger customer.subscription.created${NC}"

# Step 6: Update frontend config
echo -e "\n${YELLOW}📱 Step 6: Update Your App Config${NC}"
cat > src/config/stripe.ts << EOF
// Auto-generated Stripe configuration
export const STRIPE_CONFIG = {
  PREMIUM_MONTHLY_PRICE_ID: '$PREMIUM_MONTHLY',
  PREMIUM_YEARLY_PRICE_ID: '$PREMIUM_YEARLY',
  ELITE_MONTHLY_PRICE_ID: '$ELITE_MONTHLY',
  ELITE_YEARLY_PRICE_ID: '$ELITE_YEARLY',
}
EOF

echo -e "${GREEN}✅ Frontend config updated${NC}"

# Summary
echo -e "\n${GREEN}🎉 Deployment Complete!${NC}"
echo "======================================="
echo "✅ Database tables created"
echo "✅ Edge functions deployed"
echo "✅ Environment variables set"
echo "✅ Webhook URL generated"
echo "✅ Frontend config updated"
echo ""
echo -e "${YELLOW}⚠️  Don't forget to:${NC}"
echo "1. Add the webhook URL to Stripe Dashboard"
echo "2. Create your products in Stripe"
echo "3. Test with Stripe CLI"
echo "4. Update your app's environment variables"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"