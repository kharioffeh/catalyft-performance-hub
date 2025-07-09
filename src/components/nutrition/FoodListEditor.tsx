import React, { useState } from 'react';
import { 
  Trash2, 
  Plus, 
  Minus,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
}

interface FoodListEditorProps {
  foods: FoodItem[];
  onChange: (foods: FoodItem[]) => void;
  className?: string;
}

export const FoodListEditor: React.FC<FoodListEditorProps> = ({
  foods,
  onChange,
  className
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<FoodItem>>({});

  const updateFood = (id: string, updates: Partial<FoodItem>) => {
    const updatedFoods = foods.map(food =>
      food.id === id ? { ...food, ...updates } : food
    );
    onChange(updatedFoods);
  };

  const removeFood = (id: string) => {
    const updatedFoods = foods.filter(food => food.id !== id);
    onChange(updatedFoods);
  };

  const startEditing = (food: FoodItem) => {
    setEditingId(food.id);
    setEditValues(food);
  };

  const saveEdit = () => {
    if (editingId && editValues) {
      updateFood(editingId, editValues);
      setEditingId(null);
      setEditValues({});
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const adjustQuantity = (id: string, delta: number) => {
    const food = foods.find(f => f.id === id);
    if (food) {
      const newQuantity = Math.max(0.1, food.quantity + delta);
      updateFood(id, { quantity: newQuantity });
    }
  };

  // Calculate totals
  const totals = foods.reduce(
    (acc, food) => ({
      calories: acc.calories + (food.calories * food.quantity),
      protein: acc.protein + (food.protein * food.quantity),
      carbs: acc.carbs + (food.carbs * food.quantity),
      fat: acc.fat + (food.fat * food.quantity),
      fiber: acc.fiber + ((food.fiber || 0) * food.quantity),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );

  if (foods.length === 0) {
    return (
      <div className={cn("text-center py-8", className)}>
        <p className="text-white/70">No food items detected</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Food Items */}
      <div className="space-y-3">
        {foods.map((food) => (
          <Card key={food.id} className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              {editingId === food.id ? (
                // Edit Mode
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      value={editValues.name || ''}
                      onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                      className="flex-1 bg-white/10 border-white/20 text-white"
                      placeholder="Food name"
                    />
                    <Button
                      onClick={saveEdit}
                      size="icon"
                      variant="ghost"
                      className="text-green-400 hover:bg-green-400/20"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={cancelEdit}
                      size="icon"
                      variant="ghost"
                      className="text-red-400 hover:bg-red-400/20"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div>
                      <label className="text-xs text-white/70">Calories</label>
                      <Input
                        type="number"
                        value={editValues.calories || 0}
                        onChange={(e) => setEditValues(prev => ({ ...prev, calories: Number(e.target.value) }))}
                        className="bg-white/10 border-white/20 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/70">Protein (g)</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editValues.protein || 0}
                        onChange={(e) => setEditValues(prev => ({ ...prev, protein: Number(e.target.value) }))}
                        className="bg-white/10 border-white/20 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/70">Carbs (g)</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editValues.carbs || 0}
                        onChange={(e) => setEditValues(prev => ({ ...prev, carbs: Number(e.target.value) }))}
                        className="bg-white/10 border-white/20 text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-white/70">Fat (g)</label>
                      <Input
                        type="number"
                        step="0.1"
                        value={editValues.fat || 0}
                        onChange={(e) => setEditValues(prev => ({ ...prev, fat: Number(e.target.value) }))}
                        className="bg-white/10 border-white/20 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // Display Mode
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{food.name}</h4>
                      <p className="text-sm text-white/70">
                        {food.quantity} {food.unit} • {Math.round(food.calories * food.quantity)} kcal
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => startEditing(food)}
                        size="icon"
                        variant="ghost"
                        className="text-white/70 hover:bg-white/20 w-8 h-8"
                      >
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => removeFood(food.id)}
                        size="icon"
                        variant="ghost"
                        className="text-red-400 hover:bg-red-400/20 w-8 h-8"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => adjustQuantity(food.id, -0.5)}
                        size="icon"
                        variant="outline"
                        className="w-8 h-8 text-white border-white/20 hover:bg-white/20"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      
                      <span className="text-white font-medium min-w-[4rem] text-center">
                        {food.quantity}
                      </span>
                      
                      <Button
                        onClick={() => adjustQuantity(food.id, 0.5)}
                        size="icon"
                        variant="outline"
                        className="w-8 h-8 text-white border-white/20 hover:bg-white/20"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>

                    {/* Macro Display */}
                    <div className="flex gap-4 text-sm">
                      <span className="text-blue-400">
                        P: {Math.round(food.protein * food.quantity * 10) / 10}g
                      </span>
                      <span className="text-green-400">
                        C: {Math.round(food.carbs * food.quantity * 10) / 10}g
                      </span>
                      <span className="text-yellow-400">
                        F: {Math.round(food.fat * food.quantity * 10) / 10}g
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Totals Card */}
      <Card className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30">
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Meal Totals</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">
                {Math.round(totals.calories)}
              </div>
              <div className="text-sm text-white/70">Calories</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Math.round(totals.protein * 10) / 10}g
              </div>
              <div className="text-sm text-white/70">Protein</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {Math.round(totals.carbs * 10) / 10}g
              </div>
              <div className="text-sm text-white/70">Carbs</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {Math.round(totals.fat * 10) / 10}g
              </div>
              <div className="text-sm text-white/70">Fat</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};