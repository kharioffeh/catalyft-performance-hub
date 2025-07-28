
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    logStep("Function started");

    const { plan, currency } = await req.json();
    if (!plan || (plan !== 'monthly' && plan !== 'yearly')) {
      throw new Error("plan is required and must be 'monthly' or 'yearly'");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }

    // Determine currency and price ID based on user location
    let priceId: string;
    
    if (currency === 'GBP') {
      // UK pricing - £9.99
      priceId = plan === 'yearly'
        ? Deno.env.get("STRIPE_PRICE_SOLO_YEARLY_GBP") || ''
        : Deno.env.get("STRIPE_PRICE_SOLO_MONTHLY_GBP") || '';
    } else {
      // International pricing - $13.99
      priceId = plan === 'yearly'
        ? Deno.env.get("STRIPE_PRICE_SOLO_YEARLY_USD") || ''
        : Deno.env.get("STRIPE_PRICE_SOLO_MONTHLY_USD") || '';
    }

    if (!priceId) {
      throw new Error(`Missing Stripe price ID for ${plan} plan in ${currency || 'USD'}`);
    }

    logStep("Price selected", { plan, currency: currency || 'USD', priceId });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    if (!user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    logStep("User authenticated", { userId: user.id, email: user.email, plan });

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

    // Update billing_customers with stripe_customer_id
    const { error: updateError } = await supabaseClient
      .from('billing_customers')
      .upsert({
        id: user.id,
        stripe_customer_id: customerId,
        role: 'solo',
        trial_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan_status: 'trialing'
      });

    if (updateError) {
      logStep("Error updating billing_customers", { error: updateError });
    }

    const origin = req.headers.get("origin") || Deno.env.get("SITE_URL") || "http://localhost:3000";
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing`,
      metadata: {
        user_id: user.id,
        plan: plan,
      },
    });

    logStep("Checkout session created", { sessionId: session.id, url: session.url, priceId });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
