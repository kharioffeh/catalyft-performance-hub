import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: user } = await supabase.auth.getUser(token)
    
    if (!user.user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { userId } = await req.json()

    if (userId !== user.user.id) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Collect user data from various tables
    const exportData: any = {
      user_info: {
        id: user.user.id,
        email: user.user.email,
        created_at: user.user.created_at,
        export_date: new Date().toISOString()
      },
      profile: null,
      sessions: [],
      readiness_scores: [],
      wearable_data: [],
      notification_preferences: []
    }

    // Get profile data
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    exportData.profile = profile

    // Get sessions data
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('athlete_uuid', userId)
      .order('start_ts', { ascending: false })
    
    exportData.sessions = sessions || []

    // Get readiness scores
    const { data: readiness } = await supabase
      .from('readiness_scores')
      .select('*')
      .eq('athlete_uuid', userId)
      .order('ts', { ascending: false })
      .limit(1000) // Limit to recent data
    
    exportData.readiness_scores = readiness || []

    // Get wearable data (last 90 days)
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    const { data: wearableData } = await supabase
      .from('wearable_raw')
      .select('*')
      .eq('athlete_uuid', userId)
      .gte('ts', ninetyDaysAgo.toISOString())
      .order('ts', { ascending: false })
    
    exportData.wearable_data = wearableData || []

    // Get notification preferences
    const { data: notificationPrefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('athlete_uuid', userId)
    
    exportData.notification_preferences = notificationPrefs || []

    return new Response(
      JSON.stringify(exportData),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Export error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})