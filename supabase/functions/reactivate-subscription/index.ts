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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Set the auth token
    supabaseClient.auth.setSession({ access_token: token, refresh_token: '' })

    const { data: { user } } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('User not found')
    }

    const { userId } = await req.json()

    // Get user's billing record
    const { data: billing, error: billingError } = await supabaseClient
      .from('billing_customers')
      .select('stripe_subscription_id, plan_status')
      .eq('id', userId || user.id)
      .single()

    if (billingError || !billing?.stripe_subscription_id) {
      throw new Error('No subscription found')
    }

    if (billing.plan_status !== 'canceled') {
      throw new Error('Subscription is not canceled')
    }

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2022-11-15',
    })

    // Reactivate the subscription
    const subscription = await stripe.subscriptions.update(
      billing.stripe_subscription_id,
      {
        cancel_at_period_end: false,
      }
    )

    // Update billing record
    const { error: updateError } = await supabaseClient
      .from('billing_customers')
      .update({
        plan_status: 'active',
        subscription_end: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId || user.id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription reactivated successfully',
        subscription_status: subscription.status,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})