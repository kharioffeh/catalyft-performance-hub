
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface WhoopRecoveryData {
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

interface WhoopCycleData {
  records: Array<{
    id: number
    user_id: number
    created_at: string
    updated_at: string
    start: string
    end: string
    timezone_offset: string
    score_state: string
    score: {
      strain: number
      kilojoule: number
      average_heart_rate: number
      max_heart_rate: number
    }
  }>
}

interface WhoopSleepData {
  records: Array<{
    id: string
    user_id: number
    created_at: string
    updated_at: string
    start: string
    end: string
    timezone_offset: string
    nap: boolean
    score_state: string
    score: {
      stage_summary: {
        total_in_bed_time_milli: number
        total_awake_time_milli: number
        total_light_sleep_time_milli: number
        total_slow_wave_sleep_time_milli: number
        total_rem_sleep_time_milli: number
      }
      sleep_performance_percentage: number
      sleep_efficiency_percentage: number
    }
  }>
}

interface MetricData {
  user_id: string
  date: string
  hrv_rmssd?: number
  hr_rest?: number
  sleep_min?: number
  strain?: number
}

async function refreshWhoopToken(supabaseClient: any, athleteUuid: string, refreshToken: string): Promise<string> {
  const tokenResponse = await fetch('https://api.prod.whoop.com/oauth/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-WHOOP-CLIENT': Deno.env.get('WHOOP_CLIENT_ID')!,
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

  // Update the token in the database
  await supabaseClient
    .from('wearable_tokens')
    .update({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('athlete_uuid', athleteUuid)

  return tokenData.access_token
}

async function fetchWhoopData(accessToken: string, endpoint: string, startDate: string, endDate: string) {
  const url = `https://api.prod.whoop.com/developer/v2${endpoint}?start=${startDate}&end=${endDate}&limit=25`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-WHOOP-CLIENT': Deno.env.get('WHOOP_CLIENT_ID')!,
    },
  })

  if (!response.ok) {
    throw new Error(`Whoop API error: ${response.status} ${await response.text()}`)
  }

  return await response.json()
}

async function processAthlete(
  supabaseClient: any, 
  athleteUuid: string, 
  accessToken: string, 
  refreshToken: string | null,
  expiresAt: string | null,
  targetDate: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if token needs refresh
    let currentAccessToken = accessToken
    if (expiresAt && new Date(expiresAt) <= new Date()) {
      if (!refreshToken) {
        throw new Error('Token expired and no refresh token available')
      }
      currentAccessToken = await refreshWhoopToken(supabaseClient, athleteUuid, refreshToken)
    }

    // Calculate date range for the target date (UTC-5 timezone)
    const targetDateTime = new Date(targetDate + 'T00:00:00-05:00')
    const startDate = new Date(targetDateTime)
    const endDate = new Date(targetDateTime)
    endDate.setDate(endDate.getDate() + 1)

    const startDateIso = startDate.toISOString()
    const endDateIso = endDate.toISOString()

    // Fetch all data in parallel
    const [recoveryData, cycleData, sleepData] = await Promise.all([
      fetchWhoopData(currentAccessToken, '/activity/recovery', startDateIso, endDateIso) as Promise<WhoopRecoveryData>,
      fetchWhoopData(currentAccessToken, '/cycle', startDateIso, endDateIso) as Promise<WhoopCycleData>,
      fetchWhoopData(currentAccessToken, '/activity/sleep', startDateIso, endDateIso) as Promise<WhoopSleepData>
    ])

    // Process and map data
    const metricData: MetricData = {
      user_id: athleteUuid,
      date: targetDate
    }

    // Process recovery data (HRV and resting heart rate)
    if (recoveryData.records && recoveryData.records.length > 0) {
      const recovery = recoveryData.records[0] // Take the first (most recent) record
      if (recovery.score_state === 'SCORED' && recovery.score) {
        metricData.hrv_rmssd = recovery.score.hrv_rmssd_milli
        metricData.hr_rest = recovery.score.resting_heart_rate
      }
    }

    // Process cycle data (strain)
    if (cycleData.records && cycleData.records.length > 0) {
      const cycle = cycleData.records[0] // Take the first (most recent) record
      if (cycle.score_state === 'SCORED' && cycle.score) {
        metricData.strain = cycle.score.strain
      }
    }

    // Process sleep data (sleep minutes)
    if (sleepData.records && sleepData.records.length > 0) {
      // Filter out naps, focus on main sleep
      const mainSleep = sleepData.records.find(sleep => !sleep.nap)
      if (mainSleep && mainSleep.score_state === 'SCORED' && mainSleep.score) {
        // Convert total in bed time from milliseconds to minutes
        metricData.sleep_min = Math.round(mainSleep.score.stage_summary.total_in_bed_time_milli / (1000 * 60))
      }
    }

    // Only upsert if we have at least one metric
    if (metricData.hrv_rmssd || metricData.hr_rest || metricData.sleep_min || metricData.strain) {
      const { error: upsertError } = await supabaseClient
        .from('metrics')
        .upsert(metricData, {
          onConflict: 'user_id,date',
          ignoreDuplicates: false,
        })

      if (upsertError) {
        throw new Error(`Database upsert error: ${upsertError.message}`)
      }
    }

    return { success: true }
  } catch (error) {
    console.error(`Error processing athlete ${athleteUuid}:`, error)
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

    // Get target date from query parameter or default to today (UTC-5)
    const url = new URL(req.url)
    const dateParam = url.searchParams.get('date')
    const targetDate = dateParam || new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString().split('T')[0] // UTC-5

    // Get all athletes with Whoop tokens
    const { data: athletes, error: athletesError } = await supabaseClient
      .from('wearable_tokens')
      .select('athlete_uuid, access_token, refresh_token, expires_at')
      .eq('provider', 'whoop')

    if (athletesError) {
      throw new Error(`Failed to fetch athletes: ${athletesError.message}`)
    }

    if (!athletes || athletes.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No athletes with Whoop tokens found',
          inserted: 0,
          updated: 0,
          errors: 0,
          date: targetDate
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    // Process all athletes in parallel
    const results = await Promise.all(
      athletes.map(athlete => 
        processAthlete(
          supabaseClient, 
          athlete.athlete_uuid, 
          athlete.access_token,
          athlete.refresh_token,
          athlete.expires_at,
          targetDate
        )
      )
    )

    // Count results
    const successful = results.filter(r => r.success).length
    const errors = results.filter(r => !r.success).length

    // Log error details
    const errorDetails = results
      .filter(r => !r.success)
      .map(r => r.error)
      .join('; ')

    if (errorDetails) {
      console.error('Processing errors:', errorDetails)
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${athletes.length} athletes for ${targetDate}`,
        inserted: successful, // Note: We can't distinguish between insert vs update with upsert
        updated: 0,
        errors: errors,
        date: targetDate,
        error_details: errorDetails || null
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
        inserted: 0,
        updated: 0,
        errors: 1
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
