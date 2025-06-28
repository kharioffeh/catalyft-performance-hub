
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: "Method Not Allowed" }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { athlete_id, metric } = await req.json();
    console.log(`Looking up ${metric} for athlete ${athlete_id}`);

    let result = null;

    // Simple metric lookup based on requested type
    switch (metric.toLowerCase()) {
      case 'readiness':
      case 'readiness_score':
        const { data: readinessData } = await supabaseClient
          .from('sessions')
          .select('readiness_score, session_date')
          .eq('athlete_id', athlete_id)
          .not('readiness_score', 'is', null)
          .order('session_date', { ascending: false })
          .limit(1)
          .single();
        
        result = readinessData ? {
          metric: 'readiness_score',
          value: readinessData.readiness_score,
          date: readinessData.session_date
        } : null;
        break;

      case 'training_load':
      case 'load':
        const { data: loadData } = await supabaseClient
          .from('sessions')
          .select('training_load, session_date')
          .eq('athlete_id', athlete_id)
          .not('training_load', 'is', null)
          .order('session_date', { ascending: false })
          .limit(1)
          .single();
        
        result = loadData ? {
          metric: 'training_load',
          value: loadData.training_load,
          date: loadData.session_date
        } : null;
        break;

      case 'sleep_score':
      case 'sleep':
        const { data: sleepData } = await supabaseClient
          .from('sessions')
          .select('sleep_score, session_date')
          .eq('athlete_id', athlete_id)
          .not('sleep_score', 'is', null)
          .order('session_date', { ascending: false })
          .limit(1)
          .single();
        
        result = sleepData ? {
          metric: 'sleep_score',
          value: sleepData.sleep_score,
          date: sleepData.session_date
        } : null;
        break;

      case 'hrv':
        const { data: hrvData } = await supabaseClient
          .from('sessions')
          .select('hrv, session_date')
          .eq('athlete_id', athlete_id)
          .not('hrv', 'is', null)
          .order('session_date', { ascending: false })
          .limit(1)
          .single();
        
        result = hrvData ? {
          metric: 'hrv',
          value: hrvData.hrv,
          date: hrvData.session_date
        } : null;
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unknown metric: ${metric}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    if (!result) {
      return new Response(
        JSON.stringify({ 
          error: `No ${metric} data found for athlete ${athlete_id}`,
          athlete_id,
          metric
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({
      success: true,
      athlete_id,
      ...result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in lookup-athlete-metric:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
