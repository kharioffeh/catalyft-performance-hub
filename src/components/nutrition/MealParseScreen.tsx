import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Camera, 
  QrCode, 
  PenTool,
  Check,
  Loader2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/ui/GlassCard';
import { FoodListEditor, FoodItem } from './FoodListEditor';
import { LoadingShimmer } from './LoadingShimmer';
import { useNutrition } from '@/hooks/useNutrition';
import { supabase } from '@/integrations/supabase/client';

interface ParsedMealResponse {
  foods: Array<{
    name: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
  }>;
  confidence: number;
  notes?: string;
}

export const MealParseScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { addMeal } = useNutrition();
  const { mode, data, imageBase64, description } = location.state || { mode: 'photo', data: null };
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<ParsedMealResponse | null>(null);
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    parseMeal();
  }, []);

  const parseMeal = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: result, error: functionError } = await supabase.functions.invoke('ai-parse-meal', {
        body: {
          mode,
          data,
          imageBase64,
          description
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      if (result.error) {
        throw new Error(result.error);
      }

      setParsedData(result);
      
      // Convert to FoodItem format with IDs
      const foodItems: FoodItem[] = result.foods.map((food: any, index: number) => ({
        id: `food-${index}`,
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fat: food.fat,
        fiber: food.fiber,
        sugar: food.sugar
      }));

      setFoods(foodItems);
    } catch (err) {
      console.error('Error parsing meal:', err);
      setError(err instanceof Error ? err.message : 'Failed to parse meal');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (foods.length === 0) return;

    setIsSaving(true);
    try {
      // Calculate totals
      const totals = foods.reduce(
        (acc, food) => ({
          calories: acc.calories + (food.calories * food.quantity),
          protein: acc.protein + (food.protein * food.quantity),
          carbs: acc.carbs + (food.carbs * food.quantity),
          fat: acc.fat + (food.fat * food.quantity),
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      );

      // Create meal entry
      const now = new Date();
      const mealEntry = {
        date: now.toISOString().split('T')[0], // YYYY-MM-DD format
        time: now.toTimeString().split(' ')[0], // HH:MM:SS format
        name: foods.length === 1 ? foods[0].name : `Mixed meal (${foods.length} items)`,
        description: `Parsed via ${mode}. Contains: ${foods.map(f => f.name).join(', ')}. ${parsedData?.notes || ''}`.trim(),
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein * 10) / 10,
        carbs: Math.round(totals.carbs * 10) / 10,
        fat: Math.round(totals.fat * 10) / 10,
      };

      await addMeal(mealEntry);
      navigate('/nutrition/my-log', { state: { tab: 'meals' } });
    } catch (err) {
      console.error('Error saving meal:', err);
      setError('Failed to save meal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    parseMeal();
  };

  const handleRetake = () => {
    navigate(-1); // Go back to camera
  };

  const handleSwapFood = (foodId: string) => {
    // TODO: Open food search/selection modal
    console.log('Swap food:', foodId);
    // This could open a modal to search and replace the food item
  };

  const getModeIcon = () => {
    switch (mode) {
      case 'photo':
        return <Camera className="w-5 h-5" />;
      case 'barcode':
        return <QrCode className="w-5 h-5" />;
      case 'describe':
        return <PenTool className="w-5 h-5" />;
      default:
        return <Camera className="w-5 h-5" />;
    }
  };

  const getModeLabel = () => {
    switch (mode) {
      case 'photo':
        return 'Photo Analysis';
      case 'barcode':
        return 'Barcode Scan';
      case 'describe':
        return 'Manual Entry';
      default:
        return 'Meal Entry';
    }
  };

  // Calculate totals for display
  const totals = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + (food.calories * food.quantity),
      protein: acc.protein + (food.protein * food.quantity),
      carbs: acc.carbs + (food.carbs * food.quantity),
      fat: acc.fat + (food.fat * food.quantity),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate('/nutrition/my-log')}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <div className="flex items-center gap-2">
              {getModeIcon()}
              <h1 className="text-xl font-bold text-white">{getModeLabel()}</h1>
            </div>

            <div className="ml-auto flex items-center gap-2 text-white/70">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Analyzing...</span>
            </div>
          </div>

          <GlassCard className="p-6">
            <LoadingShimmer />
          </GlassCard>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <Button
              onClick={() => navigate('/nutrition/my-log')}
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            
            <div className="flex items-center gap-2">
              {getModeIcon()}
              <h1 className="text-xl font-bold text-white">{getModeLabel()}</h1>
            </div>
          </div>

          <GlassCard className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Analysis Failed</h3>
            <p className="text-white/70 mb-6">{error}</p>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleRetry}
                className="bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              
              <Button
                onClick={handleRetake}
                variant="outline"
                className="text-white border-white/20 hover:bg-white/20"
              >
                Retake
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Main UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/nutrition/my-log')}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center gap-2">
            {getModeIcon()}
            <h1 className="text-xl font-bold text-white">{getModeLabel()}</h1>
          </div>

          {parsedData?.confidence && (
            <Badge variant="secondary" className="ml-auto">
              {parsedData.confidence}% confident
            </Badge>
          )}
        </div>

        {/* Food List Editor */}
        <div className="space-y-6">
          <FoodListEditor
            foods={foods}
            onChange={setFoods}
            onSwapFood={handleSwapFood}
          />

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleRetake}
              variant="outline"
              className="flex-1 text-white border-white/20 hover:bg-white/20"
            >
              Retake
            </Button>
            
            <Button
              onClick={handleSaveMeal}
              disabled={foods.length === 0 || isSaving}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Save Meal ({Math.round(totals.calories)} kcal)
                </>
              )}
            </Button>
          </div>

          {/* Tips */}
          {parsedData?.notes && (
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-white/70 text-sm">{parsedData.notes}</p>
            </div>
          )}

          <div className="p-4 bg-white/5 rounded-lg border border-white/10">
            <p className="text-white/70 text-sm">
              {mode === 'photo' && "💡 AI analyzed your photo. You can edit quantities and nutrition values above."}
              {mode === 'barcode' && "💡 Product information retrieved. Adjust serving size as needed."}
              {mode === 'describe' && "💡 Based on your description. Please verify and adjust values."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MealParseScreen;