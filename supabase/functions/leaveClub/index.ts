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

    const { club_id } = await req.json();

    if (!club_id || typeof club_id !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Club ID is required' }),
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

    console.log(`User ${user.id} leaving club: ${club_id}`);

    // First, verify the club exists
    const { data: club, error: clubError } = await supabase
      .from('clubs')
      .select('id, name')
      .eq('id', club_id)
      .single();

    if (clubError || !club) {
      return new Response(
        JSON.stringify({ error: 'Club not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Delete the membership
    const { data: deletedMembership, error: deleteError } = await supabase
      .from('club_memberships')
      .delete()
      .eq('club_id', club_id)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (deleteError) {
      console.error('Error leaving club:', deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!deletedMembership) {
      return new Response(
        JSON.stringify({ error: 'You are not a member of this club' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} successfully left club ${club_id}`);

    // Publish event after successful DB operation
    const uid = user.id;
    publishEvent(uid, "clubLeft", { club_id });

    return new Response(
      JSON.stringify({ 
        message: 'Successfully left club',
        club: { id: club.id, name: club.name }
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