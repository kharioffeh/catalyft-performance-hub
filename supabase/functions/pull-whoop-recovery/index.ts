
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhoopRecoveryData {
  data: Array<{
    cycle_id: number
    sleep_id: number
    user_id: number
    created_at: string
    updated_at: string
    score_state: string
    score: {
      user_calibrating: boolean
      recovery_score: number
      resting_heart_rate: number
      hrv_rmssd_milli: number
      spo2_percentage: number
      skin_temp_celsius: number
    }
  }>
}

async function refreshToken(supabaseClient: any, athleteId: string, refreshToken: string) {
  const tokenResponse = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: Deno.env.get('WHOOP_CLIENT_ID')!,
      client_secret: Deno.env.get('WHOOP_CLIENT_SECRET')!,
      refresh_token: refreshToken,
    }),
  })

  if (!tokenResponse.ok) {
    throw new Error(`Token refresh failed: ${await tokenResponse.text()}`)
  }

  const tokenData = await tokenResponse.json()
  const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))

  await supabaseClient
    .from('whoop_tokens')
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('athlete_uuid', athleteId)

  return tokenData.access_token
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { athlete_id } = await req.json()

    if (!athlete_id) {
      throw new Error('athlete_id is required')
    }

    // Get stored tokens
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('whoop_tokens')
      .select('*')
      .eq('athlete_uuid', athlete_id)
      .single()

    if (tokenError || !tokenData) {
      throw new Error('No WHOOP tokens found for athlete')
    }

    let accessToken = tokenData.access_token

    // Check if token needs refresh
    if (tokenData.expires_at && new Date(tokenData.expires_at) <= new Date()) {
      if (!tokenData.refresh_token) {
        throw new Error('Token expired and no refresh token available')
      }
      accessToken = await refreshToken(supabaseClient, athlete_id, tokenData.refresh_token)
    }

    // Calculate date range (last 30 days)
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000))

    // Fetch recovery data from WHOOP API
    const recoveryUrl = `https://api.prod.whoop.com/developer/v1/recovery?start=${startDate.toISOString()}&end=${endDate.toISOString()}`
    
    const recoveryResponse = await fetch(recoveryUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!recoveryResponse.ok) {
      throw new Error(`WHOOP API error: ${recoveryResponse.status} ${await recoveryResponse.text()}`)
    }

    const recoveryData: WhoopRecoveryData = await recoveryResponse.json()

    // Map WHOOP data to wearable_raw format
    const wearableData = []
    
    for (const recovery of recoveryData.data) {
      const timestamp = recovery.created_at
      
      // Add each metric as separate rows
      if (recovery.score?.recovery_score !== undefined) {
        wearableData.push({
          athlete_uuid: athlete_id,
          ts: timestamp,
          metric: 'recovery_score',
          value: recovery.score.recovery_score,
        })
      }
      
      if (recovery.score?.resting_heart_rate !== undefined) {
        wearableData.push({
          athlete_uuid: athlete_id,
          ts: timestamp,
          metric: 'resting_heart_rate',
          value: recovery.score.resting_heart_rate,
        })
      }
      
      if (recovery.score?.hrv_rmssd_milli !== undefined) {
        wearableData.push({
          athlete_uuid: athlete_id,
          ts: timestamp,
          metric: 'hrv_rmssd',
          value: recovery.score.hrv_rmssd_milli,
        })
      }
      
      if (recovery.score?.spo2_percentage !== undefined) {
        wearableData.push({
          athlete_uuid: athlete_id,
          ts: timestamp,
          metric: 'spo2',
          value: recovery.score.spo2_percentage,
        })
      }
      
      if (recovery.score?.skin_temp_celsius !== undefined) {
        wearableData.push({
          athlete_uuid: athlete_id,
          ts: timestamp,
          metric: 'skin_temperature',
          value: recovery.score.skin_temp_celsius,
        })
      }
    }

    // Upsert data into wearable_raw table
    if (wearableData.length > 0) {
      const { error: upsertError } = await supabaseClient
        .from('wearable_raw')
        .upsert(wearableData, {
          onConflict: 'athlete_uuid,ts,metric',
          ignoreDuplicates: false,
        })

      if (upsertError) {
        throw new Error(`Database upsert error: ${upsertError.message}`)
      }
    }

    return new Response(
      JSON.stringify({ 
        message: 'Recovery data synced successfully',
        records_processed: wearableData.length,
        athlete_id: athlete_id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('WHOOP recovery sync error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
