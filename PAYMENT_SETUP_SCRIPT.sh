#!/bin/bash

# Catalyft Payment System Setup Script
# This script creates all necessary files for the payment system

echo "🚀 Creating Catalyft Payment System Files"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create directory structure
echo -e "${YELLOW}📁 Creating directory structure...${NC}"
mkdir -p supabase/functions/stripe-webhook
mkdir -p supabase/functions/create-stripe-customer
mkdir -p supabase/functions/create-subscription
mkdir -p supabase/migrations
mkdir -p src/services/payments
mkdir -p src/screens/subscription
mkdir -p src/components/paywall
mkdir -p src/hooks/payments
mkdir -p src/types/payments
mkdir -p src/constants
mkdir -p src/config
mkdir -p docs

echo -e "${GREEN}✅ Directories created${NC}"

# Create the main setup script
cat > setup-payment-system.sh << 'SETUP_EOF'
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

# Create Stripe config
cat > src/config/stripe.ts << EOF
export const STRIPE_CONFIG = {
  publishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || '$STRIPE_PUBLISHABLE_KEY',
  prices: {
    PREMIUM_MONTHLY: '$PREMIUM_MONTHLY_ID',
    PREMIUM_YEARLY: '$PREMIUM_YEARLY_ID',
    ELITE_MONTHLY: '$ELITE_MONTHLY_ID',
    ELITE_YEARLY: '$ELITE_YEARLY_ID',
  }
};
EOF

echo -e "${GREEN}✅ Created Stripe config${NC}"

echo -e "\n${YELLOW}📊 Step 2: Database Setup${NC}"
echo "1. Go to your Supabase Dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and run the SQL from: supabase/migrations/20240101000000_create_payment_tables.sql"
echo ""
read -p "Press Enter when database tables are created..."

echo -e "\n${YELLOW}⚡ Step 3: Deploy Edge Functions${NC}"
echo "Run these commands:"
echo ""
echo "npx supabase init (if not already initialized)"
echo "npx supabase link --project-ref <your-project-ref>"
echo "npx supabase functions deploy stripe-webhook"
echo "npx supabase functions deploy create-stripe-customer"
echo "npx supabase functions deploy create-subscription"
echo ""
echo "Then set secrets:"
echo "npx supabase secrets set STRIPE_SECRET_KEY=<your-secret-key>"
echo "npx supabase secrets set STRIPE_WEBHOOK_SECRET=<webhook-secret>"
echo ""

echo -e "\n${YELLOW}🔗 Step 4: Webhook URL${NC}"
echo -e "Your webhook URL: ${GREEN}$SUPABASE_URL/functions/v1/stripe-webhook${NC}"
echo ""
echo "Add this to Stripe Dashboard with these events:"
echo "• customer.subscription.created"
echo "• customer.subscription.updated"
echo "• customer.subscription.deleted"
echo "• customer.subscription.trial_will_end"
echo "• payment_intent.succeeded"
echo "• invoice.payment_succeeded"
echo ""

echo -e "\n${GREEN}🎉 Setup Complete!${NC}"
echo "Test with: stripe listen --forward-to $SUPABASE_URL/functions/v1/stripe-webhook"
SETUP_EOF

chmod +x setup-payment-system.sh
echo -e "${GREEN}✅ Created setup-payment-system.sh${NC}"

# Create SQL migration file
echo -e "\n${YELLOW}📊 Creating database migration...${NC}"
cat > supabase/migrations/20240101000000_create_payment_tables.sql << 'SQL_EOF'
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('Free', 'Premium', 'Elite')),
  status TEXT NOT NULL CHECK (status IN ('active', 'trialing', 'past_due', 'canceled', 'incomplete', 'incomplete_expired', 'unpaid', 'paused')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_customer_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_customers_user_id ON customers(user_id);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_payment_intent_id TEXT UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);

-- Usage limits table
CREATE TABLE IF NOT EXISTS usage_limits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  workouts_this_week INTEGER DEFAULT 0,
  workout_limit INTEGER DEFAULT 3,
  ai_chats_today INTEGER DEFAULT 0,
  ai_chat_limit INTEGER DEFAULT 3,
  week_start_date DATE DEFAULT CURRENT_DATE,
  day_start_date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_limits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own customers" ON customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own usage" ON usage_limits
  FOR SELECT USING (auth.uid() = user_id);
SQL_EOF

echo -e "${GREEN}✅ Created database migration${NC}"

# Create webhook Edge Function
echo -e "\n${YELLOW}⚡ Creating Edge Functions...${NC}"
cat > supabase/functions/stripe-webhook/index.ts << 'WEBHOOK_EOF'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
  
  try {
    const body = await req.text()
    const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
    
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        await supabase.from('subscriptions').upsert({
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          user_id: subscription.metadata.userId,
          tier: getTierFromPrice(subscription.items.data[0].price.id),
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        })
        break
        
      case 'customer.subscription.deleted':
        await supabase
          .from('subscriptions')
          .update({ status: 'canceled', canceled_at: new Date().toISOString() })
          .eq('stripe_subscription_id', event.data.object.id)
        break
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

function getTierFromPrice(priceId: string): string {
  const map = {
    [Deno.env.get('STRIPE_PREMIUM_MONTHLY_PRICE_ID')!]: 'Premium',
    [Deno.env.get('STRIPE_PREMIUM_YEARLY_PRICE_ID')!]: 'Premium',
    [Deno.env.get('STRIPE_ELITE_MONTHLY_PRICE_ID')!]: 'Elite',
    [Deno.env.get('STRIPE_ELITE_YEARLY_PRICE_ID')!]: 'Elite',
  }
  return map[priceId] || 'Free'
}
WEBHOOK_EOF

echo -e "${GREEN}✅ Created webhook function${NC}"

echo -e "\n${GREEN}🎉 All files created successfully!${NC}"
echo ""
echo "Next steps:"
echo "1. Run: ${YELLOW}./setup-payment-system.sh${NC}"
echo "2. Follow the interactive setup"
echo "3. Deploy to Supabase"
echo "4. Configure Stripe webhooks"
echo ""
echo "Files created:"
echo "✓ setup-payment-system.sh"
echo "✓ supabase/migrations/20240101000000_create_payment_tables.sql"
echo "✓ supabase/functions/stripe-webhook/index.ts"
echo "✓ Directory structure for payment system"