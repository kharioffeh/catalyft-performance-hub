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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching clubs for user: ${user.id}`);

    // Get clubs that the user has joined
    const { data: memberships, error: membershipsError } = await supabase
      .from('club_memberships')
      .select(`
        joined_at,
        clubs (
          id,
          name,
          description,
          created_by,
          created_at
        )
      `)
      .eq('user_id', user.id)
      .order('joined_at', { ascending: false });

    if (membershipsError) {
      console.error('Error fetching user clubs:', membershipsError);
      return new Response(
        JSON.stringify({ error: membershipsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform the data to include club info with join date
    const myClubs = memberships.map(membership => ({
      ...membership.clubs,
      joined_at: membership.joined_at
    }));

    console.log(`Successfully fetched ${myClubs.length} clubs for user ${user.id}`);

    return new Response(
      JSON.stringify({ clubs: myClubs }),
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