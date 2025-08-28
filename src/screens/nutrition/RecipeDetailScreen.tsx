import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Share, Heart, Clock, Users, Star, ChefHat, Scale, Flame } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  author: string;
  prepTime: string;
  cookTime: string;
  totalTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  category: string;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
  tags: string[];
  image?: string;
  rating: number;
  reviews: number;
  isFavorite: boolean;
  dateCreated: string;
  lastModified: string;
}

const RecipeDetailScreen: React.FC = () => {
  const [recipe] = useState<Recipe>({
    id: '1',
    name: 'Grilled Chicken Quinoa Bowl with Roasted Vegetables',
    description: 'A healthy and protein-packed bowl featuring tender grilled chicken, fluffy quinoa, and colorful roasted vegetables. This recipe is perfect for meal prep and provides a balanced combination of lean protein, complex carbohydrates, and essential nutrients.',
    author: 'Chef Sarah Johnson',
    prepTime: '20 minutes',
    cookTime: '25 minutes',
    totalTime: '45 minutes',
    servings: 4,
    difficulty: 'Easy',
    cuisine: 'Mediterranean',
    category: 'Main Course',
    ingredients: [
      {
        id: '1',
        name: 'Chicken Breast',
        amount: '600',
        unit: 'g',
        calories: 990,
        protein: 120,
        carbs: 0,
        fat: 21,
        notes: 'Boneless, skinless, cut into 4 pieces'
      },
      {
        id: '2',
        name: 'Quinoa',
        amount: '200',
        unit: 'g',
        calories: 240,
        protein: 8,
        carbs: 44,
        fat: 4,
        notes: 'Rinsed and drained'
      },
      {
        id: '3',
        name: 'Broccoli',
        amount: '300',
        unit: 'g',
        calories: 102,
        protein: 8,
        carbs: 18,
        fat: 1,
        notes: 'Cut into florets'
      },
      {
        id: '4',
        name: 'Cherry Tomatoes',
        amount: '200',
        unit: 'g',
        calories: 36,
        protein: 2,
        carbs: 8,
        fat: 0,
        notes: 'Halved'
      },
      {
        id: '5',
        name: 'Red Bell Pepper',
        amount: '150',
        unit: 'g',
        calories: 45,
        protein: 2,
        carbs: 10,
        fat: 0,
        notes: 'Sliced'
      },
      {
        id: '6',
        name: 'Olive Oil',
        amount: '60',
        unit: 'ml',
        calories: 540,
        protein: 0,
        carbs: 0,
        fat: 60,
        notes: 'Extra virgin'
      },
      {
        id: '7',
        name: 'Lemon',
        amount: '2',
        unit: 'pieces',
        calories: 20,
        protein: 1,
        carbs: 6,
        fat: 0,
        notes: 'Juiced and zested'
      },
      {
        id: '8',
        name: 'Garlic',
        amount: '4',
        unit: 'cloves',
        calories: 16,
        protein: 1,
        carbs: 4,
        fat: 0,
        notes: 'Minced'
      },
      {
        id: '9',
        name: 'Dried Oregano',
        amount: '2',
        unit: 'tsp',
        calories: 4,
        protein: 0,
        carbs: 1,
        fat: 0,
        notes: 'Dried'
      },
      {
        id: '10',
        name: 'Salt and Pepper',
        amount: 'To taste',
        unit: '',
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        notes: 'Season to preference'
      }
    ],
    instructions: [
      'Preheat the oven to 400°F (200°C) and line a baking sheet with parchment paper.',
      'In a small bowl, whisk together 2 tablespoons olive oil, lemon juice, minced garlic, oregano, salt, and pepper to create the marinade.',
      'Place chicken breasts in a shallow dish and pour half of the marinade over them. Let marinate for 15 minutes while preparing vegetables.',
      'Toss broccoli, cherry tomatoes, and red bell pepper with remaining olive oil, salt, and pepper. Spread vegetables on the prepared baking sheet.',
      'Roast vegetables in the preheated oven for 20-25 minutes, or until tender and slightly charred, stirring halfway through.',
      'While vegetables roast, cook quinoa according to package instructions. Fluff with a fork and set aside.',
      'Heat a grill pan or outdoor grill to medium-high heat. Grill marinated chicken for 6-8 minutes per side, or until internal temperature reaches 165°F (74°C).',
      'Let chicken rest for 5 minutes, then slice into strips.',
      'To assemble bowls, divide quinoa among 4 serving bowls. Top with roasted vegetables and sliced chicken.',
      'Drizzle with any remaining marinade and garnish with lemon zest. Serve immediately while warm.'
    ],
    nutrition: {
      calories: 485,
      protein: 35,
      carbs: 23,
      fat: 22,
      fiber: 6,
      sugar: 4,
      sodium: 420
    },
    tags: ['High Protein', 'Low Carb', 'Meal Prep', 'Gluten Free', 'Dairy Free', 'Quick & Easy'],
    rating: 4.8,
    reviews: 127,
    isFavorite: true,
    dateCreated: '2024-01-15',
    lastModified: '2024-01-20'
  });

  const [isFavorite, setIsFavorite] = useState(recipe.isFavorite);
  const [servingMultiplier, setServingMultiplier] = useState(1);

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getCuisineColor = (cuisine: string) => {
    const colors = {
      'Mediterranean': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'Italian': 'bg-green-500/20 text-green-400 border-green-500/30',
      'Asian': 'bg-red-500/20 text-red-400 border-red-500/30',
      'Mexican': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'American': 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    };
    return colors[cuisine as keyof typeof colors] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const calculateNutritionForServings = (servings: number) => {
    const multiplier = servings / recipe.servings;
    return {
      calories: Math.round(recipe.nutrition.calories * multiplier),
      protein: Math.round(recipe.nutrition.protein * multiplier),
      carbs: Math.round(recipe.nutrition.carbs * multiplier),
      fat: Math.round(recipe.nutrition.fat * multiplier),
      fiber: Math.round(recipe.nutrition.fiber * multiplier),
      sugar: Math.round(recipe.nutrition.sugar * multiplier),
      sodium: Math.round(recipe.nutrition.sodium * multiplier)
    };
  };

  const nutritionForServings = calculateNutritionForServings(servingMultiplier);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10 rounded-full p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white truncate">{recipe.name}</h1>
              <p className="text-slate-300 text-sm">by {recipe.author}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFavorite}
                className={`${isFavorite ? 'text-red-400' : 'text-white'} hover:bg-white/10 rounded-full p-2`}
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
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

      <div className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Recipe Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recipe Info */}
          <div className="lg:col-span-2">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6">
                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                  {recipe.description}
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <Clock className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-400">Prep Time</div>
                    <div className="text-lg font-bold text-white">{recipe.prepTime}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-400">Cook Time</div>
                    <div className="text-lg font-bold text-white">{recipe.cookTime}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <Users className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-400">Servings</div>
                    <div className="text-lg font-bold text-white">{recipe.servings}</div>
                  </div>
                  
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <ChefHat className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-400">Difficulty</div>
                    <Badge className={getDifficultyColor(recipe.difficulty)}>
                      {recipe.difficulty}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Badge className={getCuisineColor(recipe.cuisine)}>
                    {recipe.cuisine}
                  </Badge>
                  <Badge variant="outline" className="bg-white/10 border-white/20 text-white">
                    {recipe.category}
                  </Badge>
                  {recipe.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nutrition Summary */}
          <div>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Nutrition per Serving</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-2">
                    {nutritionForServings.calories}
                  </div>
                  <div className="text-sm text-slate-400">calories</div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2 bg-red-500/10 rounded">
                    <div className="text-lg font-bold text-white">{nutritionForServings.protein}g</div>
                    <div className="text-xs text-red-400">Protein</div>
                  </div>
                  <div className="text-center p-2 bg-yellow-500/10 rounded">
                    <div className="text-lg font-bold text-white">{nutritionForServings.carbs}g</div>
                    <div className="text-xs text-yellow-400">Carbs</div>
                  </div>
                  <div className="text-center p-2 bg-green-500/10 rounded">
                    <div className="text-lg font-bold text-white">{nutritionForServings.fat}g</div>
                    <div className="text-xs text-green-400">Fat</div>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Fiber:</span>
                    <span className="text-white">{nutritionForServings.fiber}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sugar:</span>
                    <span className="text-white">{nutritionForServings.sugar}g</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sodium:</span>
                    <span className="text-white">{nutritionForServings.sodium}mg</span>
                  </div>
                </div>
                
                <div className="border-t border-white/10 pt-4">
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Adjust Servings</label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServingMultiplier(Math.max(1, servingMultiplier - 1))}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      -
                    </Button>
                    <span className="text-white font-medium min-w-[3rem] text-center">
                      {servingMultiplier}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setServingMultiplier(servingMultiplier + 1)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      +
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ingredients */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Ingredients
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {recipe.ingredients.length} items
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recipe.ingredients.map((ingredient) => {
                const adjustedAmount = ingredient.amount !== 'To taste' 
                  ? parseFloat(ingredient.amount) * servingMultiplier 
                  : ingredient.amount;
                
                return (
                  <div
                    key={ingredient.id}
                    className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                  >
                    <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <div className="font-medium text-white">{ingredient.name}</div>
                        <div className="text-sm text-slate-300">
                          {adjustedAmount} {ingredient.unit}
                        </div>
                      </div>
                      
                      {ingredient.notes && (
                        <div className="text-xs text-slate-400 italic">{ingredient.notes}</div>
                      )}
                      
                      {ingredient.calories > 0 && (
                        <div className="text-xs text-slate-500 mt-1">
                          {Math.round(ingredient.calories * servingMultiplier)} kcal
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {index + 1}
                  </div>
                  <div className="text-white leading-relaxed">{instruction}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recipe Stats */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Recipe Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm font-medium text-slate-300 mb-2">Rating</div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.floor(recipe.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-slate-400'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-white font-medium">{recipe.rating}</span>
                  <span className="text-slate-400">({recipe.reviews} reviews)</span>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-slate-300 mb-2">Created</div>
                <div className="text-white">
                  {new Date(recipe.dateCreated).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-slate-300 mb-2">Last Updated</div>
                <div className="text-white">
                  {new Date(recipe.lastModified).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full">
            <ChefHat className="w-5 h-5 mr-2" />
            Start Cooking
          </Button>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-full"
          >
            <Edit className="w-5 h-5 mr-2" />
            Edit Recipe
          </Button>
          <Button
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 px-8 py-3 rounded-full"
          >
            <Share className="w-5 h-5 mr-2" />
            Share Recipe
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailScreen;