import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Service role for admin operations
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2022-11-15',
    })

    // Get all users whose trial ends today or has ended
    const trialEndDate = new Date()
    trialEndDate.setHours(23, 59, 59, 999) // End of today
    
    const { data: trialUsers, error: fetchError } = await supabaseClient
      .from('billing_customers')
      .select('*')
      .eq('plan_status', 'trialing')
      .lte('trial_end', trialEndDate.toISOString())
      .is('auto_subscription_opted_out', false) // Only users who haven't opted out

    if (fetchError) {
      throw fetchError
    }

    console.log(`Found ${trialUsers?.length || 0} users ready for auto-subscription`)

    const results = []

    for (const user of trialUsers || []) {
      try {
        // Check if user has a payment method on file
        const customer = await stripe.customers.retrieve(user.stripe_customer_id)
        
        if (customer.deleted) {
          console.log(`Customer ${user.id} is deleted, skipping`)
          continue
        }

        // Get customer's payment methods
        const paymentMethods = await stripe.paymentMethods.list({
          customer: user.stripe_customer_id,
          type: 'card',
        })

        if (paymentMethods.data.length === 0) {
          // No payment method - move to free tier
          await supabaseClient
            .from('billing_customers')
            .update({
              plan_status: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('id', user.id)

          results.push({
            userId: user.id,
            action: 'moved_to_free',
            reason: 'no_payment_method'
          })
          continue
        }

        // Determine price ID based on customer's currency preference
        // Note: In production, you'd want to store the user's currency preference
        // For now, we'll default to USD pricing for auto-conversions
        const priceId = Deno.env.get('STRIPE_PRICE_SOLO_MONTHLY_USD') || Deno.env.get('STRIPE_PRO_MONTHLY_PRICE_ID');

        // Create subscription with default Pro plan
        const subscription = await stripe.subscriptions.create({
          customer: user.stripe_customer_id,
          items: [
            {
              price: priceId,
            },
          ],
          default_payment_method: paymentMethods.data[0].id,
          expand: ['latest_invoice.payment_intent'],
        })

        // Update user record
        await supabaseClient
          .from('billing_customers')
          .update({
            stripe_subscription_id: subscription.id,
            plan_status: subscription.status === 'active' ? 'active' : subscription.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        results.push({
          userId: user.id,
          action: 'auto_subscribed',
          subscriptionId: subscription.id,
          status: subscription.status
        })

      } catch (userError) {
        console.error(`Error processing user ${user.id}:`, userError)
        
        // If subscription creation fails, move to free tier
        await supabaseClient
          .from('billing_customers')
          .update({
            plan_status: 'free',
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id)

        results.push({
          userId: user.id,
          action: 'moved_to_free',
          reason: 'subscription_failed',
          error: userError.message
        })
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: results.length,
        results: results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error in trial conversion:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})