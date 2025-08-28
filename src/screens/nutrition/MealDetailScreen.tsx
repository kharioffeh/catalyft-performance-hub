import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Share, Trash2, Plus, Minus, Clock, Users, Star } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isExpanded: boolean;
}

interface Meal {
  id: string;
  name: string;
  description: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  prepTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Ingredient[];
  instructions: string[];
  tags: string[];
  image?: string;
}

const MealDetailScreen: React.FC = () => {
  const [meal] = useState<Meal>({
    id: '1',
    name: 'Grilled Chicken Quinoa Bowl',
    description: 'A healthy and protein-packed bowl with grilled chicken, quinoa, and fresh vegetables. Perfect for meal prep and post-workout recovery.',
    totalCalories: 650,
    totalProtein: 45,
    totalCarbs: 55,
    totalFat: 25,
    prepTime: '25 minutes',
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      {
        id: '1',
        name: 'Chicken Breast',
        amount: '200g',
        calories: 330,
        protein: 40,
        carbs: 0,
        fat: 7,
        isExpanded: false
      },
      {
        id: '2',
        name: 'Quinoa',
        amount: '100g dry',
        calories: 120,
        protein: 4,
        carbs: 22,
        fat: 2,
        isExpanded: false
      },
      {
        id: '3',
        name: 'Mixed Vegetables',
        amount: '150g',
        calories: 45,
        protein: 3,
        carbs: 8,
        fat: 0,
        isExpanded: false
      },
      {
        id: '4',
        name: 'Olive Oil',
        amount: '15ml',
        calories: 135,
        protein: 0,
        carbs: 0,
        fat: 15,
        isExpanded: false
      },
      {
        id: '5',
        name: 'Herbs & Spices',
        amount: 'To taste',
        calories: 20,
        protein: 1,
        carbs: 4,
        fat: 1,
        isExpanded: false
      }
    ],
    instructions: [
      'Season chicken breast with herbs and spices',
      'Grill chicken for 6-8 minutes per side until cooked through',
      'Cook quinoa according to package instructions',
      'Steam or sauté mixed vegetables',
      'Assemble bowl with quinoa base, vegetables, and sliced chicken',
      'Drizzle with olive oil and additional seasonings'
    ],
    tags: ['High Protein', 'Low Carb', 'Meal Prep', 'Post-Workout']
  });

  const toggleIngredientExpansion = (ingredientId: string) => {
    // In a real app, you'd update the state here
    console.log('Toggle ingredient:', ingredientId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 rounded-full p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white">{meal.name}</h1>
              <p className="text-slate-300 text-sm">{meal.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 rounded-full p-2"
              >
                <Share className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/10 rounded-full p-2"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Meal Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{meal.totalCalories}</div>
              <div className="text-sm text-slate-400">Calories</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{meal.totalProtein}g</div>
              <div className="text-sm text-slate-400">Protein</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{meal.totalCarbs}g</div>
              <div className="text-sm text-slate-400">Carbs</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-white">{meal.totalFat}g</div>
              <div className="text-sm text-slate-400">Fat</div>
            </CardContent>
          </Card>
        </div>

        {/* Macro Rings */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white text-center">Macro Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="relative">
                {/* Macro Rings SVG */}
                <svg width="240" height="240" className="transform -rotate-90">
                  {/* Background circles */}
                  <circle
                    cx="120"
                    cy="120"
                    r="100"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="80"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="10"
                  />
                  <circle
                    cx="120"
                    cy="120"
                    r="60"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="8"
                  />
                  
                  {/* Protein ring (outer) */}
                  <circle
                    cx="120"
                    cy="120"
                    r="100"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 100}`}
                    strokeDashoffset={`${2 * Math.PI * 100 * (1 - (meal.totalProtein / 150))}`}
                    className="transition-all duration-1000 ease-out"
                  />
                  
                  {/* Carbs ring (middle) */}
                  <circle
                    cx="120"
                    cy="120"
                    r="80"
                    fill="none"
                    stroke="#eab308"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - (meal.totalCarbs / 200))}`}
                    className="transition-all duration-1000 ease-out"
                    style={{ animationDelay: '200ms' }}
                  />
                  
                  {/* Fat ring (inner) */}
                  <circle
                    cx="120"
                    cy="120"
                    r="60"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 60}`}
                    strokeDashoffset={`${2 * Math.PI * 60 * (1 - (meal.totalFat / 65))}`}
                    className="transition-all duration-1000 ease-out"
                    style={{ animationDelay: '400ms' }}
                  />
                </svg>
                
                {/* Center content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-2xl font-bold text-white mb-1">
                    {Math.round((meal.totalProtein + meal.totalCarbs + meal.totalFat) / 3)}g
                  </div>
                  <div className="text-sm text-white/70">Avg per macro</div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium text-white">Protein</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {meal.totalProtein}g
                </div>
                <div className="text-xs text-white/70">
                  {Math.round((meal.totalProtein / 150) * 100)}% of daily goal
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm font-medium text-white">Carbs</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {meal.totalCarbs}g
                </div>
                <div className="text-xs text-white/70">
                  {Math.round((meal.totalCarbs / 200) * 100)}% of daily goal
                </div>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm font-medium text-white">Fat</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {meal.totalFat}g
                </div>
                <div className="text-xs text-white/70">
                  {Math.round((meal.totalFat / 65) * 100)}% of daily goal
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Meal Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ingredients */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <span>Ingredients</span>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {meal.ingredients.length} items
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {meal.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="p-3 bg-white/5 rounded-lg border border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                  onClick={() => toggleIngredientExpansion(ingredient.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                      <div>
                        <div className="font-medium text-white">{ingredient.name}</div>
                        <div className="text-sm text-slate-400">{ingredient.amount}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{ingredient.calories} kcal</div>
                      <div className="text-xs text-slate-400">
                        P: {ingredient.protein}g | C: {ingredient.carbs}g | F: {ingredient.fat}g
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Meal Details */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Meal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-white font-medium">Prep Time</div>
                  <div className="text-sm text-slate-400">{meal.prepTime}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-white font-medium">Servings</div>
                  <div className="text-sm text-slate-400">{meal.servings} people</div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Star className="w-5 h-5 text-slate-400" />
                <div>
                  <div className="text-white font-medium">Difficulty</div>
                  <Badge className={getDifficultyColor(meal.difficulty)}>
                    {meal.difficulty}
                  </Badge>
                </div>
              </div>
              
              <div>
                <div className="text-white font-medium mb-2">Tags</div>
                <div className="flex flex-wrap gap-2">
                  {meal.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meal.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="text-white">{instruction}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full">
            <Plus className="w-5 h-5 mr-2" />
            Add to Today's Meals
          </Button>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-full"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Meal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MealDetailScreen;