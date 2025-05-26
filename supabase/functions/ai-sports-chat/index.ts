
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, athleteId } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get athlete's recent data
    const [readinessData, sleepData, sessionData, wearableData] = await Promise.all([
      supabase
        .from('readiness_scores')
        .select('score, ts')
        .eq('athlete_uuid', athleteId)
        .order('ts', { ascending: false })
        .limit(7),
      
      supabase
        .from('wearable_raw')
        .select('value, ts, metric')
        .eq('athlete_uuid', athleteId)
        .eq('metric', 'sleep_efficiency')
        .order('ts', { ascending: false })
        .limit(7),
      
      supabase
        .from('sessions')
        .select('type, start_ts, end_ts, notes')
        .eq('athlete_uuid', athleteId)
        .order('start_ts', { ascending: false })
        .limit(10),
      
      supabase
        .from('wearable_raw')
        .select('value, ts, metric')
        .eq('athlete_uuid', athleteId)
        .in('metric', ['hrv_rmssd', 'strain'])
        .order('ts', { ascending: false })
        .limit(14)
    ]);

    // Prepare context for AI
    const currentReadiness = readinessData.data?.[0]?.score || 'No data';
    const avgReadiness = readinessData.data?.length > 0 
      ? Math.round(readinessData.data.reduce((sum, r) => sum + r.score, 0) / readinessData.data.length)
      : 'No data';
    
    const recentSessions = sessionData.data?.slice(0, 5) || [];
    const avgSleepEfficiency = sleepData.data?.length > 0
      ? Math.round(sleepData.data.reduce((sum, s) => sum + s.value, 0) / sleepData.data.length)
      : 'No data';

    const systemPrompt = `You are an AI sports performance analyst with access to an athlete's training and recovery data. 

Current Data Summary:
- Current Readiness Score: ${currentReadiness}%
- 7-day Average Readiness: ${avgReadiness}%
- 7-day Average Sleep Efficiency: ${avgSleepEfficiency}%
- Recent Training Sessions: ${recentSessions.length} sessions in last 10 days
- Latest Session Types: ${recentSessions.map(s => s.type).join(', ')}

Provide insights, recommendations, and answer questions based on this data. Be specific, actionable, and focus on performance optimization. If asked about trends, reference the actual data patterns. Keep responses concise but informative.

Guidelines:
- Give specific recommendations based on readiness scores
- Suggest training modifications when readiness is low (<70%)
- Highlight positive trends in recovery metrics
- Provide actionable advice for training load management
- Reference actual data points when possible`;

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
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    const aiData = await response.json();
    const aiResponse = aiData.choices[0].message.content;

    console.log(`AI Chat - User: ${message}, Response: ${aiResponse}`);

    return new Response(JSON.stringify({ 
      response: aiResponse,
      dataContext: {
        currentReadiness,
        avgReadiness,
        avgSleepEfficiency,
        recentSessionsCount: recentSessions.length
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-sports-chat function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process chat request',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
