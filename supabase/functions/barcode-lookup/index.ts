import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const nutritionixAppId = Deno.env.get('NUTRITIONIX_APP_ID');
const nutritionixApiKey = Deno.env.get('NUTRITIONIX_API_KEY');

interface BarcodeRequest {
  barcode: string;
}

interface NutritionixResponse {
  foods: Array<{
    food_name: string;
    brand_name: string;
    nf_calories: number;
    nf_protein: number;
    nf_total_carbohydrate: number;
    nf_total_fat: number;
  }>;
}

interface NutritionResponse {
  kcals: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

async function callAiParseMeal(text: string): Promise<NutritionResponse> {
  const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/ai-parse-meal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`ai-parse-meal failed: ${response.status}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!nutritionixAppId || !nutritionixApiKey) {
      throw new Error('Nutritionix API credentials not configured');
    }

    const { barcode }: BarcodeRequest = await req.json();

    if (!barcode) {
      throw new Error('Barcode is required in request body');
    }

    console.log('Looking up barcode:', barcode);

    // Try Nutritionix API first
    let productInfo: { brand_name?: string; food_name?: string } = {};
    
    try {
      const nutritionixResponse = await fetch(
        `https://trackapi.nutritionix.com/v2/search/item?upc=${barcode}`,
        {
          headers: {
            'x-app-id': nutritionixAppId,
            'x-app-key': nutritionixApiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      if (nutritionixResponse.ok) {
        const data: NutritionixResponse = await nutritionixResponse.json();
        
        if (data.foods && data.foods.length > 0) {
          const food = data.foods[0];
          
          // Store product info for potential fallback
          productInfo = {
            brand_name: food.brand_name,
            food_name: food.food_name,
          };
          
          // Check if we have complete nutrition data
          if (food.nf_calories !== undefined && food.nf_calories !== null) {
            // Map Nutritionix response to our standard format
            const result: NutritionResponse = {
              kcals: Math.round(food.nf_calories || 0),
              protein_g: Math.round(food.nf_protein || 0),
              carbs_g: Math.round(food.nf_total_carbohydrate || 0),
              fat_g: Math.round(food.nf_total_fat || 0),
            };

            console.log('Nutritionix result:', result);
            
            return new Response(JSON.stringify(result), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          } else {
            console.log('Nutritionix found product but missing nutrition data, will use ai-parse-meal fallback');
          }
        }
      }

      // If we get here, either the response wasn't ok or no foods found
      if (nutritionixResponse.status === 404) {
        console.log('Barcode not found in Nutritionix, will try fallback');
      } else {
        console.log(`Nutritionix API returned ${nutritionixResponse.status}, will try fallback`);
      }

    } catch (nutritionixError) {
      console.log('Nutritionix API error:', nutritionixError.message);
    }

    // Fallback: use ai-parse-meal with available product info
    console.log('Attempting fallback to ai-parse-meal');
    
    // Create fallback text using brand + item_name if available, otherwise use barcode
    let fallbackText = `Product with barcode ${barcode}`;
    if (productInfo.brand_name && productInfo.food_name) {
      fallbackText = `${productInfo.brand_name} ${productInfo.food_name}`;
    } else if (productInfo.food_name) {
      fallbackText = productInfo.food_name;
    } else if (productInfo.brand_name) {
      fallbackText = `${productInfo.brand_name} product`;
    }
    
    console.log('Using fallback text:', fallbackText);
    
    try {
      const aiResult = await callAiParseMeal(fallbackText);
      console.log('AI parse meal fallback result:', aiResult);
      
      return new Response(JSON.stringify(aiResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (aiError) {
      console.error('AI parse meal fallback failed:', aiError);
      
      // Return default values if everything fails
      const defaultResult: NutritionResponse = {
        kcals: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
      };

      return new Response(JSON.stringify(defaultResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in barcode-lookup function:', error);
    
    const errorResult: NutritionResponse = {
      kcals: 0,
      protein_g: 0,
      carbs_g: 0,
      fat_g: 0,
    };

    return new Response(JSON.stringify({ 
      error: error.message,
      ...errorResult
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});