import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WhoopToken {
  user_id: string
  access_token: string
  refresh_token: string
  expires_at: string
}

interface WhoopCycleResponse {
  records: Array<{
    id: number
    user_id: number
    start: string
    end?: string
    score_state: string
    score?: {
      strain: number
      kilojoule: number
      average_heart_rate: number
      max_heart_rate: number
    }
  }>
  next_token?: string
}

interface WhoopWorkoutResponse {
  records: Array<{
    id: string
    v1_id?: number
    user_id: number
    start: string
    end: string
    sport_name: string
    sport_id?: number
    score_state: string
    score?: {
      strain: number
      kilojoule: number
      average_heart_rate: number
      max_heart_rate: number
      distance_meter?: number
      altitude_gain_meter?: number
      zone_durations?: {
        zone_zero_milli: number
        zone_one_milli: number
        zone_two_milli: number
        zone_three_milli: number
        zone_four_milli: number
        zone_five_milli: number
      }
    }
  }>
  next_token?: string
}

async function fetchWhoopData(accessToken: string, endpoint: string, startDate: string, endDate: string) {
  const url = `https://api.prod.whoop.com/developer/v2/${endpoint}?start=${startDate}&end=${endDate}&limit=25`
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`WHOOP API error: ${response.status} ${await response.text()}`)
  }

  return await response.json()
}

async function syncWhoopCycles(
  supabase: any,
  token: WhoopToken,
  startDate: string,
  endDate: string
): Promise<number> {
  console.log(`Syncing WHOOP cycles for user ${token.user_id}`)
  
  try {
    const cycleData: WhoopCycleResponse = await fetchWhoopData(
      token.access_token,
      'cycle',
      startDate,
      endDate
    )

    let syncedCount = 0

    for (const cycle of cycleData.records) {
      if (cycle.score_state === 'SCORED' && cycle.score && cycle.end) {
        const cycleDate = new Date(cycle.start).toISOString().split('T')[0]
        
        const { error } = await supabase
          .from('whoop_cycles')
          .upsert({
            user_id: token.user_id,
            cycle_date: cycleDate,
            cycle_id: cycle.id,
            start_time: cycle.start,
            end_time: cycle.end,
            strain: cycle.score.strain,
            kilojoules: cycle.score.kilojoule,
            average_heart_rate: cycle.score.average_heart_rate,
            max_heart_rate: cycle.score.max_heart_rate,
            score_state: cycle.score_state,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,cycle_date'
          })

        if (error) {
          console.error(`Error upserting cycle ${cycle.id}:`, error)
        } else {
          syncedCount++
        }
      }
    }

    return syncedCount
  } catch (error) {
    console.error('Error syncing WHOOP cycles:', error)
    throw error
  }
}

async function syncWhoopWorkouts(
  supabase: any,
  token: WhoopToken,
  startDate: string,
  endDate: string
): Promise<number> {
  console.log(`Syncing WHOOP workouts for user ${token.user_id}`)
  
  try {
    const workoutData: WhoopWorkoutResponse = await fetchWhoopData(
      token.access_token,
      'activity/workout',
      startDate,
      endDate
    )

    let syncedCount = 0

    for (const workout of workoutData.records) {
      if (workout.score_state === 'SCORED' && workout.score) {
        const workoutDate = new Date(workout.start).toISOString().split('T')[0]
        
        const { error } = await supabase
          .from('whoop_workouts')
          .upsert({
            user_id: token.user_id,
            workout_date: workoutDate,
            workout_id: workout.id,
            v1_id: workout.v1_id,
            start_time: workout.start,
            end_time: workout.end,
            sport_name: workout.sport_name,
            sport_id: workout.sport_id,
            strain: workout.score.strain,
            kilojoules: workout.score.kilojoule,
            average_heart_rate: workout.score.average_heart_rate,
            max_heart_rate: workout.score.max_heart_rate,
            distance_meter: workout.score.distance_meter,
            altitude_gain_meter: workout.score.altitude_gain_meter,
            zone_durations: workout.score.zone_durations ? JSON.stringify(workout.score.zone_durations) : null,
            score_state: workout.score_state,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id,workout_id'
          })

        if (error) {
          console.error(`Error upserting workout ${workout.id}:`, error)
        } else {
          syncedCount++
        }
      }
    }

    return syncedCount
  } catch (error) {
    console.error('Error syncing WHOOP workouts:', error)
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Calculate date range (last 7 days for regular sync)
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 7)
    
    const startDateStr = startDate.toISOString()
    const endDateStr = endDate.toISOString()

    // Get all athletes with non-expired WHOOP tokens
    const { data: tokens, error: tokensError } = await supabaseClient
      .from('whoop_tokens')
      .select('*')
      .gt('expires_at', new Date().toISOString())

    if (tokensError) {
      throw new Error(`Failed to fetch whoop tokens: ${tokensError.message}`)
    }

    if (!tokens || tokens.length === 0) {
      return Response.json({
        success: true,
        message: 'No non-expired WHOOP tokens found',
        synced: 0
      })
    }

    let totalCyclesSynced = 0
    let totalWorkoutsSynced = 0
    let errors = 0

    // Process each token
    for (const token of tokens) {
      try {
        console.log(`Processing WHOOP data for user: ${token.user_id}`)
        
        // Sync cycles (daily activity/strain data)
        const cyclesSynced = await syncWhoopCycles(
          supabaseClient,
          token,
          startDateStr,
          endDateStr
        )
        totalCyclesSynced += cyclesSynced

        // Sync workouts (specific exercise sessions)
        const workoutsSynced = await syncWhoopWorkouts(
          supabaseClient,
          token,
          startDateStr,
          endDateStr
        )
        totalWorkoutsSynced += workoutsSynced

        console.log(`Synced ${cyclesSynced} cycles and ${workoutsSynced} workouts for user ${token.user_id}`)
        
      } catch (error) {
        console.error(`Error processing user ${token.user_id}:`, error)
        errors++
      }
    }

    console.log(`WHOOP activity sync summary: { cycles: ${totalCyclesSynced}, workouts: ${totalWorkoutsSynced}, errors: ${errors} }`)

    return Response.json({
      success: true,
      message: 'WHOOP activity sync completed',
      cycles_synced: totalCyclesSynced,
      workouts_synced: totalWorkoutsSynced,
      users_processed: tokens.length,
      errors: errors
    })

  } catch (error) {
    console.error('Pull WHOOP activity error:', error)
    return Response.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    )
  }
})