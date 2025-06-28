
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const OPENAI_ARIA_KEY = Deno.env.get('OPENAI_ARIA_KEY');
    const ARIA_MODEL = Deno.env.get('ARIA_MODEL') || 'gpt-4o-mini';

    if (!OPENAI_ARIA_KEY) {
      console.error('OPENAI_ARIA_KEY not configured');
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const body = await req.json();
    const { thread_id, messages } = body;
    console.log('Chat request:', { thread_id, messageCount: messages?.length });

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

    // 3. Make request to OpenAI
    console.log(`Making OpenAI request with model: ${ARIA_MODEL}`);
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_ARIA_KEY}`,
      },
      body: JSON.stringify({
        model: ARIA_MODEL,
        messages: messages || [],
        temperature: 0.7,
        max_tokens: 1000,
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

    const completion = await openaiResponse.json();
    console.log('OpenAI response received');

    // 4. Log assistant response to database
    const assistantMessage = completion.choices?.[0]?.message?.content || '';
    if (assistantMessage) {
      const { error: assistantMsgError } = await supabaseClient
        .from('aria_messages')
        .insert({
          thread_id: threadId,
          role: 'assistant',
          content: assistantMessage
        });
      
      if (assistantMsgError) {
        console.error('Error logging assistant message:', assistantMsgError);
      }
    }

    // 5. Return OpenAI response with thread_id
    return new Response(JSON.stringify({
      ...completion,
      thread_id: threadId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in aria-chat-and-log:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
