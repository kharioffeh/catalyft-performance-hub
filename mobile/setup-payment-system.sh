#!/bin/bash

# Catalyft Payment System Setup Script
# This script helps you set up the complete payment infrastructure

echo "🚀 Catalyft Payment System Setup"
echo "================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Step 1: Collect Configuration
echo -e "\n${YELLOW}🔧 Step 1: Configuration${NC}"
echo "Please provide your configuration details:"
echo ""

prompt_for_value "Supabase Project URL (https://xxx.supabase.co)" SUPABASE_URL
prompt_for_value "Supabase Anon Key" SUPABASE_ANON_KEY
prompt_for_value "Supabase Service Role Key" SUPABASE_SERVICE_KEY
prompt_for_value "Stripe Publishable Key (pk_live_...)" STRIPE_PUBLISHABLE_KEY
prompt_for_value "Stripe Secret Key (sk_live_...)" STRIPE_SECRET_KEY

echo -e "\n${BLUE}Enter your Stripe Price IDs:${NC}"
prompt_for_value "Premium Monthly Price ID" PREMIUM_MONTHLY_ID
prompt_for_value "Premium Yearly Price ID" PREMIUM_YEARLY_ID
prompt_for_value "Elite Monthly Price ID" ELITE_MONTHLY_ID
prompt_for_value "Elite Yearly Price ID" ELITE_YEARLY_ID

# Step 2: Create Environment Files
echo -e "\n${YELLOW}📝 Step 2: Creating Configuration Files${NC}"

# Create .env.local for the app
cat > .env.local << EOF
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=$SUPABASE_URL
EXPO_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Stripe Configuration
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY

# Price IDs
EXPO_PUBLIC_STRIPE_PREMIUM_MONTHLY=$PREMIUM_MONTHLY_ID
EXPO_PUBLIC_STRIPE_PREMIUM_YEARLY=$PREMIUM_YEARLY_ID
EXPO_PUBLIC_STRIPE_ELITE_MONTHLY=$ELITE_MONTHLY_ID
EXPO_PUBLIC_STRIPE_ELITE_YEARLY=$ELITE_YEARLY_ID
EOF

echo -e "${GREEN}✅ Created .env.local${NC}"

# Create Stripe config file
cat > src/config/stripe.ts << EOF
// Auto-generated Stripe Configuration
export const STRIPE_CONFIG = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '$STRIPE_PUBLISHABLE_KEY',
  prices: {
    PREMIUM_MONTHLY: process.env.EXPO_PUBLIC_STRIPE_PREMIUM_MONTHLY || '$PREMIUM_MONTHLY_ID',
    PREMIUM_YEARLY: process.env.EXPO_PUBLIC_STRIPE_PREMIUM_YEARLY || '$PREMIUM_YEARLY_ID',
    ELITE_MONTHLY: process.env.EXPO_PUBLIC_STRIPE_ELITE_MONTHLY || '$ELITE_MONTHLY_ID',
    ELITE_YEARLY: process.env.EXPO_PUBLIC_STRIPE_ELITE_YEARLY || '$ELITE_YEARLY_ID',
  }
};
EOF

echo -e "${GREEN}✅ Created src/config/stripe.ts${NC}"

# Update the subscription constants with actual price IDs
cat > src/constants/subscriptions-updated.ts << EOF
import { SubscriptionTier } from '../types/payments';

