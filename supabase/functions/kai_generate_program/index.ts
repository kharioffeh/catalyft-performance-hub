
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
      return new Response(JSON.stringify({ error: 'Only coaches can generate programs' }), {
        status: 403,
        headers: corsHeaders
      });
    }

    const { athlete_uuid, weeks, focus } = await req.json();

    if (!athlete_uuid || !weeks || weeks < 4 || weeks > 12) {
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

    // Get athlete data and recent readiness trend
    const { data: athlete } = await supabase
      .from('athletes')
      .select('name')
      .eq('id', athlete_uuid)
      .eq('coach_uuid', coach.id)
      .single();

    if (!athlete) {
      return new Response(JSON.stringify({ error: 'Athlete not found' }), {
        status: 404,
        headers: corsHeaders
      });
    }

    // Get recent readiness scores (last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const { data: readinessScores } = await supabase
      .from('readiness_scores')
      .select('score, ts')
      .eq('athlete_uuid', athlete_uuid)
      .gte('ts', fourteenDaysAgo.toISOString())
      .order('ts', { ascending: false });

    // Get recent wearable data for context
    const { data: wearableData } = await supabase
      .from('wearable_raw')
      .select('metric, value, ts')
      .eq('athlete_uuid', athlete_uuid)
      .gte('ts', fourteenDaysAgo.toISOString())
      .in('metric', ['load', 'strain', 'hrv_rmssd', 'sleep_efficiency'])
      .order('ts', { ascending: false });

    const avgReadiness = readinessScores?.length 
      ? readinessScores.reduce((sum, r) => sum + r.score, 0) / readinessScores.length 
      : 75;

    const prompt = `You are KAI, an elite strength and conditioning coach. Generate a ${weeks}-week periodized training program for ${athlete.name}.

Context:
- Recent readiness average: ${avgReadiness.toFixed(1)}/100
- Focus: ${focus || 'General strength and conditioning'}
- Weeks requested: ${weeks}

Requirements:
1. Create a progressive periodization plan
2. Adjust intensity based on readiness (${avgReadiness < 70 ? 'conservative approach needed' : avgReadiness > 85 ? 'can handle higher intensity' : 'moderate progression'})
3. Include compound movements and accessory work
4. Specify percentages of 1RM for main lifts
5. Include proper rest periods and recovery

Return ONLY valid JSON with this exact structure:
{
  "name": "Program Name",
  "weeks": [
    [
      {
        "sessionName": "Day 1 - Upper Body",
        "exercises": [
          {
            "name": "Bench Press",
            "pct1RM": 75,
            "sets": 4,
            "reps": 6,
            "rest": "3-4 min",
            "notes": "Focus on control and form"
          }
        ]
      }
    ]
  ]
}

Each week should be an array of 3-5 sessions. Each session should have 4-8 exercises with appropriate progression across weeks.`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_KAI_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are KAI, an expert strength and conditioning coach. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.statusText}`);
    }

    const openAIData = await openAIResponse.json();
    const programData = JSON.parse(openAIData.choices[0].message.content);

    // Save to program_templates
    const { data: template, error: insertError } = await supabase
      .from('program_templates')
      .insert({
        coach_uuid: coach.id,
        name: programData.name,
        block_json: programData
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return new Response(
      JSON.stringify({ 
        template_id: template.id, 
        name: template.name,
        program: programData 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in kai_generate_program:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
