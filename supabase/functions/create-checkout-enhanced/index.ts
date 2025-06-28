
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT-ENHANCED] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { plan_id, currency = 'GBP' } = await req.json();
    if (!plan_id) {
      throw new Error("plan_id is required");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email, planId: plan_id, currency });

    // Get plan details from database
    const { data: plan, error: planError } = await supabaseClient
      .from('plans')
      .select('*')
      .eq('id', plan_id)
      .single();

    if (planError || !plan) {
      throw new Error(`Invalid plan_id: ${plan_id}`);
    }

    logStep("Plan found", { planId: plan.id, label: plan.label, type: plan.type });

    // Base prices in GBP
    const basePrices: Record<string, number> = {
      'solo_basic': 7.99,
      'solo_pro': 14.99,
      'coach_basic': 29.99,
      'coach_pro': 49.99,
    };

    // Currency conversion rates (from GBP)
    const currencyRates: Record<string, number> = {
      'GBP': 1.0,
      'USD': 1.27,
      'EUR': 1.18,
      'CAD': 1.72,
      'AUD': 1.92,
      'JPY': 182,
      'CHF': 1.14,
      'SEK': 13.33,
      'NOK': 13.89,
      'DKK': 9.09,
      'SGD': 1.72,
      'HKD': 9.90,
      'NZD': 2.08,
      'ZAR': 22.73,
      'BRL': 7.69,
    };

    const basePriceGBP = basePrices[plan_id];
    if (!basePriceGBP) {
      throw new Error(`No pricing found for plan: ${plan_id}`);
    }

    const currencyRate = currencyRates[currency] || 1.0;
    const priceInCurrency = Math.round(basePriceGBP * currencyRate * 100); // Convert to cents

    logStep("Pricing calculated", { basePriceGBP, currency, rate: currencyRate, finalPrice: priceInCurrency });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    
    // Check if customer already exists
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          user_id: user.id,
        },
      });
      customerId = customer.id;
      logStep("Created new customer", { customerId });
    }

    // Update billing_customers with stripe_customer_id and plan_id
    const { error: updateError } = await supabaseClient
      .from('billing_customers')
      .upsert({
        id: user.id,
        stripe_customer_id: customerId,
        plan_id: plan_id,
        role: plan.type,
        preferred_currency: currency,
        trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan_status: 'trialing'
      }, { onConflict: 'id' });

    if (updateError) {
      logStep("Error updating billing_customers", { error: updateError });
    }

    // Store user currency preference
    const { error: currencyError } = await supabaseClient
      .from('user_currency_preferences')
      .upsert({
        user_id: user.id,
        currency_code: currency,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    if (currencyError) {
      logStep("Error updating currency preference", { error: currencyError });
    }

    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "http://localhost:3000";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: plan.label,
              description: `${plan.label} subscription - ${plan.type === 'coach' ? 'Team management and coaching tools' : 'Personal training optimization'}`,
            },
            unit_amount: priceInCurrency,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing`,
      metadata: {
        user_id: user.id,
        plan_id: plan_id,
        currency: currency,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout-enhanced", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
