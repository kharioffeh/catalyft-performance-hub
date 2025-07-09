import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Camera, 
  QrCode, 
  PenTool,
  Check,
  Loader2,
  Edit3,
  Plus,
  Minus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import GlassCard from '@/components/ui/GlassCard';

interface MealData {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  confidence?: number;
}

export const MealParseScreen: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, data } = location.state || { mode: 'photo', data: null };
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [servings, setServings] = useState(1);
  const [mealData, setMealData] = useState<MealData>({
    name: mode === 'barcode' ? 'Product from barcode' : mode === 'photo' ? 'Detected meal' : '',
    calories: 450,
    protein: 25,
    carbs: 35,
    fat: 15,
    servingSize: '1 serving',
    confidence: mode === 'photo' ? 85 : mode === 'barcode' ? 95 : undefined
  });

  const handleSaveMeal = () => {
    // TODO: Integrate with actual meal logging
    console.log('Saving meal:', {
      ...mealData,
      servings,
      totalCalories: mealData.calories * servings,
      totalProtein: mealData.protein * servings,
      totalCarbs: mealData.carbs * servings,
      totalFat: mealData.fat * servings
    });
    
    navigate('/nutrition', { state: { tab: 'meals' } });
  };

  const handleRetake = () => {
    navigate(-1); // Go back to camera
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

  const totalCalories = mealData.calories * servings;
  const totalProtein = mealData.protein * servings;
  const totalCarbs = mealData.carbs * servings;
  const totalFat = mealData.fat * servings;

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end flex items-center justify-center p-4">
        <GlassCard className="p-8 text-center max-w-sm w-full">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {mode === 'photo' && 'Analyzing photo...'}
            {mode === 'barcode' && 'Looking up product...'}
            {mode === 'describe' && 'Processing entry...'}
          </h3>
          <p className="text-white/70 text-sm">
            This may take a few seconds
          </p>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-start to-background-end">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/nutrition')}
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

          {mealData.confidence && (
            <Badge variant="secondary" className="ml-auto">
              {mealData.confidence}% confident
            </Badge>
          )}
        </div>

        {/* Meal Details */}
        <GlassCard className="mb-6">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">
                {isEditing ? (
                  <Input
                    value={mealData.name}
                    onChange={(e) => setMealData(prev => ({ ...prev, name: e.target.value }))}
                    className="text-lg font-semibold bg-white/10 border-white/20 text-white"
                    placeholder="Meal name"
                  />
                ) : (
                  mealData.name || 'Enter meal name'
                )}
              </CardTitle>
              
              <Button
                onClick={() => setIsEditing(!isEditing)}
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Serving Size Control */}
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Servings</span>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => setServings(Math.max(0.5, servings - 0.5))}
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 text-white border-white/20 hover:bg-white/20"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                
                <span className="text-white font-semibold min-w-[3rem] text-center">
                  {servings}
                </span>
                
                <Button
                  onClick={() => setServings(servings + 0.5)}
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 text-white border-white/20 hover:bg-white/20"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Nutrition Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">{totalCalories}</div>
                <div className="text-sm text-white/70">Calories</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{totalProtein}g</div>
                <div className="text-sm text-white/70">Protein</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{totalCarbs}g</div>
                <div className="text-sm text-white/70">Carbs</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{totalFat}g</div>
                <div className="text-sm text-white/70">Fat</div>
              </div>
            </div>

            {/* Editable Fields */}
            {isEditing && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Calories</label>
                    <Input
                      type="number"
                      value={mealData.calories}
                      onChange={(e) => setMealData(prev => ({ 
                        ...prev, 
                        calories: Number(e.target.value) 
                      }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Protein (g)</label>
                    <Input
                      type="number"
                      value={mealData.protein}
                      onChange={(e) => setMealData(prev => ({ 
                        ...prev, 
                        protein: Number(e.target.value) 
                      }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Carbs (g)</label>
                    <Input
                      type="number"
                      value={mealData.carbs}
                      onChange={(e) => setMealData(prev => ({ 
                        ...prev, 
                        carbs: Number(e.target.value) 
                      }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-white/70 mb-1 block">Fat (g)</label>
                    <Input
                      type="number"
                      value={mealData.fat}
                      onChange={(e) => setMealData(prev => ({ 
                        ...prev, 
                        fat: Number(e.target.value) 
                      }))}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </GlassCard>

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
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            <Check className="w-4 h-4 mr-2" />
            Log Meal
          </Button>
        </div>

        {/* Mode-specific Tips */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
          <p className="text-white/70 text-sm">
            {mode === 'photo' && "💡 For better accuracy, ensure good lighting and include the entire meal in the photo."}
            {mode === 'barcode' && "💡 Barcode scans provide the most accurate nutritional information."}
            {mode === 'describe' && "💡 Be as specific as possible about ingredients and cooking methods for better tracking."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default MealParseScreen;