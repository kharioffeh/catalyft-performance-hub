
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InsightData {
  metric: string;
  severity: 'info' | 'amber' | 'red';
  message: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('ARIA Insights generation started at', new Date().toISOString())

    // Get all athletes with data updated in the last hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    const { data: recentData, error: recentError } = await supabase
      .from('wearable_raw')
      .select('athlete_uuid')
      .gte('created_at', oneHourAgo)
      .order('created_at', { ascending: false })

    if (recentError) {
      console.error('Error fetching recent data:', recentError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch recent data' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Get unique athlete UUIDs
    const athleteUuids = [...new Set(recentData?.map(d => d.athlete_uuid) || [])]
    console.log(`Processing ${athleteUuids.length} athletes with recent data`)

    // Process each athlete
    for (const athleteUuid of athleteUuids) {
      try {
        await generateInsightsForAthlete(supabase, athleteUuid)
      } catch (error) {
        console.error(`Error processing athlete ${athleteUuid}:`, error)
        // Continue with other athletes
      }
    }

    console.log('ARIA Insights generation completed')

    return new Response(
      JSON.stringify({ success: true, processed: athleteUuids.length }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in aria_generate_insights:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})

async function generateInsightsForAthlete(supabase: any, athleteUuid: string) {
  console.log(`Generating insights for athlete: ${athleteUuid}`)

  // Get athlete info (solo athletes only)
  const { data: athlete, error: athleteError } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('id', athleteUuid)
    .eq('role', 'solo')
    .single()

  if (athleteError || !athlete) {
    console.error(`Error fetching solo athlete ${athleteUuid}:`, athleteError)
    return
  }

  // Get latest metrics
  const metrics = ['hrv_rmssd', 'sleep_efficiency', 'strain', 'acwr', 'asymmetry']
  const contextData: any = {}

  for (const metric of metrics) {
    const { data, error } = await supabase
      .from('wearable_raw')
      .select('value, ts')
      .eq('athlete_uuid', athleteUuid)
      .eq('metric', metric)
      .order('ts', { ascending: false })
      .limit(7) // Last 7 data points

    if (!error && data && data.length > 0) {
      contextData[metric] = {
        latest: data[0].value,
        trend: data.map(d => d.value),
        lastUpdated: data[0].ts
      }
    }
  }

  // Get latest readiness score
  const { data: readiness } = await supabase
    .from('readiness_scores')
    .select('score, ts')
    .eq('athlete_uuid', athleteUuid)
    .order('ts', { ascending: false })
    .limit(1)
    .single()

  if (readiness) {
    contextData.readiness = {
      latest: readiness.score,
      lastUpdated: readiness.ts
    }
  }

  // Skip if no meaningful data
  if (Object.keys(contextData).length === 0) {
    console.log(`No meaningful data for athlete ${athleteUuid}, skipping`)
    return
  }

  // Generate insights using OpenAI
  const insights = await generateAIInsights(athlete.name, contextData)
  
  // Insert insights into database
  for (const insight of insights) {
    const { error: insertError } = await supabase
      .from('insight_log')
      .insert({
        athlete_uuid: athleteUuid,
        metric: insight.metric,
        severity: insight.severity,
        message: insight.message,
        source: 'ARIA'
      })

    if (insertError) {
      console.error(`Error inserting insight for ${athleteUuid}:`, insertError)
    } else {
      console.log(`Insight created for ${athleteUuid}: ${insight.metric} - ${insight.severity}`)
      
      // Broadcast to coach channel
      if (athlete.coach_uuid) {
        const channel = supabase.channel(`coach_${athlete.coach_uuid}_insights`)
        await channel.send({
          type: 'broadcast',
          event: 'new_insight',
          payload: {
            athlete_uuid: athleteUuid,
            athlete_name: athlete.name,
            insight
          }
        })
      }
    }
  }
}

async function generateAIInsights(athleteName: string, contextData: any): Promise<InsightData[]> {
  const apiKey = Deno.env.get('OPENAI_ARIA_KEY')
  if (!apiKey) {
    throw new Error('OPENAI_ARIA_KEY not configured')
  }

  const systemPrompt = `You are ARIA, an AI sports performance analyst. Analyze the athlete's data and return insights as a JSON array of objects with this exact structure:
[
  {
    "metric": "HRV|Sleep|Load|Readiness|ACWR|Asymmetry",
    "severity": "info|amber|red", 
    "message": "Brief actionable insight (max 80 chars)"
  }
]

Guidelines:
- Maximum 3 insights
- "red" = immediate concern/risk
- "amber" = needs attention
- "info" = positive trend or general observation
- Focus on actionable insights
- Keep messages concise and professional`

  const userPrompt = `Athlete: ${athleteName}
Data: ${JSON.stringify(contextData, null, 2)}

Generate insights based on this data.`

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse and validate the response
    let insights: InsightData[]
    try {
      insights = JSON.parse(content)
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content)
      return []
    }

    // Validate structure
    const validInsights = insights.filter(insight => 
      insight.metric && 
      ['info', 'amber', 'red'].includes(insight.severity) &&
      insight.message &&
      insight.message.length <= 80
    ).slice(0, 3) // Max 3 insights

    return validInsights

  } catch (error) {
    console.error('Error calling OpenAI API:', error)
    return []
  }
}
