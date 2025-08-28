import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Save, ArrowLeft, Camera, Search, Clock, Users, Star } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  amount: string;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface RecipeStep {
  id: string;
  order: number;
  description: string;
  duration?: string;
  tips?: string;
}

interface Recipe {
  id: string;
  name: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: Ingredient[];
  steps: RecipeStep[];
  tags: string[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

const RecipeBuilderScreen: React.FC = () => {
  const [recipe, setRecipe] = useState<Recipe>({
    id: '1',
    name: 'Grilled Chicken Quinoa Bowl',
    description: 'A healthy and protein-packed bowl with grilled chicken, quinoa, and fresh vegetables.',
    prepTime: '15 minutes',
    cookTime: '20 minutes',
    servings: 2,
    difficulty: 'Easy',
    ingredients: [
      {
        id: '1',
        name: 'Chicken Breast',
        amount: '200',
        unit: 'g',
        calories: 330,
        protein: 40,
        carbs: 0,
        fat: 7
      },
      {
        id: '2',
        name: 'Quinoa',
        amount: '100',
        unit: 'g',
        calories: 120,
        protein: 4,
        carbs: 22,
        fat: 2
      }
    ],
    steps: [
      {
        id: '1',
        order: 1,
        description: 'Season chicken breast with herbs and spices',
        duration: '5 minutes',
        tips: 'Use a mix of dried herbs like oregano, thyme, and rosemary'
      },
      {
        id: '2',
        order: 2,
        description: 'Grill chicken for 6-8 minutes per side until cooked through',
        duration: '12 minutes',
        tips: 'Internal temperature should reach 165°F (74°C)'
      }
    ],
    tags: ['High Protein', 'Low Carb', 'Meal Prep'],
    totalCalories: 450,
    totalProtein: 44,
    totalCarbs: 22,
    totalFat: 9
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingStep, setEditingStep] = useState<RecipeStep | null>(null);
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    amount: '',
    unit: 'g'
  });

  const addIngredient = () => {
    if (newIngredient.name && newIngredient.amount) {
      const ingredient: Ingredient = {
        id: Date.now().toString(),
        name: newIngredient.name,
        amount: newIngredient.amount,
        unit: newIngredient.unit,
        calories: 0, // Would be calculated or user input
        protein: 0,
        carbs: 0,
        fat: 0
      };
      
      setRecipe({
        ...recipe,
        ingredients: [...recipe.ingredients, ingredient]
      });
      
      setNewIngredient({ name: '', amount: '', unit: 'g' });
      setShowAddIngredient(false);
    }
  };

  const addStep = () => {
    const newStep: RecipeStep = {
      id: Date.now().toString(),
      order: recipe.steps.length + 1,
      description: 'New step description',
      duration: '5 minutes'
    };
    
    setRecipe({
      ...recipe,
      steps: [...recipe.steps, newStep]
    });
  };

  const updateStep = (stepId: string, updates: Partial<RecipeStep>) => {
    setRecipe({
      ...recipe,
      steps: recipe.steps.map(step => 
        step.id === stepId ? { ...step, ...updates } : step
      )
    });
  };

  const deleteStep = (stepId: string) => {
    setRecipe({
      ...recipe,
      steps: recipe.steps.filter(step => step.id !== stepId)
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'Hard': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const calculateTotals = () => {
    const totals = recipe.ingredients.reduce(
      (acc, ingredient) => ({
        calories: acc.calories + ingredient.calories,
        protein: acc.protein + ingredient.protein,
        carbs: acc.carbs + ingredient.carbs,
        fat: acc.fat + ingredient.fat
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
    
    return totals;
  };

  const totals = calculateTotals();

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
              <h1 className="text-2xl font-bold text-white">Recipe Builder</h1>
              <p className="text-slate-300 text-sm">Create and customize your recipes</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                {isEditing ? 'Preview' : 'Edit'}
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Recipe
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
              <CardHeader>
                <CardTitle className="text-white">Recipe Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Recipe Name</label>
                    <Input
                      value={recipe.name}
                      onChange={(e) => setRecipe({ ...recipe, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="Enter recipe name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Servings</label>
                    <Input
                      type="number"
                      value={recipe.servings}
                      onChange={(e) => setRecipe({ ...recipe, servings: parseInt(e.target.value) || 1 })}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Description</label>
                  <Input
                    value={recipe.description}
                    onChange={(e) => setRecipe({ ...recipe, description: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="Describe your recipe"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Prep Time</label>
                    <Input
                      value={recipe.prepTime}
                      onChange={(e) => setRecipe({ ...recipe, prepTime: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="15 minutes"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Cook Time</label>
                    <Input
                      value={recipe.cookTime}
                      onChange={(e) => setRecipe({ ...recipe, cookTime: e.target.value })}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="20 minutes"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-300 mb-2 block">Difficulty</label>
                    <select
                      value={recipe.difficulty}
                      onChange={(e) => setRecipe({ ...recipe, difficulty: e.target.value as any })}
                      className="w-full bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nutrition Summary */}
          <div>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Nutrition Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-red-500/10 rounded-lg">
                    <div className="text-lg font-bold text-white">{totals.calories}</div>
                    <div className="text-xs text-red-400">Calories</div>
                  </div>
                  <div className="text-center p-3 bg-blue-500/10 rounded-lg">
                    <div className="text-lg font-bold text-white">{totals.protein}g</div>
                    <div className="text-xs text-blue-400">Protein</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                    <div className="text-lg font-bold text-white">{totals.carbs}g</div>
                    <div className="text-xs text-yellow-400">Carbs</div>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 rounded-lg">
                    <div className="text-lg font-bold text-white">{totals.fat}g</div>
                    <div className="text-xs text-green-400">Fat</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="text-sm text-slate-400">Per serving</div>
                  <div className="text-lg font-bold text-white">
                    {Math.round(totals.calories / recipe.servings)} kcal
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ingredients Section */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Ingredients</CardTitle>
              <Button
                onClick={() => setShowAddIngredient(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Ingredient
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {showAddIngredient && (
              <div className="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    placeholder="Ingredient name"
                    value={newIngredient.name}
                    onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <Input
                    placeholder="Amount"
                    value={newIngredient.amount}
                    onChange={(e) => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                    className="bg-white/10 border-white/20 text-white"
                  />
                  <div className="flex gap-2">
                    <select
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                      className="flex-1 bg-white/10 border border-white/20 text-white rounded-md px-3 py-2"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="l">l</option>
                      <option value="tbsp">tbsp</option>
                      <option value="tsp">tsp</option>
                      <option value="cup">cup</option>
                      <option value="piece">piece</option>
                    </select>
                    <Button
                      onClick={addIngredient}
                      className="bg-green-600 hover:bg-green-700 text-white px-3"
                    >
                      Add
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddIngredient(false)}
                      className="border-white/20 text-white hover:bg-white/10 px-3"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {recipe.ingredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                    <div>
                      <div className="font-medium text-white">{ingredient.name}</div>
                      <div className="text-sm text-slate-400">
                        {ingredient.amount} {ingredient.unit}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-white">{ingredient.calories} kcal</div>
                    <div className="text-xs text-slate-400">
                      P: {ingredient.protein}g | C: {ingredient.carbs}g | F: {ingredient.fat}g
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recipe Steps */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Recipe Steps</CardTitle>
              <Button
                onClick={addStep}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recipe.steps.map((step, index) => (
                <Card key={step.id} className="bg-white/5 border-white/10">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {step.order}
                      </div>
                      
                      <div className="flex-1 space-y-3">
                        {editingStep?.id === step.id ? (
                          <div className="space-y-3">
                            <Input
                              value={editingStep.description}
                              onChange={(e) => setEditingStep({ ...editingStep, description: e.target.value })}
                              className="bg-white/10 border-white/20 text-white"
                              placeholder="Step description"
                            />
                            <Input
                              value={editingStep.duration || ''}
                              onChange={(e) => setEditingStep({ ...editingStep, duration: e.target.value })}
                              className="bg-white/10 border-white/20 text-white"
                              placeholder="Duration (optional)"
                            />
                            <Input
                              value={editingStep.tips || ''}
                              onChange={(e) => setEditingStep({ ...editingStep, tips: e.target.value })}
                              className="bg-white/10 border-white/20 text-white"
                              placeholder="Tips (optional)"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => {
                                  updateStep(step.id, editingStep);
                                  setEditingStep(null);
                                }}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setEditingStep(null)}
                                className="border-white/20 text-white hover:bg-white/10"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="text-white">{step.description}</div>
                            {step.duration && (
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <Clock className="w-4 h-4" />
                                {step.duration}
                              </div>
                            )}
                            {step.tips && (
                              <div className="text-sm text-slate-300 bg-white/5 p-2 rounded">
                                💡 {step.tips}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStep(step)}
                          className="text-white hover:bg-white/10"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteStep(step.id)}
                          className="text-red-400 hover:bg-red-500/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tags */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
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
    </div>
  );
};

export default RecipeBuilderScreen;