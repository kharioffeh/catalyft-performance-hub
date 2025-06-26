
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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Not authenticated')
    }

    const { athlete_uuid, provider, code, apple_json } = await req.json()

    if (!athlete_uuid || !provider) {
      throw new Error('Missing required parameters')
    }

    if (provider === 'whoop') {
      if (!code) {
        throw new Error('Authorization code required for Whoop')
      }

      // Exchange code for tokens
      const tokenResponse = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: Deno.env.get('WHOOP_CLIENT_ID')!,
          client_secret: Deno.env.get('WHOOP_CLIENT_SECRET')!,
          code: code,
          redirect_uri: `${Deno.env.get('APP_URL')}/oauth/whoop`,
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error(`Token exchange failed: ${await tokenResponse.text()}`)
      }

      const tokenData = await tokenResponse.json()
      const expiresAt = new Date(Date.now() + (tokenData.expires_in * 1000))

      // Store tokens in wearable_tokens table
      const { error: tokenError } = await supabaseClient
        .from('wearable_tokens')
        .upsert({
          athlete_uuid: athlete_uuid,
          provider: 'whoop',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt.toISOString(),
          token_type: tokenData.token_type,
          scope: tokenData.scope,
        })

      if (tokenError) {
        throw new Error(`Database error: ${tokenError.message}`)
      }

      // Trigger backfill by calling pull-whoop-recovery function
      try {
        await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/pull-whoop-recovery`, {
          method: 'POST',
          headers: {
            'Authorization': req.headers.get('Authorization')!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ athlete_uuid }),
        })
      } catch (backfillError) {
        console.error('Backfill error (non-critical):', backfillError)
      }

    } else if (provider === 'apple') {
      if (!apple_json) {
        throw new Error('Apple Health data required')
      }

      // Store mock token for Apple Health
      const { error: tokenError } = await supabaseClient
        .from('wearable_tokens')
        .upsert({
          athlete_uuid: athlete_uuid,
          provider: 'apple',
          access_token: 'local_health_kit',
          token_type: 'local',
        })

      if (tokenError) {
        throw new Error(`Database error: ${tokenError.message}`)
      }

      // Parse and store Apple Health data (mock implementation)
      const healthData = JSON.parse(apple_json)
      const wearableData = []

      // Extract sleep data if available
      if (healthData.sleep) {
        for (const sleep of healthData.sleep) {
          wearableData.push({
            athlete_uuid: athlete_uuid,
            metric: 'total_sleep_hours',
            value: sleep.duration / 3600, // Convert seconds to hours
            ts: sleep.date,
          })
        }
      }

      // Extract HRV data if available
      if (healthData.hrv) {
        for (const hrv of healthData.hrv) {
          wearableData.push({
            athlete_uuid: athlete_uuid,
            metric: 'hrv_rmssd',
            value: hrv.value,
            ts: hrv.date,
          })
        }
      }

      // Insert wearable data
      if (wearableData.length > 0) {
        const { error: dataError } = await supabaseClient
          .from('wearable_raw')
          .insert(wearableData)

        if (dataError) {
          console.error('Error inserting Apple Health data:', dataError)
        }
      }
    }

    // Update athlete wearable_connected status
    const { error: updateError } = await supabaseClient
      .from('athletes')
      .update({ wearable_connected: true })
      .eq('id', athlete_uuid)

    if (updateError) {
      throw new Error(`Failed to update athlete status: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Wearable connected successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Solo link wearable error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
