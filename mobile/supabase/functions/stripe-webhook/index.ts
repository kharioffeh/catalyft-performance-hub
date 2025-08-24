import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@13.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

serve(async (req: Request) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers })
  }

  try {
    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      throw new Error('No stripe signature header')
    }

    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    
    let event: Stripe.Event
    try {
      const cryptoProvider = Stripe.createSubtleCryptoProvider()
      event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      )
    } catch (err) {
      console.error('Webhook verification failed:', err.message)
      return new Response(
        JSON.stringify({ error: `Webhook Error: ${err.message}` }),
        { headers, status: 400 }
      )
    }

    console.log('✅ Webhook verified:', event.type)

    // Helper function for safe date conversion
    const toISOString = (timestamp: number | null | undefined) => {
      if (!timestamp) return null
      try {
        return new Date(timestamp * 1000).toISOString()
      } catch {
        return null
      }
    }

    switch (event.type) {
      case 'customer.created':
      case 'customer.updated': {
        const customer = event.data.object as Stripe.Customer
        console.log('Processing customer:', customer.id)
        
        // Use metadata userId or create test user
        const userId = customer.metadata?.userId || '00000000-0000-0000-0000-000000000000'
        
        // Upsert customer record
        const { error } = await supabase.from('customers').upsert({
          stripe_customer_id: customer.id,
          user_id: userId,
          email: customer.email || 'no-email@example.com',
          updated_at: new Date().toISOString(),
        })
        
        if (error) {
          console.error('Customer save error:', error)
        } else {
          console.log('✅ Customer saved')
        }
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        console.log('Processing subscription:', subscription.id)
        
        // Get or create customer first
        const customerId = subscription.customer as string
        const userId = subscription.metadata?.userId || '00000000-0000-0000-0000-000000000000'
        
        // Ensure customer exists
        const { error: customerError } = await supabase.from('customers').upsert({
          stripe_customer_id: customerId,
          user_id: userId,
          email: subscription.metadata?.email || 'subscription@example.com',
        })
        
        if (customerError) {
          console.error('Customer upsert error:', customerError)
        }
        
        // Save subscription
        const subscriptionData = {
          stripe_subscription_id: subscription.id,
          stripe_customer_id: customerId,
          user_id: userId,
          tier: 'Premium',
          status: subscription.status,
          current_period_start: toISOString(subscription.current_period_start),
          current_period_end: toISOString(subscription.current_period_end),
          cancel_at_period_end: subscription.cancel_at_period_end || false,
        }
        
        if (subscription.trial_start) {
          subscriptionData['trial_start'] = toISOString(subscription.trial_start)
        }
        if (subscription.trial_end) {
          subscriptionData['trial_end'] = toISOString(subscription.trial_end)
        }
        
        const { data, error } = await supabase
          .from('subscriptions')
          .upsert(subscriptionData)
          .select()
        
        if (error) {
          console.error('Subscription save error:', error)
          return new Response(
            JSON.stringify({ 
              received: true, 
              type: event.type,
              warning: 'Database save failed',
              error: error.message 
            }),
            { headers, status: 200 }
          )
        }
        
        console.log('✅ Subscription saved:', data)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Processing payment:', paymentIntent.id)
        
        const customerId = paymentIntent.customer as string
        const userId = paymentIntent.metadata?.userId || '00000000-0000-0000-0000-000000000000'
        
        // Ensure customer exists
        if (customerId) {
          await supabase.from('customers').upsert({
            stripe_customer_id: customerId,
            user_id: userId,
            email: paymentIntent.receipt_email || 'payment@example.com',
          })
        }
        
        // Save payment
        const { error } = await supabase.from('payments').insert({
          stripe_payment_intent_id: paymentIntent.id,
          user_id: userId,
          amount: (paymentIntent.amount / 100),
          currency: paymentIntent.currency,
          status: 'succeeded',
          description: paymentIntent.description || null,
        })
        
        if (error) {
          console.error('Payment save error:', error)
        } else {
          console.log('✅ Payment saved')
        }
        break
      }

      default:
        console.log(`Unhandled event: ${event.type}`)
    }

    return new Response(
      JSON.stringify({ 
        received: true, 
        type: event.type,
        message: 'Webhook processed successfully' 
      }),
      { headers, status: 200 }
    )

  } catch (error) {
    console.error('Webhook handler error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack 
      }),
      { headers, status: 500 }
    )
  }
})
