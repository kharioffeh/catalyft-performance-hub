import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { publishEvent } from "../_shared/ably.ts"

// Health metrics schema (existing)
const HealthMetricsSchema = z.object({
  userId: z.string().uuid(),
  hrvRmssd: z.number().min(0).optional(),
  hrRest: z.number().min(0).max(200).optional(),
  steps: z.number().min(0).optional(),
  sleepMin: z.number().min(0).optional(),
  strain: z.number().min(0).max(21).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) // YYYY-MM-DD format
})

// Exercise metrics schema (new)
const ExerciseMetricsSchema = z.object({
  userId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  exercise: z.string().min(1),
  weight: z.number().min(0).optional(),
  reps: z.number().int().min(0).optional(),
  velocity: z.number().min(0).optional(),
})

// Union type to support both health and exercise metrics
const MetricsSchema = z.union([HealthMetricsSchema, ExerciseMetricsSchema])

interface PRCalculation {
  type: '1rm' | '3rm' | 'velocity'
  value: number
}

function calculatePRs(weight: number | undefined, reps: number | undefined, velocity: number | undefined): PRCalculation[] {
  const prs: PRCalculation[] = []
  
  if (weight && reps) {
    // Epley formula: 1RM = weight * (1 + reps/30)
    const oneRM = weight * (1 + reps / 30)
    prs.push({ type: '1rm', value: oneRM })
    
    // 3RM formula: 3RM = weight * (1 + reps/10)
    const threeRM = weight * (1 + reps / 10)
    prs.push({ type: '3rm', value: threeRM })
  }
  
  if (velocity !== undefined) {
    prs.push({ type: 'velocity', value: velocity })
  }
  
  return prs
}

async function updatePRRecords(
  supabaseClient: any,
  userId: string,
  exercise: string,
  prs: PRCalculation[]
) {
  for (const pr of prs) {
    // Get current best PR for this exercise/type
    const { data: existingPR } = await supabaseClient
      .from('pr_records')
      .select('value')
      .eq('user_id', userId)
      .eq('exercise', exercise)
      .eq('type', pr.type)
      .single()
    
    // Only upsert if this is a new PR
    if (!existingPR || pr.value > existingPR.value) {
      const { error } = await supabaseClient
        .from('pr_records')
        .upsert({
          user_id: userId,
          exercise: exercise,
          type: pr.type,
          value: pr.value,
          achieved_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,exercise,type'
        })
      
      if (error) {
        console.error(`Failed to upsert PR record for ${exercise} ${pr.type}:`, error)
        throw error
      }
    }
  }
}

function isExerciseMetric(data: any): data is z.infer<typeof ExerciseMetricsSchema> {
  return 'exercise' in data
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Basic rate limiting check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse and validate request body
    const body = await req.json()
    const validatedData = MetricsSchema.parse(body)

    // Initialize Supabase client with service role for PR operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    let responseData: any

    if (isExerciseMetric(validatedData)) {
      // Handle exercise metrics with PR engine
      const { data: exerciseData, error: exerciseError } = await supabaseClient
        .from('metrics')
        .upsert({
          user_id: validatedData.userId,
          date: validatedData.date,
          exercise: validatedData.exercise,
          weight: validatedData.weight,
          reps: validatedData.reps,
          velocity: validatedData.velocity
        }, { 
          onConflict: 'user_id,date,exercise'
        })
        .select()
        .single()

      if (exerciseError) {
        console.error('Database error:', exerciseError)
        throw exerciseError
      }

      // Calculate and update PRs
      const prs = calculatePRs(validatedData.weight, validatedData.reps, validatedData.velocity)
      if (prs.length > 0) {
        await updatePRRecords(supabaseClient, validatedData.userId, validatedData.exercise, prs)
      }

      responseData = {
        message: 'Exercise metrics upserted successfully',
        data: exerciseData,
        prsCalculated: prs.length
      }
    } else {
      // Handle health metrics (existing logic)
      const { data: healthData, error: healthError } = await supabaseClient
        .from('metrics')
        .upsert({
          user_id: validatedData.userId,
          hrv_rmssd: validatedData.hrvRmssd,
          hr_rest: validatedData.hrRest,
          steps: validatedData.steps,
          sleep_min: validatedData.sleepMin,
          strain: validatedData.strain,
          date: validatedData.date
        }, { 
          onConflict: 'user_id,date'
        })
        .select()
        .single()

      if (healthError) {
        console.error('Database error:', healthError)
        throw healthError
      }

      responseData = {
        message: 'Health metrics upserted successfully',
        data: healthData
      }
    }

    // Publish event after successful DB operation
    const uid = validatedData.userId;
    publishEvent(uid, "metricsUpdated", { date: validatedData.date });

    // Return success response
    return new Response(
      JSON.stringify(responseData),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error:', error)
    
    // Handle validation errors
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation error', 
          details: error.errors 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Handle other errors
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})