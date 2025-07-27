import { serve } from 'https://deno.land/std@0.193.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { publishEvent } from "../_shared/ably.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Only allow POST method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
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
    );

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse request body
    const body = await req.json();
    const { session_id, exercise, weight, reps, rpe, tempo, velocity } = body;

    // Validate required fields
    if (!session_id || !exercise || weight === undefined || !reps) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: session_id, exercise, weight, reps' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate data types and constraints
    if (typeof weight !== 'number' || weight < 0) {
      return new Response(
        JSON.stringify({ error: 'Weight must be a non-negative number' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!Number.isInteger(reps) || reps < 1) {
      return new Response(
        JSON.stringify({ error: 'Reps must be a positive integer' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (rpe !== undefined && (!Number.isInteger(rpe) || rpe < 1 || rpe > 10)) {
      return new Response(
        JSON.stringify({ error: 'RPE must be an integer between 1 and 10' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (velocity !== undefined && (typeof velocity !== 'number' || velocity < 0)) {
      return new Response(
        JSON.stringify({ error: 'Velocity must be a non-negative number' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify that the session exists and belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('id', session_id)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return new Response(
        JSON.stringify({ error: 'Session not found or unauthorized' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Insert workout set
    const { data: workoutSet, error: setError } = await supabase
      .from('workout_sets')
      .insert({
        session_id,
        exercise: exercise.trim(),
        weight,
        reps,
        rpe: rpe || null,
        tempo: tempo?.trim() || null,
        velocity: velocity || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (setError) {
      console.error('Error creating workout set:', setError);
      return new Response(
        JSON.stringify({ error: 'Failed to create workout set' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Publish event after successful DB operation
    const uid = user.id;
    publishEvent(uid, "setLogged", { session_id, set_id: workoutSet.id });

    return new Response(
      JSON.stringify(workoutSet),
      { 
        status: 201, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in logSet:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});