
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { athleteId, dateRange } = await req.json()

    if (!athleteId) {
      return new Response(
        JSON.stringify({ error: 'athlete_id is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Calculate velocity metrics based on workout data
    const { data: sessions, error: sessionsError } = await supabaseClient
      .from('athlete_sessions')
      .select('*')
      .eq('athlete_uuid', athleteId)
      .gte('session_date', dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .lte('session_date', dateRange?.end || new Date().toISOString())

    if (sessionsError) {
      throw sessionsError
    }

    // Calculate velocity metrics
    const totalSessions = sessions?.length || 0
    const totalVolume = sessions?.reduce((sum, session) => sum + (session.volume || 0), 0) || 0
    const averageIntensity = sessions?.length > 0 
      ? sessions.reduce((sum, session) => sum + (session.intensity || 0), 0) / sessions.length
      : 0

    // Calculate training velocity (sessions per week)
    const daysCovered = dateRange 
      ? Math.ceil((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / (1000 * 60 * 60 * 24))
      : 30
    const sessionsPerWeek = (totalSessions / daysCovered) * 7

    // Calculate volume velocity (volume per week)
    const volumePerWeek = (totalVolume / daysCovered) * 7

    const velocityMetrics = {
      athlete_id: athleteId,
      date_calculated: new Date().toISOString(),
      sessions_per_week: sessionsPerWeek,
      volume_per_week: volumePerWeek,
      average_intensity: averageIntensity,
      total_sessions: totalSessions,
      total_volume: totalVolume,
      period_days: daysCovered
    }

    return new Response(
      JSON.stringify(velocityMetrics),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
