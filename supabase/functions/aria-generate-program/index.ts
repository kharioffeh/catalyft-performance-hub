
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;

    if (!user?.email) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { athlete_uuid, coach_uuid, goal, weeks } = await req.json();

    // Use consistent naming with OPENAI_ARIA_KEY instead of OPENAI_KEY_ARIA
    const OPENAI_ARIA_KEY = Deno.env.get('OPENAI_ARIA_KEY');
    if (!OPENAI_ARIA_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Create a ${weeks}-week training program for the following goal: "${goal}".

Return a JSON object with this exact structure:
{
  "title": "Program Title",
  "goal": "Training goal description", 
  "weeks": ${weeks},
  "blocks": [
    {
      "week_no": 1,
      "day_no": 1,
      "session_title": "Session Name",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": 12,
          "load_pct": 75,
          "rest_seconds": 60
        }
      ]
    }
  ]
}

Include 7 days per week for ${weeks} weeks. Focus on progressive overload and periodization.`;

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_ARIA_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are ARIA, an expert fitness coach. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      }),
    });

    const aiResponse = await openaiResponse.json();
    const content = aiResponse.choices[0].message.content;
    
    let programData;
    try {
      programData = JSON.parse(content);
    } catch (e) {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        programData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse AI response as JSON');
      }
    }

    // Create template
    const { data: template, error: templateError } = await supabaseClient
      .from('template')
      .insert({
        title: programData.title,
        goal: programData.goal,
        weeks: programData.weeks,
        owner_uuid: coach_uuid,
        visibility: 'private'
      })
      .select()
      .single();

    if (templateError) throw templateError;

    // Create template blocks
    const blocks = programData.blocks.map((block: any) => ({
      template_id: template.id,
      week_no: block.week_no,
      day_no: block.day_no,
      session_title: block.session_title,
      exercises: block.exercises
    }));

    const { error: blocksError } = await supabaseClient
      .from('template_block')
      .insert(blocks);

    if (blocksError) throw blocksError;

    return new Response(JSON.stringify({ template_id: template.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
