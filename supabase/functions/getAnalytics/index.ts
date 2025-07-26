import { serve } from 'https://deno.land/std@0.193.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Bootstrap Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { 
        global: { 
          headers: { 
            Authorization: req.headers.get('Authorization')! 
          } 
        } 
      }
    )

    // Auth guard - must be logged in
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 1. Query tonnage data
    const { data: tonnageData, error: tonnageError } = await supabase
      .rpc('get_tonnage_data', { user_id: user.id })

    if (tonnageError) {
      console.error('Tonnage query error:', tonnageError)
      throw tonnageError
    }

    // 2. Query e1RM curves data
    const { data: e1rmData, error: e1rmError } = await supabase
      .rpc('get_e1rm_data', { user_id: user.id })

    if (e1rmError) {
      console.error('e1RM query error:', e1rmError)
      throw e1rmError
    }

    // 3. Query velocity-fatigue data
    const { data: velocityFatigueData, error: velocityFatigueError } = await supabase
      .rpc('get_velocity_fatigue_data', { user_id: user.id })

    if (velocityFatigueError) {
      console.error('Velocity-fatigue query error:', velocityFatigueError)
      throw velocityFatigueError
    }

    // 4. Query muscle load data
    const { data: muscleLoadData, error: muscleLoadError } = await supabase
      .from('muscle_load_daily')
      .select('*')
      .eq('user_id', user.id)
      .order('date')

    if (muscleLoadError) {
      console.error('Muscle load query error:', muscleLoadError)
      throw muscleLoadError
    }

    // Return all four data series
    return new Response(
      JSON.stringify({
        tonnage: tonnageData || [],
        e1rmCurve: e1rmData || [],
        velocityFatigue: velocityFatigueData || [],
        muscleLoad: muscleLoadData || []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('getAnalytics error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})