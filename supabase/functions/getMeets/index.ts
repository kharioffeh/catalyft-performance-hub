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

    // Get current user for authentication
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} requesting meets`);

    // Get upcoming meets (start_ts >= now)
    const { data: meets, error: meetsError } = await supabase
      .from('meets')
      .select('*')
      .gte('start_ts', new Date().toISOString())
      .order('start_ts', { ascending: true });

    if (meetsError) {
      console.error('Error fetching meets:', meetsError);
      return new Response(
        JSON.stringify({ error: meetsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // For each meet, get RSVP counts
    const transformedMeets = await Promise.all(
      (meets || []).map(async (meet) => {
        const { data: rsvps, error: rsvpError } = await supabase
          .from('meet_rsvps')
          .select('status')
          .eq('meet_id', meet.id);

        if (rsvpError) {
          console.error('Error fetching RSVPs for meet:', meet.id, rsvpError);
          return {
            ...meet,
            rsvp_counts: { total: 0, yes: 0, no: 0, maybe: 0 }
          };
        }

        const rsvpCounts = {
          total: rsvps?.length || 0,
          yes: rsvps?.filter(r => r.status === 'yes').length || 0,
          no: rsvps?.filter(r => r.status === 'no').length || 0,
          maybe: rsvps?.filter(r => r.status === 'maybe').length || 0
        };

        return {
          ...meet,
          rsvp_counts: rsvpCounts
        };
      })
    );

    console.log(`Successfully fetched ${transformedMeets.length} upcoming meets`);

    return new Response(
      JSON.stringify({ meets: transformedMeets }),
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