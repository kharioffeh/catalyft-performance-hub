import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req: Request) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { userId, customerId, priceId, paymentMethodId } = await req.json()

    // Verify userId matches authenticated user
    if (userId !== user.id) {
      throw new Error('User ID mismatch')
    }

    let stripeCustomerId = customerId

    // If no customerId provided, get or create it
    if (!stripeCustomerId) {
      const { data: customer } = await supabase
        .from('customers')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single()

      if (customer?.stripe_customer_id) {
        stripeCustomerId = customer.stripe_customer_id
      } else {
        // Create new customer
        const newCustomer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId: userId,
            supabaseUserId: userId,
          }
        })
        stripeCustomerId = newCustomer.id

        // Save to database
        await supabase.from('customers').insert({
          stripe_customer_id: stripeCustomerId,
          user_id: userId,
          email: user.email,
        })
      }
    }

    // Attach payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomerId,
      })
      
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      })
    }

    // Create subscription with trial
    const subscription = await stripe.subscriptions.create({
      customer: stripeCustomerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { 
        save_default_payment_method: 'on_subscription' 
      },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: getTrialDays(priceId), // 7 or 14 days based on tier
      metadata: {
        userId: userId,
        supabaseUserId: userId,
        priceId: priceId,
      }
    })

    // The webhook will handle saving to database
    // But we can also save immediately for better UX
    const tier = getTierFromPriceId(priceId)
    await supabase.from('subscriptions').upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: stripeCustomerId,
      user_id: userId,
      tier: tier,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
      trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
    })

    return new Response(
      JSON.stringify({ 
        subscriptionId: subscription.id,
        customerId: stripeCustomerId,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        status: subscription.status,
        tier: tier,
      }),
      { headers, status: 200 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers, status: 400 }
    )
  }
})

function getTrialDays(priceId: string): number {
  // Define your trial periods
  if (priceId.includes('premium')) return 7
  if (priceId.includes('elite')) return 14
  return 7 // default
}

function getTierFromPriceId(priceId: string): 'Premium' | 'Elite' {
  if (priceId.includes('elite')) return 'Elite'
  return 'Premium'
}
