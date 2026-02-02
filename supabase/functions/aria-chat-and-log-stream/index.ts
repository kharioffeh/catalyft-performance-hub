
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
    // Initialize Supabase client for auth verification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '') ?? ''
    );
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`ARIA Stream request from user: ${user.id}`);

    // Get OpenAI API key and model from environment
    const OPENAI_API_KEY = Deno.env.get('OPENAI_ARIA_KEY');
    const ARIA_MODEL = Deno.env.get('ARIA_MODEL') || 'gpt-4o';

    if (!OPENAI_API_KEY) {
      console.error('OPENAI_ARIA_KEY not configured');
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { thread_id, messages } = body;
    console.log('Stream request:', { thread_id, messageCount: messages?.length });

    // 1. Ensure thread exists or create one
    let threadId = thread_id;
    if (!threadId) {
      const { data: threadData, error: threadError } = await supabaseClient
        .from('aria_threads')
        .insert({ user_id: user.id })
        .select('id')
        .single();
      
      if (threadError) {
        console.error('Error creating thread:', threadError);
        return new Response(
          JSON.stringify({ error: "Failed to create thread" }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      threadId = threadData.id;
      console.log('Created new thread:', threadId);
    }

    // 2. Fetch user context for system prompt
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    let contextBlock = '';
    try {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const [readinessRes, acwrRes, sleepRes, strainRes, sessionsRes] = await Promise.all([
        adminClient.from('readiness_scores').select('score, ts').eq('athlete_uuid', user.id).order('ts', { ascending: false }).limit(7),
        adminClient.from('vw_load_acwr').select('acwr_7_28, daily_load, day').eq('athlete_uuid', user.id).order('day', { ascending: false }).limit(1),
        adminClient.from('vw_sleep_daily').select('total_sleep_hours, sleep_efficiency, day').eq('athlete_uuid', user.id).order('day', { ascending: false }).limit(3),
        adminClient.from('wearable_raw').select('value, ts').eq('athlete_uuid', user.id).eq('metric', 'strain').order('ts', { ascending: false }).limit(1),
        adminClient.from('sessions').select('type, start_ts, notes').eq('athlete_uuid', user.id).order('start_ts', { ascending: false }).limit(5),
      ]);

      const parts: string[] = [];

      if (readinessRes.data?.length) {
        const latest = readinessRes.data[0];
        const avg = Math.round(readinessRes.data.reduce((s, r) => s + (r.score ?? 0), 0) / readinessRes.data.length);
        parts.push(`Readiness: latest ${latest.score}%, 7-day avg ${avg}%`);
      }

      if (acwrRes.data?.length) {
        const d = acwrRes.data[0];
        parts.push(`ACWR: ${d.acwr_7_28?.toFixed(2) ?? 'N/A'}, daily load ${d.daily_load ?? 'N/A'}`);
      }

      if (sleepRes.data?.length) {
        const d = sleepRes.data[0];
        parts.push(`Last sleep: ${d.total_sleep_hours?.toFixed(1) ?? '?'}h, efficiency ${d.sleep_efficiency ?? '?'}%`);
      }

      if (strainRes.data) {
        parts.push(`Latest strain: ${strainRes.data.value}`);
      }

      if (sessionsRes.data?.length) {
        const sessionSummary = sessionsRes.data.map(s => `${s.type} on ${s.start_ts?.split('T')[0] ?? '?'}${s.notes ? ` (${s.notes})` : ''}`).join('; ');
        parts.push(`Recent sessions: ${sessionSummary}`);
      }

      if (parts.length > 0) {
        contextBlock = parts.join('\n');
      }
    } catch (ctxErr) {
      console.error('Non-fatal: failed to fetch user context for system prompt', ctxErr);
    }

    // Build system prompt with athlete context
    const systemMessage = {
      role: 'system',
      content: `You are ARIA, an elite AI performance coach for Catalyft. You help athletes optimize training, recovery, and performance. Be concise, data-driven, and actionable in your responses. Reference the athlete's actual metrics when relevant.

${contextBlock ? `Current athlete metrics:\n${contextBlock}` : 'No athlete metrics currently available — answer based on general coaching knowledge.'}`,
    };

    // Prepend system message to the conversation
    const messagesWithContext = [systemMessage, ...(messages || [])];

    // 3. Log user message to database
    const userMessage = messages[messages.length - 1];
    if (userMessage?.role === 'user') {
      const { error: msgError } = await supabaseClient
        .from('aria_messages')
        .insert({
          thread_id: threadId,
          role: 'user',
          content: userMessage.content
        });
      
      if (msgError) {
        console.error('Error logging user message:', msgError);
      }
    }

    // 3. Make streaming request to OpenAI
    console.log(`Making streaming OpenAI request with model: ${ARIA_MODEL}`);
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: ARIA_MODEL,
        messages: messagesWithContext,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
        tools: [
          {
            type: "function",
            function: {
              name: "lookup_athlete_metric",
              description: "Return latest metric for an athlete by ID or slug",
              parameters: {
                type: "object",
                properties: {
                  athlete_id: { type: "string", description: "The athlete's ID or identifier" },
                  metric: { type: "string", description: "The metric to lookup (readiness, training_load, sleep_score, hrv)" }
                },
                required: ["athlete_id", "metric"]
              }
            }
          }
        ]
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: `OpenAI API error: ${openaiResponse.status}` }),
        { status: openaiResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Transform OpenAI SSE → client SSE while collecting full text
    const encoder = new TextEncoder();
    let fullContent = "";
    let toolCalls = [];

    const stream = new ReadableStream({
      async start(controller) {
        const reader = openaiResponse.body!.getReader();
        const decoder = new TextDecoder();

        // Send initial metadata with thread_id
        const metadataChunk = `data: {"thread_id": "${threadId}"}\n\n`;
        controller.enqueue(encoder.encode(metadataChunk));

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          
          // Process each line in the chunk
          chunk
            .trim()
            .split('\n')
            .forEach((line) => {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '');
                if (dataStr === '[DONE]') return;
                
                try {
                  const data = JSON.parse(dataStr);
                  const delta = data.choices?.[0]?.delta;
                  
                  if (delta?.content) {
                    fullContent += delta.content;
                  }
                  
                  if (delta?.tool_calls) {
                    toolCalls.push(...delta.tool_calls);
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            });

          // Forward the raw chunk to client
          controller.enqueue(encoder.encode(chunk));
        }
        
        controller.close();
      },
    });

    // 5. Log assistant response after streaming completes
    stream.pipeTo(new WritableStream({
      close: async () => {
        if (fullContent) {
          const { error: assistantMsgError } = await supabaseClient
            .from('aria_messages')
            .insert({
              thread_id: threadId,
              role: 'assistant',
              content: fullContent
            });
          
          if (assistantMsgError) {
            console.error('Error logging assistant message:', assistantMsgError);
          }
          
          console.log('Assistant response logged to database');
        }
      }
    }));

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',
      },
    });

  } catch (error) {
    console.error('Error in aria-chat-and-log-stream:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
