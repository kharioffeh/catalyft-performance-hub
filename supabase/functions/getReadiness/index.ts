import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { corsHeaders } from '../_shared/cors.ts'

// Helper function to clamp values between min and max
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow GET requests (no body needed, uses auth.uid())
    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check for auth token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader }
        }
      }
    )

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    // Query latest metric row for today (hrv_rmssd, sleep_min)
    // Health metrics are stored in metrics table where exercise is NULL
    const { data: metrics, error: metricsError } = await supabaseClient
      .from('metrics')
      .select('hrv_rmssd, sleep_min')
      .eq('user_id', user.id)
      .eq('date', today)
      .is('exercise', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (metricsError) {
      console.error('Metrics query error:', metricsError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch metrics data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Query soreness for today
    const { data: soreness, error: sorenessError } = await supabaseClient
      .from('soreness')
      .select('score')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()

    if (sorenessError) {
      console.error('Soreness query error:', sorenessError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch soreness data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Query jump_tests for today
    const { data: jumpTest, error: jumpError } = await supabaseClient
      .from('jump_tests')
      .select('height_cm')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle()

    if (jumpError) {
      console.error('Jump test query error:', jumpError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch jump test data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Extract values with defaults
    const hrv_rmssd = metrics?.hrv_rmssd ?? 0
    const sleep_min = metrics?.sleep_min ?? 0
    const soreness_score = soreness?.score ?? 10 // Default to highest soreness (worst case)
    const jump_cm = jumpTest?.height_cm ?? 0

    // Compute readiness_score using the provided formula
    const normHRV = clamp((hrv_rmssd / 100), 0, 1)
    const normSleep = clamp((sleep_min / 480), 0, 1)
    const normSoreness = clamp((10 - soreness_score) / 9, 0, 1) // lower soreness = higher norm
    const normJump = clamp((jump_cm / 50), 0, 1)
    
    const readiness_score = Math.round((normHRV * 0.25 + normSleep * 0.25 + normSoreness * 0.25 + normJump * 0.25) * 100)

    // Return JSON response
    return new Response(
      JSON.stringify({
        readiness_score,
        hrv_rmssd,
        sleep_min,
        soreness_score,
        jump_cm: Number(jump_cm) // Ensure it's a number
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Handle other errors
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})