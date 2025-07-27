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

    const { challenge_id, progressDelta } = await req.json();

    // Validate inputs
    if (!challenge_id || typeof challenge_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Challenge ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (progressDelta === undefined || progressDelta === null || typeof progressDelta !== 'number') {
      return new Response(
        JSON.stringify({ error: 'Progress delta is required and must be a number' }),
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

    console.log(`User ${user.id} updating progress for challenge: ${challenge_id} with delta: ${progressDelta}`);

    // First, get the current participation record
    const { data: currentParticipation, error: fetchError } = await supabase
      .from('challenge_participants')
      .select('id, progress, challenge_id, challenges!inner(title, start_date, end_date)')
      .eq('challenge_id', challenge_id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !currentParticipation) {
      return new Response(
        JSON.stringify({ error: 'User is not participating in this challenge' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if challenge is still active
    const now = new Date();
    const endDate = new Date(currentParticipation.challenges.end_date);
    
    if (endDate < now) {
      return new Response(
        JSON.stringify({ error: 'Challenge has already ended' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate new progress (adding the delta to current progress)
    const newProgress = (currentParticipation.progress || 0) + progressDelta;

    // Ensure progress doesn't go below 0
    const finalProgress = Math.max(0, newProgress);

    // Update the progress
    const { data: updatedParticipation, error: updateError } = await supabase
      .from('challenge_participants')
      .update({ progress: finalProgress })
      .eq('id', currentParticipation.id)
      .select(`
        *,
        challenges (title, start_date, end_date)
      `)
      .single();

    if (updateError) {
      console.error('Error updating progress:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully updated progress to ${finalProgress} for challenge ${challenge_id}`);

    // Publish event after successful DB operation
    const uid = user.id;
    publishEvent(uid, "challengeProgressUpdated", { challenge_id, progress: finalProgress });

    return new Response(
      JSON.stringify({ 
        participation: updatedParticipation,
        progressDelta: progressDelta,
        newProgress: finalProgress,
        previousProgress: currentParticipation.progress || 0
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