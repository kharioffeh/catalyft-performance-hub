import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

interface RequestBody {
  user_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: corsHeaders }
    );
  }

  try {
    // Parse request body
    const { user_id }: RequestBody = await req.json();
    
    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Initialize Supabase client (Edge Functions have these automatically)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get current date
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Get 7 days ago date
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0];

    // Fetch today's readiness data
    const { data: readinessData, error: readinessError } = await supabase
      .from('readiness_scores')
      .select('score, ts')
      .eq('athlete_uuid', user_id)
      .gte('ts', currentDate + 'T00:00:00.000Z')
      .lt('ts', currentDate + 'T23:59:59.999Z')
      .order('ts', { ascending: false })
      .limit(1);

    if (readinessError) {
      console.error('Error fetching readiness data:', readinessError);
    }

    // Fetch today's muscle load data
    const { data: todayMuscleLoadData, error: todayMuscleLoadError } = await supabase
      .from('muscle_load_daily')
      .select('muscle, acute_load, chronic_load, acwr, day')
      .eq('athlete_id', user_id)
      .eq('day', currentDate);

    if (todayMuscleLoadError) {
      console.error('Error fetching today muscle load data:', todayMuscleLoadError);
    }

    // Fetch last 7 days of muscle load data
    const { data: weeklyMuscleLoadData, error: weeklyMuscleLoadError } = await supabase
      .from('muscle_load_daily')
      .select('muscle, acute_load, chronic_load, acwr, day')
      .eq('athlete_id', user_id)
      .gte('day', sevenDaysAgoStr)
      .order('day', { ascending: false });

    if (weeklyMuscleLoadError) {
      console.error('Error fetching weekly muscle load data:', weeklyMuscleLoadError);
    }

    // Check if we have any data to work with
    if (!readinessData?.length && !todayMuscleLoadData?.length && !weeklyMuscleLoadData?.length) {
      return new Response(
        JSON.stringify({ error: 'No data available for insight generation' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Prepare data for OpenAI
    const contextData = {
      currentDate,
      readiness: readinessData?.[0] || null,
      todayMuscleLoad: todayMuscleLoadData || [],
      weeklyMuscleLoad: weeklyMuscleLoadData || []
    };

    // Generate insights using OpenAI
    const insights = await generateInsights(contextData);

    if (!insights || insights.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Failed to generate insights' }),
        { status: 500, headers: corsHeaders }
      );
    }

    // Insert insights into aria_insights table
    const insertPromises = insights.map(insight => 
      supabase
        .from('aria_insights')
        .insert({
          user_id,
          date: currentDate,
          insight_text: insight
        })
    );

    const results = await Promise.all(insertPromises);
    
    // Check for any insertion errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Error inserting insights:', errors);
      return new Response(
        JSON.stringify({ error: 'Failed to insert insights' }),
        { status: 500, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ created: insights.length }),
      { status: 200, headers: corsHeaders }
    );

  } catch (error) {
    console.error('Error in aria-generate-insights:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: corsHeaders }
    );
  }
});

async function generateInsights(contextData: any): Promise<string[]> {
  // Use OPENAI_ARIA_KEY to be consistent with other ARIA functions
  const openAIApiKey = Deno.env.get('OPENAI_ARIA_KEY') || Deno.env.get('OPENAI_API_KEY');
  if (!openAIApiKey) {
    throw new Error('OPENAI_ARIA_KEY environment variable is not set');
  }

  const systemPrompt = `You are ARIA, an elite performance coach. Based on the athlete's readiness and muscle load data, provide 2-3 plain-text coaching insights. Each insight should be a single sentence that's actionable and specific. Focus on practical recommendations for training, recovery, or performance optimization.

Guidelines:
- Maximum 3 insights
- Each insight should be a complete sentence
- Be specific and actionable
- Consider readiness levels and muscle load patterns
- Address both immediate concerns and performance optimization
- Keep insights concise but informative`;

  const userPrompt = `Current Date: ${contextData.currentDate}

Readiness Data:
${contextData.readiness ? `Score: ${contextData.readiness.score}% (${contextData.readiness.ts})` : 'No readiness data available'}

Today's Muscle Load:
${contextData.todayMuscleLoad.length > 0 ? 
  contextData.todayMuscleLoad.map(m => `${m.muscle}: Acute=${m.acute_load}, Chronic=${m.chronic_load}, ACWR=${m.acwr}`).join('\n') : 
  'No muscle load data for today'}

Weekly Muscle Load Trends (Last 7 Days):
${contextData.weeklyMuscleLoad.length > 0 ? 
  contextData.weeklyMuscleLoad.map(m => `${m.day} - ${m.muscle}: ACWR=${m.acwr}`).join('\n') : 
  'No weekly muscle load data available'}

Provide 2-3 coaching insights based on this data.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Split the response into individual sentences
    const sentences = content
      .split(/[.!?]+/)
      .map((sentence: string) => sentence.trim())
      .filter((sentence: string) => sentence.length > 0)
      .map((sentence: string) => sentence.endsWith('.') ? sentence : sentence + '.')
      .slice(0, 3); // Maximum 3 insights

    return sentences;

  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}