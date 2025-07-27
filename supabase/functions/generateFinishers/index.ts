import { serve } from 'https://deno.land/std@0.193.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

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
      .select('id, started_at, user_id')
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

    // Get the session date for muscle load lookup
    const sessionDate = new Date(session.started_at).toISOString().split('T')[0];

    // Fetch muscle load data for the session date to find top 2 muscle groups
    const { data: muscleLoadData, error: muscleLoadError } = await supabase
      .from('muscle_load_daily')
      .select('muscle, load_score')
      .eq('user_id', user.id)
      .eq('date', sessionDate)
      .order('load_score', { ascending: false })
      .limit(2);

    if (muscleLoadError) {
      console.error('Error fetching muscle load data:', muscleLoadError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch muscle load data' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If no muscle load data, return error
    if (!muscleLoadData || muscleLoadData.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No muscle load data found for session date' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Extract top muscle groups
    const topMuscleGroups = muscleLoadData.map(item => item.muscle);

    // Query mobility protocols that target these muscle groups, ordered by duration ASC
    const { data: protocols, error: protocolsError } = await supabase
      .from('mobility_protocols')
      .select('id, name, muscle_targets, duration_min')
      .overlaps('muscle_targets', topMuscleGroups)
      .order('duration_min', { ascending: true });

    if (protocolsError) {
      console.error('Error fetching mobility protocols:', protocolsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch mobility protocols' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // If no matching protocols found, return error
    if (!protocols || protocols.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No suitable mobility protocols found for muscle groups' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Take the first protocol (shortest duration)
    const selectedProtocol = protocols[0];

    // Insert into session_finishers (onConflict session_id do update)
    const { data: sessionFinisher, error: finisherError } = await supabase
      .from('session_finishers')
      .upsert({
        session_id,
        protocol_id: selectedProtocol.id,
        auto_assigned: true,
        created_at: new Date().toISOString()
      }, {
        onConflict: 'session_id'
      })
      .select()
      .single();

    if (finisherError) {
      console.error('Error creating session finisher:', finisherError);
      return new Response(
        JSON.stringify({ error: 'Failed to assign finisher protocol' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ protocol_id: selectedProtocol.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in generateFinishers:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});