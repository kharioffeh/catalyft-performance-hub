import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, userId, paymentMethodId, promoCode, trialFromPlan } = await req.json()

    // Get or create customer
    let customerId: string
    
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (existingCustomer?.stripe_customer_id) {
      customerId = existingCustomer.stripe_customer_id
    } else {
      // Get user email
      const { data: userData } = await supabase.auth.admin.getUserById(userId)
      
      // Create new customer with metadata
      const customer = await stripe.customers.create({
        email: userData.user?.email,
        metadata: {
          userId: userId,  // ⭐ Critical metadata for webhook processing
          source: 'mobile_app',
        },
      })
      
      customerId = customer.id
      
      // Store in database
      await supabase.from('customers').insert({
        stripe_customer_id: customer.id,
        user_id: userId,
        email: userData.user?.email,
      })
    }

    // Attach payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      })
      
      // Set as default payment method
      await stripe.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      })
    }

    // Apply promo code if provided
    let promotionCode: string | undefined
    if (promoCode) {
      const promotionCodes = await stripe.promotionCodes.list({
        code: promoCode,
        active: true,
        limit: 1,
      })
      
      if (promotionCodes.data.length > 0) {
        promotionCode = promotionCodes.data[0].id
      }
    }

    // Create subscription with metadata
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { 
        save_default_payment_method: 'on_subscription' 
      },
      expand: ['latest_invoice.payment_intent'],
      trial_from_plan: trialFromPlan,
      promotion_code: promotionCode,
      metadata: {
        userId: userId,  // ⭐ This ensures webhooks can identify the user
        priceId: priceId,
        source: 'mobile_app',
        promoCode: promoCode || '',
      },
    })

    // Get tier from price ID
    const tier = getTierFromPriceId(priceId)

    // Store subscription in database
    await supabase.from('subscriptions').upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: customerId,
      user_id: userId,
      tier: tier,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_start: subscription.trial_start 
        ? new Date(subscription.trial_start * 1000).toISOString() 
        : null,
      trial_end: subscription.trial_end 
        ? new Date(subscription.trial_end * 1000).toISOString() 
        : null,
    })

    return new Response(
      JSON.stringify({ 
        subscription: {
          id: subscription.id,
          tier: tier,
          status: subscription.status,
          trialEnd: subscription.trial_end,
        },
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
        success: true,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Subscription creation error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

function getTierFromPriceId(priceId: string): 'Free' | 'Premium' | 'Elite' {
  const tierMap: Record<string, 'Premium' | 'Elite'> = {
    [Deno.env.get('STRIPE_PREMIUM_MONTHLY_PRICE_ID') || '']: 'Premium',
    [Deno.env.get('STRIPE_PREMIUM_YEARLY_PRICE_ID') || '']: 'Premium',
    [Deno.env.get('STRIPE_ELITE_MONTHLY_PRICE_ID') || '']: 'Elite',
    [Deno.env.get('STRIPE_ELITE_YEARLY_PRICE_ID') || '']: 'Elite',
  }
  
  return tierMap[priceId] || 'Free'
}