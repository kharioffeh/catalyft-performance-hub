import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { corsHeaders } from "../_shared/cors.ts"
import { publishEvent } from "../_shared/ably.ts"

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { challenge_id } = await req.json();

    // Validate challenge_id
    if (!challenge_id || typeof challenge_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Challenge ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} joining challenge: ${challenge_id}`);

    // First, verify the challenge exists
    const { data: challenge, error: challengeError } = await supabase
      .from('challenges')
      .select('id, title, start_date, end_date')
      .eq('id', challenge_id)
      .single();

    if (challengeError || !challenge) {
      return new Response(
        JSON.stringify({ error: 'Challenge not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if challenge is still active (hasn't ended)
    const now = new Date();
    const endDate = new Date(challenge.end_date);
    
    if (endDate < now) {
      return new Response(
        JSON.stringify({ error: 'Challenge has already ended' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Upsert participation (join the challenge)
    const { data: participation, error: insertError } = await supabase
      .from('challenge_participants')
      .upsert(
        {
          challenge_id: challenge_id,
          user_id: user.id,
          progress: 0
        },
        {
          onConflict: 'challenge_id,user_id',
          ignoreDuplicates: false // We want to get the existing record if it exists
        }
      )
      .select()
      .single();

    if (insertError) {
      console.error('Error joining challenge:', insertError);
      return new Response(
        JSON.stringify({ error: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully joined challenge ${challenge_id}`);

    // Publish event after successful DB operation
    const uid = user.id;
    publishEvent(uid, "challengeJoined", { challenge_id });

    return new Response(
      JSON.stringify({ 
        participation,
        challenge: {
          id: challenge.id,
          title: challenge.title
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
})