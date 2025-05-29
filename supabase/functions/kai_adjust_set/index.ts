
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

    const { session_uuid, athlete_uuid, metric, value } = await req.json()

    console.log('KAI Adjust Set Request:', { session_uuid, athlete_uuid, metric, value })

    // Validate input
    if (!session_uuid || !athlete_uuid || !metric || value === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Validate metric type
    if (!['velocity_loss', 'hr_drift'].includes(metric)) {
      return new Response(
        JSON.stringify({ error: 'Invalid metric. Must be velocity_loss or hr_drift' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // Decision logic
    let delta = 0
    let shouldAdjust = false
    
    if (metric === 'velocity_loss' && value > 0.15) {
      delta = -0.05
      shouldAdjust = true
    } else if (metric === 'hr_drift' && value > 0.10) {
      delta = -0.05
      shouldAdjust = true
    }

    // If no adjustment needed, return 204
    if (!shouldAdjust) {
      console.log('No adjustment needed for metric:', metric, 'with value:', value)
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    // Get the session to find coach_uuid
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('coach_uuid')
      .eq('id', session_uuid)
      .single()

    if (sessionError || !session) {
      console.error('Session not found:', sessionError)
      return new Response(
        JSON.stringify({ error: 'Session not found' }),
        { status: 404, headers: corsHeaders }
      )
    }

    // Update workout_blocks JSON: reduce target_load by 5%
    const { data: workoutBlocks, error: fetchError } = await supabase
      .from('workout_blocks')
      .select('*')
      .eq('athlete_uuid', athlete_uuid)

    if (fetchError) {
      console.error('Error fetching workout blocks:', fetchError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch workout blocks' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Update each workout block's target_load
    for (const block of workoutBlocks || []) {
      const updatedData = { ...block.data }
      
      // Recursively update target_load in the JSON structure
      const updateTargetLoad = (obj: any): any => {
        if (obj && typeof obj === 'object') {
          if (Array.isArray(obj)) {
            return obj.map(updateTargetLoad)
          } else {
            const updated: any = {}
            for (const [key, val] of Object.entries(obj)) {
              if (key === 'target_load' && typeof val === 'number') {
                updated[key] = Math.max(0, val * (1 + delta))
              } else {
                updated[key] = updateTargetLoad(val)
              }
            }
            return updated
          }
        }
        return obj
      }

      const newData = updateTargetLoad(updatedData)

      const { error: updateError } = await supabase
        .from('workout_blocks')
        .update({ data: newData })
        .eq('id', block.id)

      if (updateError) {
        console.error('Error updating workout block:', updateError)
      }
    }

    // Create prompt text
    const adjustmentPercent = Math.abs(delta * 100)
    const metricName = metric === 'velocity_loss' ? 'velocity loss' : 'heart rate drift'
    const promptText = `KAI detected high ${metricName} (${(value * 100).toFixed(1)}%). Automatically reduced target load by ${adjustmentPercent}% to optimize performance and prevent overexertion.`

    // Insert into kai_live_prompts
    const { error: insertError } = await supabase
      .from('kai_live_prompts')
      .insert({
        session_uuid,
        athlete_uuid,
        coach_uuid: session.coach_uuid,
        prompt_text: promptText,
        metric,
        adjustment_value: delta
      })

    if (insertError) {
      console.error('Error inserting prompt:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to insert prompt' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // Broadcast via supabase.channel
    const channel = supabase.channel(`kai_session_${session_uuid}`)
    await channel.send({
      type: 'broadcast',
      event: 'kai_adjustment',
      payload: {
        session_uuid,
        athlete_uuid,
        metric,
        value,
        adjustment: delta,
        prompt_text: promptText
      }
    })

    console.log('KAI adjustment completed successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        adjustment: delta,
        prompt_text: promptText 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error in kai_adjust_set:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    )
  }
})
