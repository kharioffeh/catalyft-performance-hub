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
    const { email, userId, name, phone } = await req.json()

    // Create Stripe customer with metadata
    const customer = await stripe.customers.create({
      email,
      name,
      phone,
      metadata: {
        userId: userId,  // ⭐ This links Stripe customer to your database user
        source: 'mobile_app',
        created_at: new Date().toISOString(),
      },
    })

    // Store in database
    await supabase.from('customers').upsert({
      stripe_customer_id: customer.id,
      user_id: userId,
      email: email,
      created_at: new Date().toISOString(),
    })

    return new Response(
      JSON.stringify({ 
        customerId: customer.id,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})