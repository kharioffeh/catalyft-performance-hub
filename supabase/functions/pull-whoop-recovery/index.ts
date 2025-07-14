
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
// @deno-types="https://esm.sh/dayjs@1.11.10/index.d.ts"
import dayjs from 'https://esm.sh/dayjs@1.11.10'
// @deno-types="https://esm.sh/dayjs@1.11.10/plugin/utc.d.ts"
import utc from 'https://esm.sh/dayjs@1.11.10/plugin/utc'

// Extend dayjs with UTC plugin
dayjs.extend(utc)

interface WhoopToken {
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
}

interface WhoopRecoveryResponse {
  records: Array<{
    cycle_id: number
    sleep_id: string
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

interface WhoopRecoveryRecord {
  user_id: string
  recovery_date: string
  recovery_score: number
  resting_heart_rate: number
  hrv_rmssd_milli: number
  spo2_percentage: number
  skin_temp_celsius: number
  user_calibrating: boolean
}

async function fetchWhoopRecovery(accessToken: string, date: string): Promise<WhoopRecoveryResponse> {
  const url = `https://api.prod.whoop.com/metrics/recovery?start=${date}&end=${date}`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Whoop API error: ${response.status} ${await response.text()}`)
  }

  return await response.json()
}

async function processAthleteRecovery(
  supabaseClient: any,
  token: WhoopToken,
  targetDate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if token is expired
    if (new Date(token.expires_at) <= new Date()) {
      throw new Error(`Token expired for user ${token.user_id}`)
    }

    // Fetch recovery data for the target date
    const recoveryData = await fetchWhoopRecovery(token.access_token, targetDate)

    // Process the recovery data
    if (recoveryData.records && recoveryData.records.length > 0) {
      const recovery = recoveryData.records[0] // Take the first (most recent) record
      
      if (recovery.score_state === 'SCORED' && recovery.score) {
        const recoveryRecord: WhoopRecoveryRecord = {
          user_id: token.user_id,
          recovery_date: targetDate,
          recovery_score: recovery.score.recovery_score,
          resting_heart_rate: recovery.score.resting_heart_rate,
          hrv_rmssd_milli: recovery.score.hrv_rmssd_milli,
          spo2_percentage: recovery.score.spo2_percentage,
          skin_temp_celsius: recovery.score.skin_temp_celsius,
          user_calibrating: recovery.score.user_calibrating
        }

        // Upsert into whoop_recovery table
        const { error: upsertError } = await supabaseClient
          .from('whoop_recovery')
          .upsert(recoveryRecord, {
            onConflict: 'user_id,recovery_date',
            ignoreDuplicates: false,
          })

        if (upsertError) {
          throw new Error(`Database upsert error: ${upsertError.message}`)
        }
      } else {
        throw new Error(`Recovery data not scored for user ${token.user_id}`)
      }
    } else {
      throw new Error(`No recovery data found for user ${token.user_id} on ${targetDate}`)
    }

    return { success: true }
  } catch (error) {
    console.error(`Error processing athlete ${token.user_id}:`, error)
    return { success: false, error: error.message }
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Calculate yesterday's date in UTC
    const yesterday = dayjs().utc().subtract(1, 'day').format('YYYY-MM-DD')

    // Get all athletes with non-expired Whoop tokens
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('whoop_tokens')
      .select('user_id, access_token, refresh_token, expires_at')
      .gt('expires_at', new Date().toISOString())

    if (tokensError) {
      throw new Error(`Failed to fetch whoop tokens: ${tokensError.message}`)
    }

    if (!tokens || tokens.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No non-expired Whoop tokens found',
          pulled: 0,
          errors: 0,
          date: yesterday
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Process all athletes in parallel using Promise.allSettled
    const results = await Promise.allSettled(
      tokens.map(token => processAthleteRecovery(supabaseClient, token, yesterday))
    )

    // Count successful and failed results
    let pulled = 0
    let errors = 0

    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value.success) {
        pulled++
      } else {
        errors++
        if (result.status === 'rejected') {
          console.error('Promise rejected:', result.reason)
        } else if (result.status === 'fulfilled' && !result.value.success) {
          console.error('Processing failed:', result.value.error)
        }
      }
    })

    // Log summary
    console.log(`Whoop recovery import summary: { pulled: ${pulled}, errors: ${errors} }`)

    return new Response(
      JSON.stringify({ 
        message: `Processed ${tokens.length} athletes for ${yesterday}`,
        pulled,
        errors,
        date: yesterday
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Pull Whoop recovery error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        pulled: 0,
        errors: 1
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
