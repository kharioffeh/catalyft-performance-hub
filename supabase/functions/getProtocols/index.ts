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

    // Parse URL parameters for filtering
    const url = new URL(req.url);
    const muscleTarget = url.searchParams.get('muscle_target');
    const maxDuration = url.searchParams.get('max_duration');
    const minDuration = url.searchParams.get('min_duration');

    console.log(`Getting mobility protocols with filters: muscle_target=${muscleTarget}, max_duration=${maxDuration}, min_duration=${minDuration}`);

    // Build query with optional filters
    let query = supabase
      .from('mobility_protocols')
      .select('*')
      .order('name', { ascending: true });

    // Apply filters if provided
    if (muscleTarget) {
      query = query.contains('muscle_targets', [muscleTarget]);
    }

    if (maxDuration) {
      const maxDurationNum = parseInt(maxDuration);
      if (!isNaN(maxDurationNum)) {
        query = query.lte('duration_min', maxDurationNum);
      }
    }

    if (minDuration) {
      const minDurationNum = parseInt(minDuration);
      if (!isNaN(minDurationNum)) {
        query = query.gte('duration_min', minDurationNum);
      }
    }

    const { data: protocols, error } = await query;

    if (error) {
      console.error('Error fetching mobility protocols:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully fetched ${protocols.length} mobility protocols`);

    return new Response(
      JSON.stringify({ protocols }),
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