export const SUBSCRIPTION_PLANS: Record<string, SubscriptionTier> = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: [
      '3 workouts per week',
      'Basic exercise library',
      'Progress tracking',
      'Community access',
    ],
    limitations: {
      workoutsPerWeek: 3,
      aiChatsPerDay: 3,
      customWorkouts: false,
      advancedAnalytics: false,
      mealPlanning: false,
      formAnalysis: false,
      personalCoaching: false,
    },
  },
  PREMIUM_MONTHLY: {
    id: 'premium_monthly',
    name: 'Premium',
    stripePriceId: '$PREMIUM_MONTHLY_ID',
    price: 9.99,
    interval: 'month',
    trial: 7,
    features: [
      'Unlimited workouts',
      'AI-powered coaching',
      'Advanced analytics',
      'Custom workout builder',
      'Meal planning',
      'Priority support',
    ],
    limitations: {
      workoutsPerWeek: -1,
      aiChatsPerDay: -1,
      customWorkouts: true,
      advancedAnalytics: true,
      mealPlanning: true,
      formAnalysis: false,
      personalCoaching: false,
    },
  },
  PREMIUM_YEARLY: {
    id: 'premium_yearly',
    name: 'Premium',
    stripePriceId: '$PREMIUM_YEARLY_ID',
    price: 79.99,
    interval: 'year',
    trial: 7,
    savings: 'Save 33%',
    features: [
      'Everything in Premium Monthly',
      'Save \$40 per year',
    ],
    limitations: {
      workoutsPerWeek: -1,
      aiChatsPerDay: -1,
      customWorkouts: true,
      advancedAnalytics: true,
      mealPlanning: true,
      formAnalysis: false,
      personalCoaching: false,
    },
  },
  ELITE_MONTHLY: {
    id: 'elite_monthly',
    name: 'Elite',
    stripePriceId: '$ELITE_MONTHLY_ID',
    price: 19.99,
    interval: 'month',
    trial: 14,
    features: [
      'Everything in Premium',
      'AI form analysis',
      'Personal coaching sessions',
      'Supplement guidance',
      'VIP community access',
      'Early access to features',
    ],
    limitations: {
      workoutsPerWeek: -1,
      aiChatsPerDay: -1,
      customWorkouts: true,
      advancedAnalytics: true,
      mealPlanning: true,
      formAnalysis: true,
      personalCoaching: true,
    },
  },
  ELITE_YEARLY: {
    id: 'elite_yearly',
    name: 'Elite',
    stripePriceId: '$ELITE_YEARLY_ID',
    price: 159.99,
    interval: 'year',
    trial: 14,
    savings: 'Save 33%',
    features: [
      'Everything in Elite Monthly',
      'Save \$80 per year',
      'Annual health assessment',
    ],
    limitations: {
      workoutsPerWeek: -1,
      aiChatsPerDay: -1,
      customWorkouts: true,
      advancedAnalytics: true,
      mealPlanning: true,
      formAnalysis: true,
      personalCoaching: true,
    },
  },
};

export const TRIAL_PERIODS = {
  PREMIUM: 7,
  ELITE: 14,
};
EOF

echo -e "${GREEN}✅ Updated subscription constants${NC}"

# Step 3: Database Setup Instructions
echo -e "\n${YELLOW}📊 Step 3: Database Setup${NC}"
echo -e "${BLUE}Please follow these steps in your Supabase Dashboard:${NC}"
echo ""
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Click 'New Query'"
echo "4. Copy and paste the contents of:"
echo -e "   ${GREEN}supabase/migrations/20240101000000_create_payment_tables.sql${NC}"
echo "5. Click 'Run' to execute the migration"
echo ""
read -p "Press Enter when you've completed the database setup..."

# Step 4: Edge Functions Setup
echo -e "\n${YELLOW}⚡ Step 4: Edge Functions Deployment${NC}"
echo ""

# Create the Edge Functions environment file
cat > supabase/.env << EOF
STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
STRIPE_PREMIUM_MONTHLY_PRICE_ID=$PREMIUM_MONTHLY_ID
STRIPE_PREMIUM_YEARLY_PRICE_ID=$PREMIUM_YEARLY_ID
STRIPE_ELITE_MONTHLY_PRICE_ID=$ELITE_MONTHLY_ID
STRIPE_ELITE_YEARLY_PRICE_ID=$ELITE_YEARLY_ID
EOF

echo -e "${GREEN}✅ Created Edge Functions environment file${NC}"

echo -e "\n${BLUE}To deploy Edge Functions, run these commands:${NC}"
echo ""
echo "# Deploy the webhook handler"
echo -e "${YELLOW}npx supabase functions deploy stripe-webhook${NC}"
echo ""
echo "# Deploy the customer creation function"
echo -e "${YELLOW}npx supabase functions deploy create-stripe-customer${NC}"
echo ""
echo "# Deploy the subscription creation function"
echo -e "${YELLOW}npx supabase functions deploy create-subscription${NC}"
echo ""
echo "# Set secrets (run each line separately)"
echo -e "${YELLOW}npx supabase secrets set STRIPE_SECRET_KEY='$STRIPE_SECRET_KEY'${NC}"
echo -e "${YELLOW}npx supabase secrets set STRIPE_PREMIUM_MONTHLY_PRICE_ID='$PREMIUM_MONTHLY_ID'${NC}"
echo -e "${YELLOW}npx supabase secrets set STRIPE_PREMIUM_YEARLY_PRICE_ID='$PREMIUM_YEARLY_ID'${NC}"
echo -e "${YELLOW}npx supabase secrets set STRIPE_ELITE_MONTHLY_PRICE_ID='$ELITE_MONTHLY_ID'${NC}"
echo -e "${YELLOW}npx supabase secrets set STRIPE_ELITE_YEARLY_PRICE_ID='$ELITE_YEARLY_ID'${NC}"
echo ""
read -p "Press Enter to continue after deploying functions..."

