
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_ARIA_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, context } = await req.json();
    console.log('Ask ARIA request:', { prompt, context });

    if (!prompt?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Prompt is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openAIApiKey) {
      console.error('OPENAI_ARIA_KEY not found');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: Generate embedding for the query
    console.log('Generating embedding for query...');
    const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: prompt,
      }),
    });

    if (!embeddingResponse.ok) {
      const errorText = await embeddingResponse.text();
      console.error('OpenAI embedding error:', errorText);
      throw new Error('Failed to generate embedding');
    }

    const embeddingData = await embeddingResponse.json();
    const queryEmbedding = embeddingData.data[0].embedding;

    // Step 2: Search for similar documents
    console.log('Searching for similar documents...');
    const { data: similarDocs, error: searchError } = await supabase
      .rpc('search_similar_docs', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 6
      });

    if (searchError) {
      console.error('Document search error:', searchError);
      throw new Error('Failed to search documents');
    }

    console.log(`Found ${similarDocs?.length || 0} similar documents`);

    // Step 3: Build context from retrieved documents
    let contextText = '';
    if (similarDocs && similarDocs.length > 0) {
      contextText = similarDocs
        .map(doc => `## ${doc.title} [${doc.source}]\n${doc.content_md.substring(0, 1200)}`)
        .join('\n\n---\n\n');
    }

    // Step 4: Generate response using GPT-4o
    const systemPrompt = `You are ARIA, an elite AI strength and conditioning coach with deep expertise in sports science, load monitoring, injury prevention, and performance optimization.

Your responses should be:
- Evidence-based and practical
- Tailored to strength and conditioning contexts
- Clear and actionable for coaches and athletes
- Professional yet approachable

When referencing information from the provided context, cite the document titles in parentheses.

${context ? `Current context: The user is viewing ${context} data/metrics.` : ''}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { 
        role: 'user', 
        content: contextText 
          ? `CONTEXT:\n${contextText}\n\nQUESTION:\n${prompt}`
          : `QUESTION:\n${prompt}`
      }
    ];

    console.log('Generating AI response...');
    const completionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        temperature: 0.2,
        max_tokens: 1000,
      }),
    });

    if (!completionResponse.ok) {
      const errorText = await completionResponse.text();
      console.error('OpenAI completion error:', errorText);
      throw new Error('Failed to generate response');
    }

    const completionData = await completionResponse.json();
    const answer = completionData.choices[0].message.content;

    console.log('Ask ARIA response generated successfully');

    return new Response(
      JSON.stringify({ 
        answer,
        sources: similarDocs?.map(doc => ({ title: doc.title, source: doc.source })) || []
      }), 
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in ask_aria function:', error);
    return new Response(
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
