import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleFitDataSource {
  dataStreamId: string
  dataStreamName: string
  type: string
  application?: {
    packageName: string
    name?: string
  }
}

interface GoogleFitDataPoint {
  dataTypeName: string
  startTimeNanos: string
  endTimeNanos: string
  value: Array<{ intVal?: number; fpVal?: number; stringVal?: string }>
  originDataSourceId: string
  modifiedTimeMillis: string
}

interface GoogleFitSession {
  id: string
  name: string
  description?: string
  startTimeMillis: string
  endTimeMillis: string
  modifiedTimeMillis: string
  activityType: number
  application?: {
    packageName: string
    name?: string
  }
}

serve(async (req) => {
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

    const { user_id, days = 7 } = await req.json()

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Starting Google Fit sync for user ${user_id}, ${days} days`)

    // Get Google Fit connection
    const { data: connection, error: connectionError } = await supabaseClient
      .from('google_fit_connections')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (connectionError || !connection) {
      return new Response(
        JSON.stringify({ error: 'Google Fit connection not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Check if token needs refresh
    const now = new Date()
    const expiresAt = new Date(connection.expires_at)
    
    let accessToken = connection.access_token

    if (now >= expiresAt) {
      console.log('Access token expired, refreshing...')
      
      // Refresh token
      const refreshResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/google-fit-oauth`, {
        method: 'POST',
        headers: {
          'Authorization': req.headers.get('Authorization')!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'refresh_token',
          user_id: user_id
        })
      })

      if (!refreshResponse.ok) {
        throw new Error('Failed to refresh Google Fit token')
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token
    }

    // Calculate date range
    const endTime = now
    const startTime = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))

    const startTimeMillis = startTime.getTime()
    const endTimeMillis = endTime.getTime()

    console.log(`Syncing Google Fit data from ${startTime.toISOString()} to ${endTime.toISOString()}`)

    // Sync daily activity data
    await syncDailyActivity(accessToken, user_id, startTimeMillis, endTimeMillis, supabaseClient)

    // Sync workout sessions
    await syncWorkoutSessions(accessToken, user_id, startTimeMillis, endTimeMillis, supabaseClient)

    // Update last sync time
    await supabaseClient
      .from('google_fit_connections')
      .update({ last_sync_at: now.toISOString() })
      .eq('user_id', user_id)

    console.log(`Google Fit sync completed for user ${user_id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synced ${days} days of Google Fit data`,
        sync_time: now.toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Google Fit sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function syncDailyActivity(
  accessToken: string, 
  userId: string, 
  startTimeMillis: number, 
  endTimeMillis: number,
  supabaseClient: any
) {
  console.log('Syncing daily activity data...')

  // Get aggregated daily data from Google Fit
  const aggregateRequest = {
    aggregateBy: [
      { dataTypeName: 'com.google.calories.expended' },
      { dataTypeName: 'com.google.step_count.delta' },
      { dataTypeName: 'com.google.distance.delta' },
      { dataTypeName: 'com.google.active_minutes' },
    ],
    bucketByTime: { durationMillis: 86400000 }, // 1 day buckets
    startTimeMillis: startTimeMillis.toString(),
    endTimeMillis: endTimeMillis.toString()
  }

  const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(aggregateRequest)
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Google Fit aggregate API error:', errorText)
    throw new Error(`Google Fit API error: ${response.status}`)
  }

  const data = await response.json()
  console.log(`Received ${data.bucket?.length || 0} daily activity buckets`)

  // Process each day's data
  for (const bucket of data.bucket || []) {
    const bucketStartTime = new Date(parseInt(bucket.startTimeMillis))
    const bucketEndTime = new Date(parseInt(bucket.endTimeMillis))
    const activityDate = bucketStartTime.toISOString().split('T')[0]

    let calories = 0
    let steps = 0
    let distanceMeters = 0
    let activeMinutes = 0

    // Extract values from each data type
    for (const dataset of bucket.dataset || []) {
      for (const point of dataset.point || []) {
        const dataTypeName = point.dataTypeName

        if (dataTypeName === 'com.google.calories.expended') {
          calories += point.value[0]?.fpVal || 0
        } else if (dataTypeName === 'com.google.step_count.delta') {
          steps += point.value[0]?.intVal || 0
        } else if (dataTypeName === 'com.google.distance.delta') {
          distanceMeters += point.value[0]?.fpVal || 0
        } else if (dataTypeName === 'com.google.active_minutes') {
          activeMinutes += point.value[0]?.intVal || 0
        }
      }
    }

    // Only insert if we have meaningful data
    if (calories > 0 || steps > 0 || distanceMeters > 0 || activeMinutes > 0) {
      const { error } = await supabaseClient
        .from('google_fit_daily_activity')
        .upsert({
          user_id: userId,
          activity_date: activityDate,
          calories_burned: Math.round(calories),
          steps: steps,
          distance_meters: Math.round(distanceMeters),
          active_minutes: activeMinutes,
          data_source: 'google_fit',
          synced_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id, activity_date'
        })

      if (error) {
        console.error('Error inserting daily activity:', error)
      } else {
        console.log(`Synced daily activity for ${activityDate}: ${calories} calories, ${steps} steps`)
      }
    }
  }
}

