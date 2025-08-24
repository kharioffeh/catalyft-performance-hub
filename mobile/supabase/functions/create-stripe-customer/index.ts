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
    // Get the authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Verify the user with Supabase
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    const { userId, email, metadata } = await req.json()

    // Verify the userId matches the authenticated user
    if (userId !== user.id) {
      throw new Error('User ID mismatch')
    }

    // Check if customer already exists
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (existingCustomer?.stripe_customer_id) {
      // Return existing customer
      return new Response(
        JSON.stringify({ 
          customerId: existingCustomer.stripe_customer_id,
          existing: true 
        }),
        { headers, status: 200 }
      )
    }

    // Create new Stripe customer
    const customer = await stripe.customers.create({
      email: email || user.email,
      metadata: {
        userId: userId,
        supabaseUserId: userId,
        ...metadata
      }
    })

    // Save to database
    const { error: dbError } = await supabase.from('customers').insert({
      stripe_customer_id: customer.id,
      user_id: userId,
      email: email || user.email,
      created_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error('Database error:', dbError)
      // Don't fail if database save fails - customer is created in Stripe
    }

    return new Response(
      JSON.stringify({ 
        customerId: customer.id,
        created: true 
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
