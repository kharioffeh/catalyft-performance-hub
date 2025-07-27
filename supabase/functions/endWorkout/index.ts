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
    // Only allow PATCH method
    if (req.method !== 'PATCH') {
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
    const { session_id } = body;

    // Validate required fields
    if (!session_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required field: session_id' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify that the session exists and belongs to the user
    const { data: session, error: sessionError } = await supabase
      .from('workout_sessions')
      .select('id, ended_at')
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

    // Check if session is already ended
    if (session.ended_at) {
      return new Response(
        JSON.stringify({ error: 'Session already ended' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Update session with ended_at timestamp
    const { data: updatedSession, error: updateError } = await supabase
      .from('workout_sessions')
      .update({
        ended_at: new Date().toISOString()
      })
      .eq('id', session_id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error ending workout session:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to end workout session' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Publish event after successful DB operation
    const uid = user.id;
    publishEvent(uid, "sessionEnded", { session_id });

    return new Response(
      JSON.stringify({ 
        message: 'Workout session ended successfully',
        session: updatedSession
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in endWorkout:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});