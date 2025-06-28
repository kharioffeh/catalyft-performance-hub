
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[ADD-ATHLETE-TOPUP] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { athlete_pack_count = 1, currency = 'GBP' } = await req.json();

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

    logStep("User authenticated", { userId: user.id, email: user.email });

    // Check if user has Coach Pro plan and active subscription
    const { data: billing, error: billingError } = await supabaseClient
      .from('billing_customers')
      .select('*, plan:plans(*)')
      .eq('id', user.id)
      .single();

    if (billingError || !billing) {
      throw new Error("Billing information not found");
    }

    if (billing.plan_id !== 'coach_pro') {
      throw new Error("Athlete top-ups are only available for Coach Pro subscribers");
    }

    if (billing.plan_status !== 'active') {
      throw new Error("Subscription must be active to add athletes");
    }

    logStep("Billing verified", { planId: billing.plan_id, status: billing.plan_status });

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });

    if (!billing.stripe_subscription_id) {
      throw new Error("No active Stripe subscription found");
    }

    // Get subscription and add new line item
    const subscription = await stripe.subscriptions.retrieve(billing.stripe_subscription_id);
    logStep("Subscription retrieved", { subscriptionId: subscription.id });

    // Calculate pricing based on currency
    const basePriceGBP = 4.99; // £4.99 per 10-athlete pack
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

    const currencyRate = currencyRates[currency] || 1.0;
    const priceInCurrency = Math.round(basePriceGBP * currencyRate * 100); // Convert to cents

    // Add subscription item for athlete top-up
    const subscriptionItem = await stripe.subscriptionItems.create({
      subscription: billing.stripe_subscription_id,
      price_data: {
        currency: currency.toLowerCase(),
        product_data: {
          name: `Athlete Top-Up (${athlete_pack_count * 10} Athletes)`,
          description: `Additional ${athlete_pack_count * 10} athletes for Coach Pro subscription`,
        },
        unit_amount: priceInCurrency,
        recurring: {
          interval: 'month',
        },
      },
      quantity: athlete_pack_count,
      proration_behavior: 'create_prorations',
    });

    logStep("Subscription item added", { itemId: subscriptionItem.id, quantity: athlete_pack_count });

    // Update billing record
    const monthlyAddonCost = billing.monthly_addon_cost + (basePriceGBP * athlete_pack_count);
    const additionalAthletes = billing.additional_athletes_purchased + (athlete_pack_count * 10);

    const { error: updateError } = await supabaseClient
      .from('billing_customers')
      .update({
        additional_athletes_purchased: additionalAthletes,
        monthly_addon_cost: monthlyAddonCost,
      })
      .eq('id', user.id);

    if (updateError) {
      logStep("Error updating billing", { error: updateError });
      throw updateError;
    }

    // Record the purchase
    const { error: purchaseError } = await supabaseClient
      .from('athlete_purchases')
      .insert({
        user_id: user.id,
        billing_customer_id: user.id,
        athlete_pack_size: athlete_pack_count * 10,
        monthly_cost_added: basePriceGBP * athlete_pack_count,
        currency_code: currency,
        stripe_subscription_item_id: subscriptionItem.id,
      });

    if (purchaseError) {
      logStep("Error recording purchase", { error: purchaseError });
      // Don't throw here as the Stripe operation succeeded
    }

    logStep("Athlete top-up completed successfully", {
      athletesAdded: athlete_pack_count * 10,
      monthlyCostAdded: basePriceGBP * athlete_pack_count,
      currency: currency
    });

    return new Response(JSON.stringify({
      success: true,
      athletes_added: athlete_pack_count * 10,
      monthly_cost_added: basePriceGBP * athlete_pack_count,
      currency: currency,
      subscription_item_id: subscriptionItem.id
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in add-athlete-topup", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