# Step 5: Webhook Setup
echo -e "\n${YELLOW}🔗 Step 5: Stripe Webhook Configuration${NC}"
echo ""
echo -e "${BLUE}Your webhook endpoint URL is:${NC}"
echo -e "${GREEN}$SUPABASE_URL/functions/v1/stripe-webhook${NC}"
echo ""
echo "Add this webhook in Stripe Dashboard:"
echo "1. Go to https://dashboard.stripe.com/webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Enter the URL above"
echo "4. Select these events:"
echo "   - customer.subscription.created"
echo "   - customer.subscription.updated"
echo "   - customer.subscription.deleted"
echo "   - customer.subscription.trial_will_end"
echo "   - payment_intent.succeeded"
echo "   - payment_intent.payment_failed"
echo "   - invoice.payment_succeeded"
echo "   - invoice.payment_failed"
echo "   - invoice.upcoming"
echo "5. Copy the signing secret (whsec_...)"
echo ""
prompt_for_value "Enter your Webhook Signing Secret" WEBHOOK_SECRET

# Set the webhook secret
echo -e "\n${BLUE}Run this command to set the webhook secret:${NC}"
echo -e "${YELLOW}npx supabase secrets set STRIPE_WEBHOOK_SECRET='$WEBHOOK_SECRET'${NC}"
echo ""

# Step 6: Update Trial Configuration
echo -e "\n${YELLOW}🎯 Step 6: Trial Period Configuration${NC}"
cat > supabase/functions/create-subscription/trial-config.ts << EOF
// Trial period configuration
export const TRIAL_CONFIG = {
  '$PREMIUM_MONTHLY_ID': 7,  // 7-day trial for Premium Monthly
  '$PREMIUM_YEARLY_ID': 7,   // 7-day trial for Premium Yearly
  '$ELITE_MONTHLY_ID': 14,   // 14-day trial for Elite Monthly
  '$ELITE_YEARLY_ID': 14,     // 14-day trial for Elite Yearly
};

export function getTrialDays(priceId: string): number {
  return TRIAL_CONFIG[priceId] || 0;
}
EOF

echo -e "${GREEN}✅ Trial configuration created${NC}"

# Step 7: Testing
echo -e "\n${YELLOW}🧪 Step 7: Testing Your Setup${NC}"
echo ""
echo "Test your webhook with Stripe CLI:"
echo -e "${YELLOW}stripe listen --forward-to $SUPABASE_URL/functions/v1/stripe-webhook${NC}"
echo ""
echo "Then trigger a test event:"
echo -e "${YELLOW}stripe trigger customer.subscription.created${NC}"
echo ""

# Summary
echo -e "\n${GREEN}🎉 Setup Complete!${NC}"
echo "================================="
echo ""
echo -e "${GREEN}✅ Configuration files created${NC}"
echo -e "${GREEN}✅ Database migration ready${NC}"
echo -e "${GREEN}✅ Edge Functions prepared${NC}"
echo -e "${GREEN}✅ Trial periods configured${NC}"
echo ""
echo -e "${YELLOW}📋 Checklist:${NC}"
echo "[ ] Database tables created in Supabase"
echo "[ ] Edge Functions deployed"
echo "[ ] Secrets set in Supabase"
echo "[ ] Webhook added to Stripe Dashboard"
echo "[ ] Webhook secret configured"
echo "[ ] Test webhook with Stripe CLI"
echo ""
echo -e "${BLUE}📱 Your app is now ready to process payments!${NC}"
echo ""
echo "Next steps:"
echo "1. Test a subscription in your app"
echo "2. Verify trial periods work correctly"
echo "3. Check webhook logs in Stripe Dashboard"
echo "4. Monitor Supabase logs for any issues"
echo ""
echo -e "${GREEN}Happy coding! 🚀${NC}"