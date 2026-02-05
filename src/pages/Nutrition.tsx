
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Apple, Plus, TrendingUp, Target, Utensils, Scan, Trash2, Edit, Clock } from 'lucide-react';
import { useNutrition } from '@/hooks/useNutrition';
import { AddMealDialog } from '@/components/nutrition/AddMealDialog';
import { MealLogList } from '@/components/nutrition/MealLogList';
import { FloatingAddButton } from '@/components/nutrition/FloatingAddButton';
import { MacroRings } from '@/components/nutrition/MacroRings';
import { NutritionScoreCard } from '@/components/nutrition/NutritionScoreCard';
import { useFabPosition } from '@/hooks/useFabPosition';
import { useCalorieBalance } from '@/hooks/useCalorieBalance';
import { CalorieBalanceCard } from '@/components/nutrition/CalorieBalanceCard';
import { CalorieTrendChart } from '@/components/nutrition/CalorieTrendChart';
import { WearableConnectionBanner } from '@/components/nutrition/WearableConnectionBanner';
import { WearableDeviceSelector } from '@/components/nutrition/WearableDeviceSelector';
import { cn } from '@/lib/utils';
import ParseScreen from './ParseScreen';

// Macro Split Pie Chart Component
const MacroSplitPieChart: React.FC<{ macros: any }> = ({ macros }) => {
  const total = macros.protein.current + macros.carbs.current + macros.fat.current;
  const proteinAngle = (macros.protein.current / total) * 360;
  const carbsAngle = (macros.carbs.current / total) * 360;
  const fatAngle = (macros.fat.current / total) * 360;

  return (
    <div className="relative w-32 h-32 mx-auto mb-4">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Protein slice */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#3B82F6"
          strokeWidth="20"
          strokeDasharray={`${(proteinAngle / 360) * 251.2} 251.2`}
          transform="rotate(-90 50 50)"
          className="transition-all duration-1000"
        />
        {/* Carbs slice */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#10B981"
          strokeWidth="20"
          strokeDasharray={`${(carbsAngle / 360) * 251.2} 251.2`}
          transform={`rotate(${proteinAngle - 90} 50 50)`}
          className="transition-all duration-1000"
        />
        {/* Fat slice */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#F59E0B"
          strokeWidth="20"
          strokeDasharray={`${(fatAngle / 360) * 251.2} 251.2`}
          transform={`rotate(${proteinAngle + carbsAngle - 90} 50 50)`}
          className="transition-all duration-1000"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{Math.round(total)}g</div>
          <div className="text-xs text-white/60">Total</div>
        </div>
      </div>
    </div>
  );
};

// Swipeable Meal Card Component
const SwipeableMealCard: React.FC<{
  meal: any;
  onDelete: (id: string) => void;
  onEdit: (meal: any) => void;
}> = ({ meal, onDelete, onEdit }) => {
  const [isSwiped, setIsSwiped] = useState(false);

  const handleSwipe = () => {
    setIsSwiped(!isSwiped);
  };

  const getMealTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '🌞';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍎';
      default:
        return '🍽️';
    }
  };

  const getMealTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast':
        return 'from-orange-500/20 to-yellow-500/20 border-orange-400/30';
      case 'lunch':
        return 'from-green-500/20 to-emerald-500/20 border-green-400/30';
      case 'dinner':
        return 'from-purple-500/20 to-pink-500/20 border-purple-400/30';
      case 'snack':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-400/30';
      default:
        return 'from-gray-500/20 to-slate-500/20 border-gray-400/30';
    }
  };

  return (
    <div className="relative group">
      <Card 
        className={cn(
          "bg-gradient-to-r border transition-all duration-300 cursor-pointer",
          "hover:scale-[1.02] hover:shadow-xl",
          getMealTypeColor(meal.type)
        )}
        onClick={handleSwipe}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{getMealTypeIcon(meal.type)}</div>
              <div>
                <h4 className="font-semibold text-white">{meal.name}</h4>
                <p className="text-sm text-white/60 capitalize">{meal.type}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">{meal.calories} cal</div>
              <div className="text-xs text-white/60">
                {new Date(meal.timestamp).toLocaleTimeString('en-US', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>

          {/* Macro breakdown */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="text-center p-2 bg-white/10 rounded-lg">
              <div className="text-sm font-medium text-blue-300">{meal.protein}g</div>
              <div className="text-xs text-white/60">Protein</div>
            </div>
            <div className="text-center p-2 bg-white/10 rounded-lg">
              <div className="text-sm font-medium text-green-300">{meal.carbs}g</div>
              <div className="text-xs text-white/60">Carbs</div>
            </div>
            <div className="text-center p-2 bg-white/10 rounded-lg">
              <div className="text-sm font-medium text-yellow-300">{meal.fat}g</div>
              <div className="text-xs text-white/60">Fat</div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(meal);
              }}
            >
              <Edit className="w-3 h-3 mr-1" />
              Edit
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1 bg-red-500/20 border-red-400/30 text-red-300 hover:bg-red-500/30"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(meal.id);
              }}
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const Nutrition: React.FC = () => {
  const { meals, addMeal, removeMeal, getTodaysMeals, getTodaysMacros, getMacroTargets, getNutritionScore } = useNutrition();
  const [activeTab, setActiveTab] = useState('log');
  const { contentPadding } = useFabPosition();
  const { todaysData, weeklyData, isLoading: calorieBalanceLoading } = useCalorieBalance();

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
        <h1 className="text-2xl font-bold text-white mb-2">My Nutrition</h1>
        <p className="text-white/70">
          Track your personal daily nutrition, log meals, and monitor macro targets
        </p>
      </div>

      <GlassCard className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/5 mb-6">
            <TabsTrigger
              value="log"
              className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <Utensils className="w-4 h-4" />
              <span>Log</span>
            </TabsTrigger>
            <TabsTrigger
              value="parse"
              className="flex items-center gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white"
            >
              <Scan className="w-4 h-4" />
              <span>Parse</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="log" className="mt-0 space-y-6">
            {/* Wearable Connection Banner */}
            <WearableConnectionBanner />
            
            {/* Add Device Selector for user choice */}
            <WearableDeviceSelector className="mb-6" />
            
            {/* Macro Split Pie Chart Section */}
            <div className="bg-gradient-to-br from-white/5 to-white/10 rounded-3xl p-6 border border-white/10">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Today's Macro Split</h3>
                <p className="text-white/60">Visual breakdown of your macro intake</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Pie Chart */}
                <div className="flex justify-center">
                  <MacroSplitPieChart macros={macroData} />
                </div>
                
                {/* Macro Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-500/20 rounded-2xl border border-blue-400/30">
                      <div className="text-2xl font-bold text-blue-300">{todaysMacros.protein}g</div>
                      <div className="text-sm text-blue-200">Protein</div>
                      <div className="text-xs text-blue-300/70">
                        {Math.round((todaysMacros.protein / macroTargets.protein) * 100)}% of target
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-500/20 rounded-2xl border border-green-400/30">
                      <div className="text-2xl font-bold text-green-300">{todaysMacros.carbs}g</div>
                      <div className="text-sm text-green-200">Carbs</div>
                      <div className="text-xs text-green-300/70">
                        {Math.round((todaysMacros.carbs / macroTargets.carbs) * 100)}% of target
                      </div>
                    </div>
                    <div className="text-center p-4 bg-yellow-500/20 rounded-2xl border border-yellow-400/30">
                      <div className="text-2xl font-bold text-yellow-300">{todaysMacros.fat}g</div>
                      <div className="text-sm text-yellow-200">Fat</div>
                      <div className="text-xs text-yellow-300/70">
                        {Math.round((todaysMacros.fat / macroTargets.fat) * 100)}% of target
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white/10 rounded-xl">
                      <div className="text-lg font-bold text-white">{nutritionScore}%</div>
                      <div className="text-xs text-white/60">Nutrition Score</div>
                    </div>
                    <div className="text-center p-3 bg-white/10 rounded-xl">
                      <div className="text-lg font-bold text-white">{todaysMeals.length}</div>
                      <div className="text-xs text-white/60">Meals Logged</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Calorie Balance Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {todaysData ? (
                <CalorieBalanceCard
                  caloriesConsumed={todaysData.caloriesConsumed}
                  caloriesBurned={todaysData.caloriesBurned}
                  bmr={todaysData.bmr}
                  totalExpenditure={todaysData.totalExpenditure}
                  balance={todaysData.balance}
                  balancePercentage={todaysData.balancePercentage}
                  dataSource={todaysData.dataSource}
                  isLoading={calorieBalanceLoading}
                />
              ) : (
                <CalorieBalanceCard
                  caloriesConsumed={0}
                  caloriesBurned={0}
                  bmr={0}
                  totalExpenditure={0}
                  balance={0}
                  balancePercentage={0}
                  dataSource="none"
                  isLoading={calorieBalanceLoading}
                />
              )}
              <CalorieTrendChart 
                weeklyData={weeklyData}
                isLoading={calorieBalanceLoading}
              />
            </div>

            {/* Today's Meals Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-semibold text-white">Today's Meals</h3>
                <AddMealDialog 
                  onAddMeal={addMeal}
                  trigger={
                    <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0">
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Log Meal</span>
                      <span className="sm:hidden">Log</span>
                    </Button>
                  }
                />
              </div>

              {/* Swipeable Meal Cards */}
              {todaysMeals.length > 0 ? (
                <div className="space-y-4">
                  {todaysMeals.map((meal) => (
                    <SwipeableMealCard
                      key={meal.id}
                      meal={meal}
                      onDelete={removeMeal}
                      onEdit={(meal) => {
                        // TODO: Implement edit functionality
                        {};
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
                  <div className="mx-auto h-16 w-16 text-white/20 mb-4">
                    <Utensils className="w-full h-full" />
                  </div>
                  <p className="text-white/60 text-lg mb-2">No meals logged today</p>
                  <p className="text-white/40">Start by logging your first meal</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="parse" className="mt-0">
            <div className="bg-white/5 rounded-lg overflow-hidden min-h-[600px]">
              <ParseScreen />
            </div>
          </TabsContent>
        </Tabs>
      </GlassCard>

      {/* Floating Add Button for Mobile */}
      <FloatingAddButton onAddMeal={addMeal} />
    </div>
  );
};

export default Nutrition;
