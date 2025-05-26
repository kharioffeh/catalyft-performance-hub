
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
    const { athleteId, readinessData, calendarData } = await req.json();
    
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const prompt = `You are an AI training coach. Generate a 7-day training plan based on the following data:

Athlete Readiness Data:
${JSON.stringify(readinessData, null, 2)}

Upcoming Calendar (next 7 days):
${JSON.stringify(calendarData, null, 2)}

Please generate a comprehensive workout plan that:
1. Considers the athlete's current readiness score
2. Adapts intensity based on scheduled sessions
3. Includes recovery days when readiness is low
4. Provides specific exercises, sets, reps, and intensities

Return ONLY a JSON object with this exact structure:
{
  "plan_name": "7-Day Training Plan",
  "created_date": "YYYY-MM-DD",
  "total_days": 7,
  "workouts": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "type": "strength|cardio|recovery|rest",
      "duration_minutes": 60,
      "intensity": "low|moderate|high",
      "exercises": [
        {
          "name": "Exercise Name",
          "sets": 3,
          "reps": "10-12",
          "rest_seconds": 60,
          "notes": "Form cues or modifications"
        }
      ],
      "notes": "Overall workout notes"
    }
  ],
  "weekly_summary": {
    "total_training_hours": 6,
    "intensity_distribution": "Balanced based on readiness",
    "recovery_emphasis": "High priority given readiness scores"
  }
}`;

    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert sports performance coach specializing in personalized training programs. Always respond with valid JSON only.'
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
    const workoutPlan = JSON.parse(openAIData.choices[0].message.content);

    // Save to workout_blocks table
    const { data, error } = await supabase
      .from('workout_blocks')
      .insert({
        athlete_uuid: athleteId,
        data: workoutPlan
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, workoutPlan: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating training plan:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
