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

    console.log('Fetching clubs with member counts');

    // Get clubs with member counts using a SQL query
    const { data: clubs, error: clubsError } = await supabase
      .from('clubs')
      .select(`
        id,
        name,
        description,
        created_by,
        created_at,
        club_memberships(count)
      `)
      .order('created_at', { ascending: false });

    if (clubsError) {
      console.error('Error fetching clubs:', clubsError);
      return new Response(
        JSON.stringify({ error: clubsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Transform the data to include member count
    const clubsWithMemberCount = clubs.map(club => ({
      id: club.id,
      name: club.name,
      description: club.description,
      created_by: club.created_by,
      created_at: club.created_at,
      memberCount: club.club_memberships?.length || 0
    }));

    console.log(`Successfully fetched ${clubsWithMemberCount.length} clubs`);

    return new Response(
      JSON.stringify({ clubs: clubsWithMemberCount }),
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