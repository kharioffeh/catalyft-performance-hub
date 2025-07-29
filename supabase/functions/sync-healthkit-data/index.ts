import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface HealthKitDailyActivity {
  date: string // YYYY-MM-DD format
  activeEnergyBurned?: number
  basalEnergyBurned?: number
  totalEnergyBurned?: number
  activeEnergyGoal?: number
  exerciseTimeMinutes?: number
  exerciseGoalMinutes?: number
  standHours?: number
  standGoalHours?: number
  restingHeartRate?: number
  averageHeartRate?: number
  maxHeartRate?: number
  heartRateVariability?: number
  steps?: number
  distanceWalkedMeters?: number
  flightsClimbed?: number
  sleepDurationMinutes?: number
  sleepEfficiencyPercentage?: number
}

interface HealthKitWorkout {
  uuid: string
  date: string // YYYY-MM-DD format
  workoutTypeId: number
  workoutTypeName: string
  startTime: string // ISO string
  endTime: string // ISO string
  durationMinutes: number
  activeEnergyBurned?: number
  totalEnergyBurned?: number
  distanceMeters?: number
  averageHeartRate?: number
  maxHeartRate?: number
  averagePaceSecondsPerMeter?: number
  elevationGainMeters?: number
  heartRateZones?: {
    zone1Minutes?: number
    zone2Minutes?: number
    zone3Minutes?: number
    zone4Minutes?: number
    zone5Minutes?: number
  }
  sourceName?: string
  sourceVersion?: string
  deviceName?: string
}

interface SyncRequest {
  dailyActivity?: HealthKitDailyActivity[]
  workouts?: HealthKitWorkout[]
  syncTimestamp?: string
}

async function syncDailyActivity(
  supabase: any,
  userId: string,
  activities: HealthKitDailyActivity[]
): Promise<{ synced: number; errors: number }> {
  let synced = 0
  let errors = 0

  for (const activity of activities) {
    try {
      const { error } = await supabase
        .from('healthkit_daily_activity')
        .upsert({
          user_id: userId,
          activity_date: activity.date,
          active_energy_burned: activity.activeEnergyBurned,
          basal_energy_burned: activity.basalEnergyBurned,
          total_energy_burned: activity.totalEnergyBurned,
          active_energy_goal: activity.activeEnergyGoal,
          exercise_time_minutes: activity.exerciseTimeMinutes,
          exercise_goal_minutes: activity.exerciseGoalMinutes,
          stand_hours: activity.standHours,
          stand_goal_hours: activity.standGoalHours,
          resting_heart_rate: activity.restingHeartRate,
          average_heart_rate: activity.averageHeartRate,
          max_heart_rate: activity.maxHeartRate,
          heart_rate_variability: activity.heartRateVariability,
          steps: activity.steps,
          distance_walked_meters: activity.distanceWalkedMeters,
          flights_climbed: activity.flightsClimbed,
          sleep_duration_minutes: activity.sleepDurationMinutes,
          sleep_efficiency_percentage: activity.sleepEfficiencyPercentage,
          data_source: 'apple_watch',
          sync_timestamp: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,activity_date'
        })

      if (error) {
        console.error(`Error syncing daily activity for ${activity.date}:`, error)
        errors++
      } else {
        synced++
      }
    } catch (error) {
      console.error(`Exception syncing daily activity for ${activity.date}:`, error)
      errors++
    }
  }

  return { synced, errors }
}

async function syncWorkouts(
  supabase: any,
  userId: string,
  workouts: HealthKitWorkout[]
): Promise<{ synced: number; errors: number }> {
  let synced = 0
  let errors = 0

  for (const workout of workouts) {
    try {
      const { error } = await supabase
        .from('healthkit_workouts')
        .upsert({
          user_id: userId,
          workout_uuid: workout.uuid,
          workout_date: workout.date,
          workout_type_id: workout.workoutTypeId,
          workout_type_name: workout.workoutTypeName,
          start_time: workout.startTime,
          end_time: workout.endTime,
          duration_minutes: workout.durationMinutes,
          active_energy_burned: workout.activeEnergyBurned,
          total_energy_burned: workout.totalEnergyBurned,
          distance_meters: workout.distanceMeters,
          average_heart_rate: workout.averageHeartRate,
          max_heart_rate: workout.maxHeartRate,
          average_pace_seconds_per_meter: workout.averagePaceSecondsPerMeter,
          elevation_gain_meters: workout.elevationGainMeters,
          heart_rate_zones: workout.heartRateZones ? JSON.stringify(workout.heartRateZones) : null,
          source_name: workout.sourceName || 'Apple Watch',
          source_version: workout.sourceVersion,
          device_name: workout.deviceName,
          sync_timestamp: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,workout_uuid'
        })

      if (error) {
        console.error(`Error syncing workout ${workout.uuid}:`, error)
        errors++
      } else {
        synced++
      }
    } catch (error) {
      console.error(`Exception syncing workout ${workout.uuid}:`, error)
      errors++
    }
  }

  return { synced, errors }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    )
  }

  try {
    // Get auth header and validate user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing or invalid authorization header' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: corsHeaders }
      )
    }

    // Parse request body
    const body: SyncRequest = await req.json()
    
    if (!body.dailyActivity && !body.workouts) {
      return new Response(
        JSON.stringify({ error: 'No data provided. Include dailyActivity or workouts' }),
        { status: 400, headers: corsHeaders }
      )
    }

    console.log(`Syncing HealthKit data for user ${user.id}`)
    console.log(`Daily activities: ${body.dailyActivity?.length || 0}`)
    console.log(`Workouts: ${body.workouts?.length || 0}`)

    let dailyActivityResult = { synced: 0, errors: 0 }
    let workoutsResult = { synced: 0, errors: 0 }

    // Sync daily activity data
    if (body.dailyActivity && body.dailyActivity.length > 0) {
      dailyActivityResult = await syncDailyActivity(
        supabaseClient,
        user.id,
        body.dailyActivity
      )
    }

    // Sync workout data
    if (body.workouts && body.workouts.length > 0) {
      workoutsResult = await syncWorkouts(
        supabaseClient,
        user.id,
        body.workouts
      )
    }

    const totalSynced = dailyActivityResult.synced + workoutsResult.synced
    const totalErrors = dailyActivityResult.errors + workoutsResult.errors

    console.log(`HealthKit sync completed for user ${user.id}:`)
    console.log(`- Daily activities synced: ${dailyActivityResult.synced}`)
    console.log(`- Workouts synced: ${workoutsResult.synced}`)
    console.log(`- Total errors: ${totalErrors}`)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'HealthKit data synced successfully',
        results: {
          dailyActivity: dailyActivityResult,
          workouts: workoutsResult,
          totalSynced,
          totalErrors,
        },
        userId: user.id,
        syncTimestamp: new Date().toISOString()
      }),
      { status: 200, headers: corsHeaders }
    )

  } catch (error) {
    console.error('HealthKit sync error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { status: 500, headers: corsHeaders }
    )
  }
})