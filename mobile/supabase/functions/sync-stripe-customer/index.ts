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
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/json',
  }

  try {
    const { customerId } = await req.json()
    
    // Fetch customer from Stripe
    const customer = await stripe.customers.retrieve(customerId)
    
    if (customer.deleted) {
      throw new Error('Customer deleted in Stripe')
    }
    
    // Update customer in database
    const { data, error } = await supabase.from('customers').upsert({
      stripe_customer_id: customer.id,
      user_id: customer.metadata?.userId || '00000000-0000-0000-0000-000000000000',
      email: customer.email || 'no-email@stripe.com',
      updated_at: new Date().toISOString(),
    }).select()
    
    if (error) throw error
    
    return new Response(
      JSON.stringify({ 
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          created: customer.created,
          metadata: customer.metadata
        },
        saved: data
      }),
      { headers, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers, status: 400 }
    )
  }
})
