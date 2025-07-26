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

    console.log(`ARIA Chat request from user: ${user.id}`);

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
    const { thread_id, messages, context_window_size = 20 } = body;
    console.log('Chat request:', { thread_id, messageCount: messages?.length, context_window_size });

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

    // 2. Load context memory - get recent messages from thread for rolling context window
    const { data: contextMessages, error: contextError } = await supabaseClient
      .from('aria_messages')
      .select('role, content, created_at')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: false })
      .limit(context_window_size);

    if (contextError) {
      console.error('Error loading context messages:', contextError);
    }

    // Reverse to get chronological order and build context
    const contextMessagesOrdered = (contextMessages || []).reverse();
    const contextForOpenAI = contextMessagesOrdered.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // 3. Log user message to database
    const userMessage = messages[messages.length - 1];
    if (userMessage?.role === 'user') {
      const { error: msgError } = await supabaseClient
        .from('aria_messages')
        .insert({
          thread_id: threadId,
          role: 'user',
          content: userMessage.content,
          is_streamed: true
        });
      
      if (msgError) {
        console.error('Error logging user message:', msgError);
      }
    }

    // 4. Combine context with new messages
    const allMessages = [...contextForOpenAI, ...messages];
    console.log(`Using ${allMessages.length} messages for OpenAI request (${contextForOpenAI.length} from context)`);

    // 5. Make streaming request to OpenAI
    console.log(`Making streaming OpenAI request with model: ${ARIA_MODEL}`);
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: ARIA_MODEL,
        messages: allMessages,
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
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

    // 6. Transform OpenAI SSE → client SSE while collecting full text
    const encoder = new TextEncoder();
    let fullContent = "";
    let isFirstChunk = true;

    const stream = new ReadableStream({
      async start(controller) {
        const reader = openaiResponse.body!.getReader();
        const decoder = new TextDecoder();

        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            
            // Process each line in the chunk
            const lines = chunk.trim().split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '');
                if (dataStr === '[DONE]') {
                  // Send final SSE event with thread_id and completion status
                  const finalEvent = `data: {"thread_id": "${threadId}", "done": true}\n\n`;
                  controller.enqueue(encoder.encode(finalEvent));
                  continue;
                }
                
                try {
                  const data = JSON.parse(dataStr);
                  const delta = data.choices?.[0]?.delta;
                  
                  if (delta?.content) {
                    fullContent += delta.content;
                    
                    // Send first chunk with thread_id metadata
                    if (isFirstChunk) {
                      const metadataEvent = `data: {"thread_id": "${threadId}", "content": "${delta.content.replace(/"/g, '\\"')}"}\n\n`;
                      controller.enqueue(encoder.encode(metadataEvent));
                      isFirstChunk = false;
                    } else {
                      // Send subsequent content chunks
                      const contentEvent = `data: {"content": "${delta.content.replace(/"/g, '\\"')}"}\n\n`;
                      controller.enqueue(encoder.encode(contentEvent));
                    }
                  }
                } catch (e) {
                  // Skip invalid JSON
                  console.warn('Failed to parse SSE data:', dataStr);
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          const errorEvent = `data: {"error": "Streaming error"}\n\n`;
          controller.enqueue(encoder.encode(errorEvent));
        } finally {
          controller.close();
        }
      },
    });

    // 7. Log assistant response after streaming completes (using a separate promise)
    const logAssistantMessage = async () => {
      if (fullContent) {
        const { error: assistantMsgError } = await supabaseClient
          .from('aria_messages')
          .insert({
            thread_id: threadId,
            role: 'assistant',
            content: fullContent,
            is_streamed: true
          });
        
        if (assistantMsgError) {
          console.error('Error logging assistant message:', assistantMsgError);
        } else {
          console.log('Assistant response logged to database');
        }
      }
    };

    // Start the logging process but don't await it to avoid blocking the stream
    stream.pipeTo(new WritableStream({
      close: logAssistantMessage
    })).catch(() => {
      // Fallback: if stream piping fails, still try to log the message
      logAssistantMessage();
    });

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
    console.error('Error in ariaChat:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});