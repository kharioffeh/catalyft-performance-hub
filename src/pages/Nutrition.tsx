
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GlassCard } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Apple, Plus, TrendingUp, Target, Utensils } from 'lucide-react';
import { useNutrition } from '@/hooks/useNutrition';
import { AddMealDialog } from '@/components/nutrition/AddMealDialog';
import { MealLogList } from '@/components/nutrition/MealLogList';
import { FloatingAddButton } from '@/components/nutrition/FloatingAddButton';

const Nutrition: React.FC = () => {
  const { meals, addMeal, removeMeal, getTodaysMeals } = useNutrition();
  const [activeTab, setActiveTab] = useState('meals');

  const mockMacros = {
    calories: { current: 1850, target: 2200, unit: 'kcal' },
    protein: { current: 98, target: 120, unit: 'g' },
    carbs: { current: 180, target: 250, unit: 'g' },
    fat: { current: 65, target: 80, unit: 'g' }
  };

  const mockMeals = [
    {
      id: '1',
      name: 'Breakfast',
      time: '08:00',
      calories: 450,
      items: ['Oatmeal with berries', 'Greek yogurt', 'Almonds']
    },
    {
      id: '2',
      name: 'Lunch',
      time: '13:00',
      calories: 680,
      items: ['Grilled chicken breast', 'Brown rice', 'Mixed vegetables']
    },
    {
      id: '3',
      name: 'Dinner',
      time: '19:00',
      calories: 720,
      items: ['Salmon fillet', 'Quinoa', 'Steamed broccoli']
    }
  ];

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
    <div className="space-y-6 p-4 md:p-8">
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
            {/* Daily Macro Progress */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(mockMacros).map(([macro, data]) => (
                <Card key={macro} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium text-white capitalize">{macro}</h3>
                      <span className={`text-sm font-semibold ${getProgressColor(data.current, data.target)}`}>
                        {data.current}/{data.target} {data.unit}
                      </span>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getProgressWidth(data.current, data.target)}%` }}
                      />
                    </div>
                    <div className="mt-2 text-xs text-white/70">
                      {Math.round((data.current / data.target) * 100)}% of daily target
                    </div>
                  </CardContent>
                </Card>
              ))}
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
                  <div className="text-2xl font-bold text-green-400 mb-1">94%</div>
                  <div className="text-sm text-white/70">Weekly Average</div>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-400 mb-1">{getTodaysMeals().length}</div>
                  <div className="text-sm text-white/70">Meals Logged</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="meals" className="mt-0 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Today's Meals</h3>
              <AddMealDialog 
                onAddMeal={addMeal}
                trigger={
                  <Button className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Log Meal
                  </Button>
                }
              />
            </div>

            <MealLogList 
              meals={getTodaysMeals()} 
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
    </div>
  );
};

export default Nutrition;
