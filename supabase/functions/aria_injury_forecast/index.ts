
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('ARIA Injury Forecast started at', new Date().toISOString())

    // Fetch all athletes with their coach information
    const { data: athletes, error: athletesError } = await supabase
      .from('athletes')
      .select('id, name, coach_uuid')

    if (athletesError) {
      console.error('Error fetching athletes:', athletesError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch athletes' }),
        { status: 500, headers: corsHeaders }
      )
    }

    console.log(`Processing ${athletes?.length || 0} athletes`)

    // Process each athlete
    for (const athlete of athletes || []) {
      try {
        await processAthleteInjuryForecast(supabase, athlete)
      } catch (error) {
        console.error(`Error processing athlete ${athlete.id}:`, error)
        // Continue with other athletes even if one fails
      }
    }

    console.log('ARIA Injury Forecast completed successfully')

    return new Response(
      JSON.stringify({ success: true, processed: athletes?.length || 0 }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in aria_injury_forecast:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})

async function processAthleteInjuryForecast(supabase: any, athlete: any) {
  console.log(`Processing athlete: ${athlete.name} (${athlete.id})`)

  // 1. Select last 12 weeks of load, asymmetry, sleep, HRV data
  const twelveWeeksAgo = new Date()
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - (12 * 7))

  const { data: wearableData, error: wearableError } = await supabase
    .from('wearable_raw')
    .select('metric, value, ts')
    .eq('athlete_uuid', athlete.id)
    .gte('ts', twelveWeeksAgo.toISOString())
    .in('metric', ['load', 'asymmetry', 'sleep_efficiency', 'hrv_rmssd'])
    .order('ts', { ascending: true })

  if (wearableError) {
    console.error(`Error fetching wearable data for athlete ${athlete.id}:`, wearableError)
    return
  }

  // Organize data by metric
  const organizedData = {
    load: [],
    asymmetry: [],
    sleep: [],
    hrv: []
  }

  for (const record of wearableData || []) {
    switch (record.metric) {
      case 'load':
        organizedData.load.push({ value: record.value, timestamp: record.ts })
        break
      case 'asymmetry':
        organizedData.asymmetry.push({ value: record.value, timestamp: record.ts })
        break
      case 'sleep_efficiency':
        organizedData.sleep.push({ value: record.value, timestamp: record.ts })
        break
      case 'hrv_rmssd':
        organizedData.hrv.push({ value: record.value, timestamp: record.ts })
        break
    }
  }

  // 2. POST JSON to ML API
  const mlPayload = {
    athlete_id: athlete.id,
    athlete_name: athlete.name,
    data: organizedData,
    weeks: 12
  }

  console.log(`Sending data to ML API for athlete ${athlete.id}`)

  const mlResponse = await fetch('https://ml.catalyft.app/predict_injury', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(mlPayload)
  })

  if (!mlResponse.ok) {
    console.error(`ML API error for athlete ${athlete.id}:`, mlResponse.status, mlResponse.statusText)
    return
  }

  // 3. Receive response
  const mlResult = await mlResponse.json()
  console.log(`ML API response for athlete ${athlete.id}:`, mlResult)

  let pdfStoragePath = null

  // 4. Store PDF in storage if provided
  if (mlResult.pdf_url) {
    try {
      const pdfResponse = await fetch(mlResult.pdf_url)
      if (pdfResponse.ok) {
        const pdfBlob = await pdfResponse.arrayBuffer()
        const fileName = `${athlete.id}/${new Date().toISOString().split('T')[0]}-injury-forecast.pdf`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('aria-reports')
          .upload(fileName, pdfBlob, {
            contentType: 'application/pdf',
            upsert: true
          })

        if (uploadError) {
          console.error(`PDF upload error for athlete ${athlete.id}:`, uploadError)
        } else {
          pdfStoragePath = uploadData.path
          console.log(`PDF stored for athlete ${athlete.id}:`, pdfStoragePath)
        }
      }
    } catch (error) {
      console.error(`Error downloading/storing PDF for athlete ${athlete.id}:`, error)
    }
  }

  // 5. Upsert injury_risk_forecast
  const { error: upsertError } = await supabase
    .from('injury_risk_forecast')
    .upsert({
      athlete_uuid: athlete.id,
      coach_uuid: athlete.coach_uuid,
      probabilities: mlResult.probabilities,
      top_features: mlResult.top_features || null,
      pdf_url: pdfStoragePath,
      forecast_date: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'athlete_uuid,forecast_date'
    })

  if (upsertError) {
    console.error(`Error upserting forecast for athlete ${athlete.id}:`, upsertError)
    return
  }

  console.log(`Forecast stored for athlete ${athlete.id}`)

  // 6. Broadcast to coach channel
  const channel = supabase.channel(`coach_${athlete.coach_uuid}_alerts`)
  await channel.send({
    type: 'broadcast',
    event: 'injury_forecast',
    payload: {
      athlete_uuid: athlete.id,
      athlete_name: athlete.name,
      probabilities: mlResult.probabilities,
      forecast_date: new Date().toISOString().split('T')[0]
    }
  })

  console.log(`Alert sent to coach ${athlete.coach_uuid} for athlete ${athlete.id}`)
}
