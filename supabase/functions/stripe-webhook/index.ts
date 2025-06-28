
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
          const currency = session.metadata?.currency || 'GBP';
          
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
              plan_id: planId,
              preferred_currency: currency
            })
            .eq('id', userId);

          // Update user currency preference
          await supabaseClient
            .from('user_currency_preferences')
            .upsert({
              user_id: userId,
              currency_code: currency,
              updated_at: new Date().toISOString(),
            }, { onConflict: 'user_id' });

          logStep("Billing updated for successful checkout", { userId, planId, subscriptionId: subscription.id, currency });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        logStep("Processing successful payment", { invoiceId: invoice.id });

        if (invoice.subscription) {
          // Update billing status to active
          await supabaseClient
            .from('billing_customers')
            .update({
              plan_status: 'active'
            })
            .eq('stripe_subscription_id', invoice.subscription);

          // Check if this is a recurring athlete top-up charge
          for (const lineItem of invoice.lines.data) {
            if (lineItem.description?.includes('Athlete Top-Up')) {
              const quantity = lineItem.quantity || 1;
              const athletesAdded = quantity * 10; // Each pack is 10 athletes
              
              logStep("Processing athlete top-up payment", { 
                athletesAdded, 
                amount: lineItem.amount,
                currency: invoice.currency?.toUpperCase()
              });

              // Update athlete purchase record as paid/active
              await supabaseClient
                .from('athlete_purchases')
                .update({ is_active: true })
                .eq('stripe_subscription_item_id', lineItem.subscription_item || '');
            }
          }

          logStep("Invoice payment processed", { subscriptionId: invoice.subscription });
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

        // Calculate total athletes from all subscription items
        let totalAdditionalAthletes = 0;
        let totalAddonCost = 0;

        for (const item of subscription.items.data) {
          const price = await stripe.prices.retrieve(item.price.id);
          
          // Check if this is an athlete top-up item
          if (price.nickname?.includes('Athlete Top-Up') || 
              (item.price.product as any)?.name?.includes('Athlete Top-Up')) {
            const quantity = item.quantity || 1;
            totalAdditionalAthletes += quantity * 10; // Each pack is 10 athletes
            totalAddonCost += (price.unit_amount || 0) / 100 * quantity; // Convert from cents
          }
        }

        // Get the main plan price ID to determine the new plan
        const mainPriceId = subscription.items.data[0]?.price?.id;
        if (mainPriceId) {
          // Find the plan by price_id
          const { data: plan } = await supabaseClient
            .from('plans')
            .select('id')
            .eq('price_id', mainPriceId)
            .single();

          const status = subscription.status === 'active' ? 'active' : 
                        subscription.status === 'past_due' ? 'past_due' : 'canceled';

          const updateData: any = { 
            plan_status: status,
            additional_athletes_purchased: totalAdditionalAthletes,
            monthly_addon_cost: totalAddonCost
          };
          
          if (plan) {
            updateData.plan_id = plan.id;
          }

          await supabaseClient
            .from('billing_customers')
            .update(updateData)
            .eq('stripe_subscription_id', subscription.id);

          logStep("Subscription updated", { 
            subscriptionId: subscription.id, 
            status, 
            planId: plan?.id,
            additionalAthletes: totalAdditionalAthletes,
            addonCost: totalAddonCost
          });
        }
        break;
      }

      case 'customer.subscription_item.created': {
        const subscriptionItem = event.data.object as Stripe.SubscriptionItem;
        logStep("Processing subscription item creation", { itemId: subscriptionItem.id });

        const price = await stripe.prices.retrieve(subscriptionItem.price.id);
        
        // Check if this is an athlete top-up item
        if (price.nickname?.includes('Athlete Top-Up') || 
            (subscriptionItem.price.product as any)?.name?.includes('Athlete Top-Up')) {
          
          const subscription = await stripe.subscriptions.retrieve(subscriptionItem.subscription);
          const { data: billing } = await supabaseClient
            .from('billing_customers')
            .select('id')
            .eq('stripe_subscription_id', subscription.id)
            .single();

          if (billing) {
            const quantity = subscriptionItem.quantity || 1;
            const athletesAdded = quantity * 10;
            const costPerPack = (price.unit_amount || 0) / 100; // Convert from cents

            // Record the athlete purchase
            await supabaseClient
              .from('athlete_purchases')
              .insert({
                user_id: billing.id,
                billing_customer_id: billing.id,
                athlete_pack_size: athletesAdded,
                monthly_cost_added: costPerPack * quantity,
                currency_code: price.currency?.toUpperCase() || 'GBP',
                stripe_subscription_item_id: subscriptionItem.id,
                is_active: true
              });

            logStep("Athlete purchase recorded", { 
              userId: billing.id,
              athletesAdded,
              monthlyCost: costPerPack * quantity
            });
          }
        }
        break;
      }

      case 'customer.subscription_item.deleted': {
        const subscriptionItem = event.data.object as Stripe.SubscriptionItem;
        logStep("Processing subscription item deletion", { itemId: subscriptionItem.id });

        // Mark athlete purchase as inactive
        await supabaseClient
          .from('athlete_purchases')
          .update({ is_active: false })
          .eq('stripe_subscription_item_id', subscriptionItem.id);

        // Recalculate billing totals for the subscription
        const subscription = await stripe.subscriptions.retrieve(subscriptionItem.subscription);
        let totalAdditionalAthletes = 0;
        let totalAddonCost = 0;

        for (const item of subscription.items.data) {
          const price = await stripe.prices.retrieve(item.price.id);
          
          if (price.nickname?.includes('Athlete Top-Up')) {
            const quantity = item.quantity || 1;
            totalAdditionalAthletes += quantity * 10;
            totalAddonCost += (price.unit_amount || 0) / 100 * quantity;
          }
        }

        await supabaseClient
          .from('billing_customers')
          .update({
            additional_athletes_purchased: totalAdditionalAthletes,
            monthly_addon_cost: totalAddonCost
          })
          .eq('stripe_subscription_id', subscription.id);

        logStep("Subscription item deletion processed", { 
          subscriptionId: subscription.id,
          remainingAthletes: totalAdditionalAthletes,
          remainingCost: totalAddonCost
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        logStep("Processing subscription deletion", { subscriptionId: subscription.id });

        // Mark all athlete purchases as inactive
        await supabaseClient
          .from('athlete_purchases')
          .update({ is_active: false })
          .eq('billing_customer_id', (
            await supabaseClient
              .from('billing_customers')
              .select('id')
              .eq('stripe_subscription_id', subscription.id)
              .single()
          ).data?.id);

        await supabaseClient
          .from('billing_customers')
          .update({
            plan_status: 'canceled',
            additional_athletes_purchased: 0,
            monthly_addon_cost: 0
          })
          .eq('stripe_subscription_id', subscription.id);

        logStep("Subscription deleted and billing reset", { subscriptionId: subscription.id });
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
