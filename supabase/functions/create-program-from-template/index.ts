
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
    const { templateId, athleteUuid } = body

    if (!templateId || typeof templateId !== 'string') {
      return new Response(
        JSON.stringify({ error: 'templateId is required and must be a string' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Creating program from template:', { templateId, athleteUuid, userUuid: user.id })

    // 4. Get user profile to determine role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      console.error('Profile fetch error:', profileError)
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 5. Determine target athlete and authorization logic
    let targetAthleteUuid: string
    let coachUuid: string | null = null

    if (profile.role === 'solo') {
      // Solo athletes can only create programs for themselves
      if (athleteUuid && athleteUuid !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Solo athletes can only create programs for themselves' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      targetAthleteUuid = user.id
      coachUuid = null
    } else if (profile.role === 'coach') {
      // Coach flow - validate template ownership and athlete relationship
      coachUuid = user.id
      
      if (!athleteUuid) {
        return new Response(
          JSON.stringify({ error: 'athleteUuid is required for coach role' }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      targetAthleteUuid = athleteUuid

      // Verify template ownership
      const { data: template, error: templateError } = await supabase
        .from('template')
        .select('owner_uuid')
        .eq('id', templateId)
        .single()

      if (templateError || !template) {
        console.error('Template fetch error:', templateError)
        return new Response(
          JSON.stringify({ error: 'Template not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (template.owner_uuid !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: Template not owned by coach' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      // Verify coach-athlete relationship
      const { data: athlete, error: athleteError } = await supabase
        .from('athletes')
        .select('coach_uuid')
        .eq('id', athleteUuid)
        .single()

      if (athleteError || !athlete) {
        console.error('Athlete fetch error:', athleteError)
        return new Response(
          JSON.stringify({ error: 'Athlete not found' }),
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }

      if (athlete.coach_uuid !== user.id) {
        return new Response(
          JSON.stringify({ error: 'Forbidden: Athlete not on your roster' }),
          { 
            status: 403, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid user role' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // 6. Call the RPC function to create the program
    const { data: programId, error: rpcError } = await supabase.rpc('fn_create_program_from_template', {
      p_template_id: templateId,
      p_athlete: targetAthleteUuid,
      p_coach: coachUuid,
      p_start_date: new Date().toISOString().split('T')[0] // Today's date
    })

    if (rpcError) {
      console.error('RPC error:', rpcError)
      return new Response(
        JSON.stringify({ error: 'Failed to create program', details: rpcError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Program created successfully:', programId)

    // 7. Return success response
    return new Response(
      JSON.stringify({ programId }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