async function syncWorkoutSessions(
  accessToken: string, 
  userId: string, 
  startTimeMillis: number, 
  endTimeMillis: number,
  supabaseClient: any
) {
  console.log('Syncing workout sessions...')

  // Get sessions (workouts) from Google Fit
  const sessionsUrl = `https://www.googleapis.com/fitness/v1/users/me/sessions?` +
    `startTime=${new Date(startTimeMillis).toISOString()}&` +
    `endTime=${new Date(endTimeMillis).toISOString()}`

  const response = await fetch(sessionsUrl, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    }
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error('Google Fit sessions API error:', errorText)
    throw new Error(`Google Fit sessions API error: ${response.status}`)
  }

  const data = await response.json()
  const sessions = data.session || []
  
  console.log(`Found ${sessions.length} workout sessions`)

  // Process each workout session
  for (const session of sessions) {
    const startTime = new Date(parseInt(session.startTimeMillis))
    const endTime = new Date(parseInt(session.endTimeMillis))
    const workoutDate = startTime.toISOString().split('T')[0]
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

    // Get detailed data for this session including calories
    let caloriesBurned = 0
    
    try {
      const sessionDataUrl = `https://www.googleapis.com/fitness/v1/users/me/sessions/${session.id}/datasets/` +
        `com.google.calories.expended/` +
        `${session.startTimeMillis}000000-${session.endTimeMillis}000000`

      const sessionDataResponse = await fetch(sessionDataUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        }
      })

      if (sessionDataResponse.ok) {
        const sessionData = await sessionDataResponse.json()
        for (const point of sessionData.point || []) {
          caloriesBurned += point.value[0]?.fpVal || 0
        }
      }
    } catch (error) {
      console.log(`Could not get calorie data for session ${session.id}:`, error)
    }

    // Map Google Fit activity types to readable names
    const activityTypeMap: { [key: number]: string } = {
      1: 'Biking',
      8: 'Running',
      7: 'Walking',
      79: 'Weight Training',
      82: 'Yoga',
      9: 'Swimming',
      // Add more mappings as needed
    }

    const activityName = activityTypeMap[session.activityType] || 
                        session.name || 
                        `Activity ${session.activityType}`

    const { error } = await supabaseClient
      .from('google_fit_workouts')
      .upsert({
        user_id: userId,
        session_id: session.id,
        workout_name: activityName,
        workout_type: session.activityType.toString(),
        workout_date: workoutDate,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        calories_burned: Math.round(caloriesBurned),
        data_source: session.application?.packageName || 'google_fit',
        synced_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id, session_id'
      })

    if (error) {
      console.error('Error inserting workout:', error)
    } else {
      console.log(`Synced workout: ${activityName} (${durationMinutes}min, ${Math.round(caloriesBurned)} cal)`)
    }
  }
}