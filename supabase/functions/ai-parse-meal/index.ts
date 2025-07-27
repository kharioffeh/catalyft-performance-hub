import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParseMealRequest {
  text: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { text }: ParseMealRequest = await req.json();

    if (!text) {
      throw new Error('Text is required in request body');
    }

    console.log('Processing meal text:', text);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a nutrition expert AI that analyzes meal descriptions and extracts accurate macronutrient information. When given a meal description (whether from OCR text, barcode lookup, or user description), calculate the total nutritional values for the entire meal.'
          },
          {
            role: 'user',
            content: `Please analyze this meal description and extract the total macronutrient information: "${text}"`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_macros",
              description: "Extract macronutrient information from a meal description",
              parameters: {
                type: "object",
                properties: {
                  kcals: { 
                    type: "integer", 
                    description: "Total calories for the meal" 
                  },
                  protein: { 
                    type: "integer", 
                    description: "Total protein in grams" 
                  },
                  carbs: { 
                    type: "integer", 
                    description: "Total carbohydrates in grams" 
                  },
                  fat: { 
                    type: "integer", 
                    description: "Total fat in grams" 
                  }
                },
                required: ["kcals", "protein", "carbs", "fat"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "extract_macros" } },
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log('OpenAI response:', JSON.stringify(aiResponse, null, 2));

    // Extract the function call arguments
    const message = aiResponse.choices[0].message;
    
    if (!message.tool_calls || message.tool_calls.length === 0) {
      throw new Error('No function call found in OpenAI response');
    }

    const functionCall = message.tool_calls[0];
    
    if (functionCall.function.name !== 'extract_macros') {
      throw new Error('Unexpected function call name');
    }

    // Parse and return the function arguments
    const macros = JSON.parse(functionCall.function.arguments);
    
    // Ensure all values are integers
    const result = {
      kcals: parseInt(macros.kcals) || 0,
      protein_g: parseInt(macros.protein) || 0,
      carbs_g: parseInt(macros.carbs) || 0,
      fat_g: parseInt(macros.fat) || 0
    };

    console.log('Extracted macros:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-parse-meal function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      kcals: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});