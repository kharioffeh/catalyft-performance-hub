
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders
      });
    }

    // Check if user is a coach
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'coach') {
      return new Response(JSON.stringify({ error: 'Only coaches can assign templates' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const { template_id, athlete_ids } = await req.json();

    if (!template_id || !athlete_ids || !Array.isArray(athlete_ids) || athlete_ids.length === 0) {
      return new Response(JSON.stringify({ error: 'Invalid parameters' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Get coach UUID
    const { data: coach } = await supabase
      .from('coaches')
      .select('id')
      .eq('email', user.email)
      .single();

    if (!coach) {
      return new Response(JSON.stringify({ error: 'Coach not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // Get template data
    const { data: template, error: templateError } = await supabase
      .from('program_templates')
      .select('block_json')
      .eq('id', template_id)
      .single();

    if (templateError || !template) {
      return new Response(JSON.stringify({ error: 'Template not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // Verify all athletes belong to this coach
    const { data: athletes, error: athletesError } = await supabase
      .from('athletes')
      .select('id')
      .eq('coach_uuid', coach.id)
      .in('id', athlete_ids);

    if (athletesError || athletes.length !== athlete_ids.length) {
      return new Response(JSON.stringify({ error: 'Some athletes not found or not owned by coach' }), {
        status: 400,
        headers: corsHeaders
      });
    }

    // Insert workout blocks for each athlete
    const workoutBlocks = athlete_ids.map(athlete_id => ({
      athlete_uuid: athlete_id,
      data: {
        ...template.block_json,
        origin: 'TEMPLATE',
        meta: { template_id }
      }
    }));

    const { data: insertedBlocks, error: insertError } = await supabase
      .from('workout_blocks')
      .insert(workoutBlocks)
      .select();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        count: insertedBlocks.length,
        message: `Template assigned to ${insertedBlocks.length} athletes`
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in assign_template:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
