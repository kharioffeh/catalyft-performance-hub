import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

interface ParseMealRequest {
  mode: 'photo' | 'barcode' | 'describe';
  data: string;
  imageBase64?: string;
  description?: string;
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

    const { mode, data, imageBase64, description }: ParseMealRequest = await req.json();

    let systemPrompt = `You are a nutrition expert AI that analyzes meals and returns detailed nutritional information. 

Your task is to identify individual food items in a meal and provide accurate nutritional data for each item.

IMPORTANT: Return your response as a valid JSON object with this exact structure:
{
  "foods": [
    {
      "name": "Food name",
      "quantity": 1.0,
      "unit": "serving/cup/piece/gram/etc",
      "calories": 150,
      "protein": 8.5,
      "carbs": 12.0,
      "fat": 6.2,
      "fiber": 2.1,
      "sugar": 1.5
    }
  ],
  "confidence": 85,
  "notes": "Any additional notes about the analysis"
}

Rules:
- Be as accurate as possible with nutritional values
- Break down composite dishes into individual ingredients when possible
- Use realistic serving sizes and quantities
- Include fiber and sugar when relevant
- Confidence should be 0-100 based on how certain you are
- All nutritional values should be numbers (not strings)`;

    let userPrompt = '';
    let messages: any[] = [{ role: 'system', content: systemPrompt }];

    switch (mode) {
      case 'photo':
        if (!imageBase64) {
          throw new Error('Image data required for photo mode');
        }
        userPrompt = 'Analyze this meal photo and identify all the food items with their nutritional information.';
        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: userPrompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        });
        break;

      case 'barcode':
        userPrompt = `This is a barcode scan result: ${data}. Please provide nutritional information for this product. If you cannot identify the specific product, provide a reasonable estimate for a typical product with this barcode format.`;
        messages.push({ role: 'user', content: userPrompt });
        break;

      case 'describe':
        userPrompt = `The user described their meal as: "${description || data}". Please analyze this description and provide detailed nutritional information for each food item mentioned.`;
        messages.push({ role: 'user', content: userPrompt });
        break;

      default:
        throw new Error('Invalid mode specified');
    }

    console.log('Calling OpenAI with mode:', mode);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.3,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices[0].message.content;

    console.log('OpenAI response:', content);

    // Parse the JSON response
    let parsedResult;
    try {
      // Try to extract JSON if it's wrapped in markdown
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      parsedResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback response
      parsedResult = {
        foods: [
          {
            name: mode === 'barcode' ? 'Scanned Product' : mode === 'photo' ? 'Detected Food' : 'Described Meal',
            quantity: 1,
            unit: 'serving',
            calories: 250,
            protein: 15,
            carbs: 30,
            fat: 8,
            fiber: 3,
            sugar: 5
          }
        ],
        confidence: 50,
        notes: 'AI parsing failed, using fallback values'
      };
    }

    // Validate the structure
    if (!parsedResult.foods || !Array.isArray(parsedResult.foods)) {
      throw new Error('Invalid response structure from AI');
    }

    // Ensure all required fields are present and properly typed
    parsedResult.foods = parsedResult.foods.map((food: any) => ({
      name: String(food.name || 'Unknown Food'),
      quantity: Number(food.quantity || 1),
      unit: String(food.unit || 'serving'),
      calories: Number(food.calories || 0),
      protein: Number(food.protein || 0),
      carbs: Number(food.carbs || 0),
      fat: Number(food.fat || 0),
      fiber: Number(food.fiber || 0),
      sugar: Number(food.sugar || 0),
    }));

    return new Response(JSON.stringify(parsedResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-parse-meal function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      foods: [],
      confidence: 0,
      notes: 'Failed to parse meal'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});