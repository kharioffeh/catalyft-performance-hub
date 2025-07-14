import { serve } from 'https://deno.land/std@0.193.0/http/server.ts'
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
    // 1. Bootstrap Supabase client with service role
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { 
        global: { 
          headers: { 
            Authorization: req.headers.get('Authorization')! 
          } 
        } 
      }
    )

    // 2. Auth guard - must be logged in
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 3. Parse and validate request body
    const body = await req.json()
    const { programId } = body

    if (!programId || typeof programId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'programId is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Generating sessions for program:', { programId, userUuid: user.id })

    // 4. Fetch program details
    const { data: program, error: programError } = await supabase
      .from('program_instance')
      .select('start_date, athlete_uuid, template_id')
      .eq('id', programId)
      .single()

    if (programError || !program) {
      console.error('Program fetch error:', programError)
      return new Response(
        JSON.stringify({ error: 'Program not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!program.template_id) {
      return new Response(
        JSON.stringify({ error: 'Program has no template (cannot generate sessions for non-template programs)' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 5. Fetch program blocks (using template_block as equivalent to program_blocks)
    const { data: blocks, error: blocksError } = await supabase
      .from('template_block')
      .select('week_no, day_no, session_title')
      .eq('template_id', program.template_id)
      .order('week_no', { ascending: true })
      .order('day_no', { ascending: true })

    if (blocksError) {
      console.error('Blocks fetch error:', blocksError)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch program blocks', details: blocksError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 6. Generate sessions for each block (idempotent - check existing first)
    const sessionsToInsert = []
    const startDate = new Date(program.start_date)
    
    for (const block of blocks || []) {
      // Calculate day_offset: (week_no - 1) * 7 + (day_no - 1)
      const dayOffset = (block.week_no - 1) * 7 + (block.day_no - 1)
      
      // Calculate session date: start_date + day_offset
      const sessionDate = new Date(startDate)
      sessionDate.setDate(sessionDate.getDate() + dayOffset)
      
      const sessionDateStr = sessionDate.toISOString().split('T')[0]

      // Check if session already exists for this program and date (idempotent)
      const { data: existingSession } = await supabase
        .from('session')
        .select('id')
        .eq('program_id', programId)
        .eq('planned_at', sessionDateStr)
        .single()

      if (!existingSession) {
        sessionsToInsert.push({
          program_id: programId,
          planned_at: sessionDateStr,
          title: block.session_title || 'Training Session',
          // athlete_id: program.athlete_uuid, // Add if sessions table requires it
          // status: 'scheduled' // Will use database default
        })
      }
    }

    // 7. Insert new sessions in batch
    if (sessionsToInsert.length > 0) {
      const { data: insertedSessions, error: insertError } = await supabase
        .from('session')
        .insert(sessionsToInsert)
        .select('id')

      if (insertError) {
        console.error('Session insert error:', insertError)
        return new Response(
          JSON.stringify({ error: 'Failed to create sessions', details: insertError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      console.log(`Created ${insertedSessions.length} new sessions for program ${programId}`)
    }

    // 8. Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        createdSessions: sessionsToInsert.length,
        message: `Generated ${sessionsToInsert.length} new sessions for program` 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})