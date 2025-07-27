import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"
import { corsHeaders } from "../_shared/cors.ts"

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

    if (req.method !== 'GET') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current user (optional for this endpoint)
    const { data: { user } } = await supabase.auth.getUser();

    console.log(`Getting challenges list for user: ${user?.id || 'anonymous'}`);

    // Get all challenges with participant count
    const { data: challengesData, error: challengesError } = await supabase
      .from('challenges')
      .select(`
        *,
        challenge_participants (id)
      `)
      .order('created_at', { ascending: false });

    if (challengesError) {
      console.error('Error fetching challenges:', challengesError);
      return new Response(
        JSON.stringify({ error: challengesError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's participation data if user is authenticated
    let userParticipation = new Map();
    if (user) {
      const { data: participationData, error: participationError } = await supabase
        .from('challenge_participants')
        .select('challenge_id, progress')
        .eq('user_id', user.id);

      if (participationError) {
        console.error('Error fetching user participation:', participationError);
        // Don't fail the request, just continue without user participation data
      } else {
        userParticipation = new Map(
          participationData.map(p => [p.challenge_id, p.progress])
        );
      }
    }

    // Transform the data to include joinCount and userProgress
    const challenges = challengesData.map(challenge => ({
      id: challenge.id,
      title: challenge.title,
      description: challenge.description,
      start_date: challenge.start_date,
      end_date: challenge.end_date,
      created_by: challenge.created_by,
      created_at: challenge.created_at,
      joinCount: challenge.challenge_participants?.length || 0,
      userProgress: user ? (userParticipation.get(challenge.id) || null) : null,
      isJoined: user ? userParticipation.has(challenge.id) : false
    }));

    console.log(`Successfully fetched ${challenges.length} challenges`);

    return new Response(
      JSON.stringify({ challenges }),
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