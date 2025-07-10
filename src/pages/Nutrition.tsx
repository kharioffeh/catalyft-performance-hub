
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Apple, Plus, TrendingUp, Target, Utensils, Scan } from 'lucide-react';
import { useNutrition } from '@/hooks/useNutrition';
import { AddMealDialog } from '@/components/nutrition/AddMealDialog';
import { MealLogList } from '@/components/nutrition/MealLogList';
import { FloatingAddButton } from '@/components/nutrition/FloatingAddButton';
import { MacroRings } from '@/components/nutrition/MacroRings';
import { NutritionScoreCard } from '@/components/nutrition/NutritionScoreCard';
import { MealScannerCamera } from '@/components/nutrition/MealScannerCamera';
import { useFabPosition } from '@/hooks/useFabPosition';
import { cn } from '@/lib/utils';

const Nutrition: React.FC = () => {
  const { meals, addMeal, removeMeal, getTodaysMeals, getTodaysMacros, getMacroTargets, getNutritionScore } = useNutrition();
  const [activeTab, setActiveTab] = useState('overview');
  const [showScanner, setShowScanner] = useState(false);
  const { contentPadding } = useFabPosition();

  const todaysMacros = getTodaysMacros();
  const macroTargets = getMacroTargets();
  const nutritionScore = getNutritionScore();
  const todaysMeals = getTodaysMeals();

  // Prepare macro data for rings
  const macroData = {
    protein: { 
      current: todaysMacros.protein, 
      target: macroTargets.protein, 
      color: '#3B82F6' // blue
    },
    carbs: { 
      current: todaysMacros.carbs, 
      target: macroTargets.carbs, 
      color: '#10B981' // green
    },
    fat: { 
      current: todaysMacros.fat, 
      target: macroTargets.fat, 
      color: '#F59E0B' // yellow
    }
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getProgressWidth = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className={cn("space-y-6 p-4 md:p-8", contentPadding)}>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Nutrition</h1>
        <p className="text-white/70">
          Track your daily nutrition, log meals, and monitor macro targets
        </p>
      </div>

      <GlassCard className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-white/5 mb-6">
            <TabsTrigger
              value="overview"
              className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger
              value="meals"
              className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <Utensils className="w-4 h-4" />
              <span className="hidden sm:inline">Meals</span>
            </TabsTrigger>
            <TabsTrigger
              value="goals"
              className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Goals</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-0 space-y-6">
            {/* Macro Rings and Nutrition Score */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MacroRings macros={macroData} />
              <NutritionScoreCard 
                score={nutritionScore}
                mealsLogged={todaysMeals.length}
                targetMeals={3}
              />
            </div>

            {/* Daily Macro Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">Calories</h3>
                    <span className={`text-sm font-semibold ${getProgressColor(todaysMacros.calories, macroTargets.calories)}`}>
                      {todaysMacros.calories}/{macroTargets.calories} kcal
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressWidth(todaysMacros.calories, macroTargets.calories)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-white/70">
                    {Math.round((todaysMacros.calories / macroTargets.calories) * 100)}% of daily target
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">Protein</h3>
                    <span className={`text-sm font-semibold ${getProgressColor(todaysMacros.protein, macroTargets.protein)}`}>
                      {todaysMacros.protein}/{macroTargets.protein} g
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressWidth(todaysMacros.protein, macroTargets.protein)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-white/70">
                    {Math.round((todaysMacros.protein / macroTargets.protein) * 100)}% of daily target
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">Carbs</h3>
                    <span className={`text-sm font-semibold ${getProgressColor(todaysMacros.carbs, macroTargets.carbs)}`}>
                      {todaysMacros.carbs}/{macroTargets.carbs} g
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressWidth(todaysMacros.carbs, macroTargets.carbs)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-white/70">
                    {Math.round((todaysMacros.carbs / macroTargets.carbs) * 100)}% of daily target
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-white">Fat</h3>
                    <span className={`text-sm font-semibold ${getProgressColor(todaysMacros.fat, macroTargets.fat)}`}>
                      {todaysMacros.fat}/{macroTargets.fat} g
                    </span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressWidth(todaysMacros.fat, macroTargets.fat)}%` }}
                    />
                  </div>
                  <div className="mt-2 text-xs text-white/70">
                    {Math.round((todaysMacros.fat / macroTargets.fat) * 100)}% of daily target
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-white mb-1">7</div>
                  <div className="text-sm text-white/70">Day Streak</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">{nutritionScore}%</div>
                  <div className="text-sm text-white/70">Nutrition Score</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{todaysMeals.length}</div>
                  <div className="text-sm text-white/70">Meals Logged</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="meals" className="mt-0 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h3 className="text-lg font-semibold text-white">Today's Meals</h3>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button 
                  onClick={() => setShowScanner(true)}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                >
                  <Scan className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Scan Meal</span>
                  <span className="sm:hidden">Scan</span>
                </Button>
                <AddMealDialog 
                  onAddMeal={addMeal}
                  trigger={
                    <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex-1 sm:flex-none">
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Log Meal</span>
                      <span className="sm:hidden">Log</span>
                    </Button>
                  }
                />
              </div>
            </div>

            <MealLogList 
              meals={todaysMeals} 
              onDeleteMeal={removeMeal}
            />
          </TabsContent>

          <TabsContent value="goals" className="mt-0">
            <div className="flex flex-col items-center justify-center h-[400px] text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-white/70" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Set Your Goals</h3>
              <p className="text-white/70 mb-4">Define your nutrition targets and preferences</p>
              <Button
                onClick={() => console.log('Set nutrition goals')}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Set Goals
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </GlassCard>

      {/* Floating Add Button for Mobile */}
      <FloatingAddButton onAddMeal={addMeal} />

      {/* Meal Scanner Camera */}
      {showScanner && (
        <MealScannerCamera onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
};

export default Nutrition;
