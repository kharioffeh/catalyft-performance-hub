
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhoopTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  scope: string
}

async function exchangeWhoopToken(code: string): Promise<WhoopTokenResponse> {
  const clientId = Deno.env.get('WHOOP_CLIENT_ID')
  const clientSecret = Deno.env.get('WHOOP_CLIENT_SECRET')
  const redirectUri = 'https://xeugyryfvilanoiethum.supabase.co/functions/v1/solo-link-wearable/whoop-callback'

  if (!clientId || !clientSecret) {
    throw new Error('Whoop credentials not configured')
  }

  const response = await fetch('https://api.prod.whoop.com/oauth/oauth2/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  })

  if (!response.ok) {
    throw new Error(`Whoop token exchange failed: ${response.statusText}`)
  }

  return await response.json()
}

async function backfillWhoopData(supabase: any, athleteUuid: string, accessToken: string) {
  try {
    // Get last 30 days of recovery data
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30)

    const recoveryResponse = await fetch(
      `https://api.prod.whoop.com/developer/v1/recovery?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (recoveryResponse.ok) {
      const recoveryData = await recoveryResponse.json()
      
      for (const recovery of recoveryData.records || []) {
        const recoveryDate = new Date(recovery.cycle_id)
        
        // Insert HRV data
        if (recovery.score?.hrv_rmssd_milli) {
          await supabase.from('wearable_raw').insert({
            athlete_uuid: athleteUuid,
            metric: 'hrv_rmssd',
            value: recovery.score.hrv_rmssd_milli,
            ts: recoveryDate.toISOString(),
          })
        }

        // Insert recovery score
        if (recovery.score?.recovery_score) {
          await supabase.from('wearable_raw').insert({
            athlete_uuid: athleteUuid,
            metric: 'recovery_score',
            value: recovery.score.recovery_score,
            ts: recoveryDate.toISOString(),
          })
        }
      }
    }

    // Get sleep data
    const sleepResponse = await fetch(
      `https://api.prod.whoop.com/developer/v1/activity/sleep?start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    )

    if (sleepResponse.ok) {
      const sleepData = await sleepResponse.json()
      
      for (const sleep of sleepData.records || []) {
        const sleepDate = new Date(sleep.start)
        
        // Insert sleep efficiency
        if (sleep.score?.sleep_efficiency_percentage) {
          await supabase.from('wearable_raw').insert({
            athlete_uuid: athleteUuid,
            metric: 'sleep_efficiency',
            value: sleep.score.sleep_efficiency_percentage,
            ts: sleepDate.toISOString(),
          })
        }

        // Insert total sleep time
        if (sleep.score?.sleep_duration_milli) {
          await supabase.from('wearable_raw').insert({
            athlete_uuid: athleteUuid,
            metric: 'sleep_duration',
            value: sleep.score.sleep_duration_milli / (1000 * 60 * 60), // Convert to hours
            ts: sleepDate.toISOString(),
          })
        }
      }
    }

    console.log(`Backfilled Whoop data for athlete ${athleteUuid}`)
  } catch (error) {
    console.error('Error backfilling Whoop data:', error)
  }
}

async function backfillAppleHealthData(supabase: any, athleteUuid: string, appleData: any) {
  try {
    // Parse Apple Health export JSON and insert relevant metrics
    const healthData = Array.isArray(appleData) ? appleData : appleData.data || []
    
    for (const record of healthData) {
      if (record.type === 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN') {
        await supabase.from('wearable_raw').insert({
          athlete_uuid: athleteUuid,
          metric: 'hrv_rmssd',
          value: parseFloat(record.value),
          ts: record.startDate,
        })
      } else if (record.type === 'HKCategoryTypeIdentifierSleepAnalysis') {
        const duration = (new Date(record.endDate).getTime() - new Date(record.startDate).getTime()) / (1000 * 60 * 60)
        await supabase.from('wearable_raw').insert({
          athlete_uuid: athleteUuid,
          metric: 'sleep_duration',
          value: duration,
          ts: record.startDate,
        })
      }
    }
    
    console.log(`Backfilled Apple Health data for athlete ${athleteUuid}`)
  } catch (error) {
    console.error('Error backfilling Apple Health data:', error)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { athlete_uuid, provider, code, apple_data } = await req.json()

    if (!athlete_uuid || !provider) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (provider === 'whoop') {
      if (!code) {
        return new Response(
          JSON.stringify({ error: 'Authorization code required for Whoop' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Exchange code for tokens
      const tokens = await exchangeWhoopToken(code)
      const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

      // Store tokens
      await supabaseClient.from('wearable_tokens').upsert({
        athlete_uuid,
        provider: 'whoop',
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: expiresAt,
        token_type: tokens.token_type,
        scope: tokens.scope,
        updated_at: new Date().toISOString(),
      })

      // Backfill data
      await backfillWhoopData(supabaseClient, athlete_uuid, tokens.access_token)

    } else if (provider === 'apple') {
      // Store Apple Health token (mock for now)
      await supabaseClient.from('wearable_tokens').upsert({
        athlete_uuid,
        provider: 'apple',
        access_token: 'local',
        updated_at: new Date().toISOString(),
      })

      // Backfill Apple Health data
      if (apple_data) {
        await backfillAppleHealthData(supabaseClient, athlete_uuid, apple_data)
      }
    }

    // Update athlete's wearable_connected status
    await supabaseClient
      .from('athletes')
      .update({ wearable_connected: true })
      .eq('id', athlete_uuid)

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in solo-link-wearable:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
