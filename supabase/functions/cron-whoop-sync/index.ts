import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

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
    console.log('Starting daily WHOOP data sync...')
    
    // Call the WHOOP activity sync function
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error('Missing Supabase configuration')
    }
    
    const response = await fetch(`${supabaseUrl}/functions/v1/pull-whoop-activity`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`WHOOP sync failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('WHOOP sync completed:', result)

    return Response.json({
      success: true,
      message: 'Daily WHOOP sync completed successfully',
      result
    })

  } catch (error) {
    console.error('Cron WHOOP sync error:', error)
    return Response.json(
      { 
        success: false,
        error: error.message 
      },
      { status: 500, headers: corsHeaders }
    )
  }
})