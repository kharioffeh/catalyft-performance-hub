import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Plus, Target, Flame, Apple, Beef, Bread } from 'lucide-react';

interface Meal {
  id: string;
  name: string;
  time: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  foods: string[];
  isExpanded: boolean;
}

interface DailyNutrition {
  current: number;
  target: number;
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fat: { current: number; target: number };
}

const FoodDiaryScreen: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: '1',
      name: 'Breakfast',
      time: '8:00 AM',
      calories: 420,
      protein: 25,
      carbs: 45,
      fat: 18,
      foods: ['Oatmeal with berries', 'Greek yogurt', 'Almonds'],
      isExpanded: false
    },
    {
      id: '2',
      name: 'Lunch',
      time: '12:30 PM',
      calories: 650,
      protein: 35,
      carbs: 55,
      fat: 25,
      foods: ['Grilled chicken salad', 'Quinoa', 'Olive oil dressing'],
      isExpanded: false
    },
    {
      id: '3',
      name: 'Snack',
      time: '3:00 PM',
      calories: 180,
      protein: 8,
      carbs: 22,
      fat: 8,
      foods: ['Apple', 'Peanut butter'],
      isExpanded: false
    }
  ]);

  const dailyNutrition: DailyNutrition = {
    current: meals.reduce((sum, meal) => sum + meal.calories, 0),
    target: 2000,
    protein: {
      current: meals.reduce((sum, meal) => sum + meal.protein, 0),
      target: 150
    },
    carbs: {
      current: meals.reduce((sum, meal) => sum + meal.carbs, 0),
      target: 200
    },
    fat: {
      current: meals.reduce((sum, meal) => sum + meal.fat, 0),
      target: 65
    }
  };

  const toggleMealExpansion = (mealId: string) => {
    setMeals(meals.map(meal => 
      meal.id === mealId ? { ...meal, isExpanded: !meal.isExpanded } : meal
    ));
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-blue-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Food Diary</h1>
          <p className="text-slate-300">Track your daily nutrition intake</p>
        </div>

        {/* Daily Progress Ring */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="relative">
                {/* Progress Ring */}
                <svg width="200" height="200" className="transform -rotate-90">
                  {/* Background circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="100"
                    cy="100"
                    r="80"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - getProgressPercentage(dailyNutrition.current, dailyNutrition.target) / 100)}`}
                    className="transition-all duration-1000 ease-out"
                  />
                  {/* Gradient definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {dailyNutrition.current}
                  </div>
                  <div className="text-sm text-slate-300">kcal</div>
                  <div className={`text-xs ${getProgressColor(getProgressPercentage(dailyNutrition.current, dailyNutrition.target))}`}>
                    of {dailyNutrition.target}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress stats */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Beef className="w-4 h-4 text-red-400" />
                  <span className="text-sm font-medium text-white">Protein</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {dailyNutrition.protein.current}g
                </div>
                <div className="text-xs text-slate-400">
                  {Math.round(getProgressPercentage(dailyNutrition.protein.current, dailyNutrition.protein.target))}% of goal
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Bread className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium text-white">Carbs</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {dailyNutrition.carbs.current}g
                </div>
                <div className="text-xs text-slate-400">
                  {Math.round(getProgressPercentage(dailyNutrition.carbs.current, dailyNutrition.carbs.target))}% of goal
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Apple className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-white">Fat</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {dailyNutrition.fat.current}g
                </div>
                <div className="text-xs text-slate-400">
                  {Math.round(getProgressPercentage(dailyNutrition.fat.current, dailyNutrition.fat.target))}% of goal
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add Meal Button */}
        <div className="flex justify-center">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full">
            <Plus className="w-5 h-5 mr-2" />
            Add Meal
          </Button>
        </div>

        {/* Meals List */}
        <div className="space-y-4">
          {meals.map((meal) => (
            <Card key={meal.id} className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader 
                className="pb-3 cursor-pointer"
                onClick={() => toggleMealExpansion(meal.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <div>
                      <CardTitle className="text-lg text-white">{meal.name}</CardTitle>
                      <p className="text-sm text-slate-400">{meal.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-white">{meal.calories} kcal</div>
                      <div className="text-xs text-slate-400">Total</div>
                    </div>
                    {meal.isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              {meal.isExpanded && (
                <CardContent className="pt-0">
                  <div className="border-t border-white/10 pt-4">
                    {/* Macro breakdown */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-red-500/10 rounded-lg">
                        <div className="text-sm font-medium text-red-400">Protein</div>
                        <div className="text-lg font-bold text-white">{meal.protein}g</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                        <div className="text-sm font-medium text-yellow-400">Carbs</div>
                        <div className="text-lg font-bold text-white">{meal.carbs}g</div>
                      </div>
                      <div className="text-center p-3 bg-green-500/10 rounded-lg">
                        <div className="text-sm font-medium text-green-400">Fat</div>
                        <div className="text-lg font-bold text-white">{meal.fat}g</div>
                      </div>
                    </div>
                    
                    {/* Food items */}
                    <div>
                      <div className="text-sm font-medium text-slate-300 mb-2">Foods:</div>
                      <div className="space-y-2">
                        {meal.foods.map((food, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm text-slate-400">
                            <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                            {food}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FoodDiaryScreen;