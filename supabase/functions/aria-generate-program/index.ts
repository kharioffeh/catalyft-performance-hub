
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

    const { athlete_uuid, coach_uuid, goal, weeks, available_days, equipment } = await req.json();

    // Use OPENAI_ARIA_KEY instead of OPENAI_KEY_ARIA for consistency
    const OPENAI_ARIA_KEY = Deno.env.get('OPENAI_ARIA_KEY');
    if (!OPENAI_ARIA_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Create a ${weeks}-week training program for the following goal: "${goal}".
Available days: ${available_days?.join(', ') || 'All days'}
Equipment: ${equipment?.join(', ') || 'Basic gym equipment'}

Return a JSON object with this exact structure:
{
  "title": "Program Title",
  "goal": "Training goal description", 
  "weeks": ${weeks},
  "sessions": [
    {
      "week": 1,
      "day": 1,
      "title": "Session Name",
      "type": "strength",
      "duration_minutes": 60,
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": 12,
          "load_percent": 75,
          "rest_seconds": 60,
          "rpe_target": 7,
          "notes": "Form cues"
        }
      ]
    }
  ]
}

Include ${available_days?.length || 7} sessions per week for ${weeks} weeks. Focus on progressive overload and periodization.`;

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

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${openaiResponse.statusText}`);
    }

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

    // Create program template in the correct table
    const { data: programTemplate, error: templateError } = await supabaseClient
      .from('program_templates')
      .insert({
        name: programData.title,
        block_json: {
          title: programData.title,
          goal: programData.goal,
          weeks: programData.weeks,
          sessions: programData.sessions
        },
        origin: 'ARIA',
        coach_uuid: coach_uuid
      })
      .select()
      .single();

    if (templateError) {
      console.error('Template creation error:', templateError);
      throw templateError;
    }

    // Create program instance for the athlete
    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + weeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: programInstance, error: instanceError } = await supabaseClient
      .from('program_instance')
      .insert({
        athlete_uuid: athlete_uuid,
        coach_uuid: coach_uuid,
        source: 'aria',
        template_id: programTemplate.id,
        start_date: startDate,
        end_date: endDate,
        status: 'active'
      })
      .select()
      .single();

    if (instanceError) {
      console.error('Instance creation error:', instanceError);
      throw instanceError;
    }

    // Create sessions for each day in the program
    const sessionsToCreate = [];
    const startDateObj = new Date(startDate);

    programData.sessions.forEach((session: any) => {
      const sessionDate = new Date(startDateObj);
      sessionDate.setDate(startDateObj.getDate() + ((session.week - 1) * 7) + (session.day - 1));

      sessionsToCreate.push({
        program_id: programInstance.id,
        planned_at: sessionDate.toISOString(),
        exercises: session.exercises
      });
    });

    const { error: sessionsError } = await supabaseClient
      .from('session')
      .insert(sessionsToCreate);

    if (sessionsError) {
      console.error('Sessions creation error:', sessionsError);
      throw sessionsError;
    }

    return new Response(JSON.stringify({ 
      template_id: programTemplate.id,
      program_instance_id: programInstance.id
    }), {
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
