
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[BILLING-WEBHOOK] ${step}${detailsStr}`);
};

serve(async (req) => {
  try {
    logStep("Webhook received");

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    
    if (!stripeKey || !webhookSecret) {
      throw new Error("Missing Stripe configuration");
    }

    const stripe = new Stripe(stripeKey, { apiVersion: "2023-10-16" });
    const signature = req.headers.get("stripe-signature");
    
    if (!signature) {
      throw new Error("No Stripe signature found");
    }

    const body = await req.text();
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      logStep("Webhook signature verification failed", { error: err.message });
      return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
    }

    logStep("Event received", { type: event.type, id: event.id });

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        logStep("Processing checkout completion", { sessionId: session.id });

        if (session.mode === 'subscription') {
          const userId = session.metadata?.user_id;
          const planId = session.metadata?.plan_id;
          
          if (!userId || !planId) {
            logStep("Missing metadata in session", { userId, planId });
            break;
          }

          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          
          await supabaseClient
            .from('billing_customers')
            .update({
              stripe_subscription_id: subscription.id,
              plan_status: 'active',
              plan_id: planId
            })
            .eq('id', userId);

          logStep("Billing updated for successful checkout", { userId, planId, subscriptionId: subscription.id });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing successful payment", { invoiceId: invoice.id });

        if (invoice.subscription) {
          await supabaseClient
            .from('billing_customers')
            .update({
              plan_status: 'active'
            })
            .eq('stripe_subscription_id', invoice.subscription);

          logStep("Billing status updated to active", { subscriptionId: invoice.subscription });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing payment failure", { invoiceId: invoice.id });

        if (invoice.subscription) {
          await supabaseClient
            .from('billing_customers')
            .update({
              plan_status: 'past_due'
            })
            .eq('stripe_subscription_id', invoice.subscription);

          logStep("Billing status updated to past_due", { subscriptionId: invoice.subscription });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription update", { subscriptionId: subscription.id });

        // Get the price ID to determine the new plan
        const priceId = subscription.items.data[0]?.price?.id;
        if (priceId) {
          // Find the plan by price_id
          const { data: plan } = await supabaseClient
            .from('plans')
            .select('id')
            .eq('price_id', priceId)
            .single();

          const status = subscription.status === 'active' ? 'active' : 
                        subscription.status === 'past_due' ? 'past_due' : 'canceled';

          const updateData: any = { plan_status: status };
          if (plan) {
            updateData.plan_id = plan.id;
          }

          await supabaseClient
            .from('billing_customers')
            .update(updateData)
            .eq('stripe_subscription_id', subscription.id);

          logStep("Subscription updated", { subscriptionId: subscription.id, status, planId: plan?.id });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription deletion", { subscriptionId: subscription.id });

        await supabaseClient
          .from('billing_customers')
          .update({
            plan_status: 'canceled'
          })
          .eq('stripe_subscription_id', subscription.id);

        logStep("Subscription status updated to canceled", { subscriptionId: subscription.id });
        break;
      }

      default:
        logStep("Unhandled event type", { type: event.type });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in webhook", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
