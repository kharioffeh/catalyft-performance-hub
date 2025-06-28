
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
    const ARIA_MODEL = Deno.env.get('ARIA_MODEL') || 'gpt-4o-mini';

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

    // 2. Log user message to database
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
        messages: messages || [],
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
