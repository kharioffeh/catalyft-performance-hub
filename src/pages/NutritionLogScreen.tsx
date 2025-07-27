import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { Progress } from '@/components/ui/progress';
import { MealLogList } from '@/components/nutrition/MealLogList';
import { AddMealDialog } from '@/components/nutrition/AddMealDialog';
import { useNutrition } from '@/hooks/useNutrition';
import { useNutritionDay } from '@/hooks/useNutritionDay';
import { useTargets } from '@/hooks/useTargets';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from '@/hooks/use-toast';

const NutritionLogScreen: React.FC = () => {
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const { meals, isLoading, addMeal, removeMeal, getTodaysMeals } = useNutrition();
  const { kcal, protein, carb, fat } = useNutritionDay();
  const { kcalTarget, proteinTarget, carbTarget, fatTarget } = useTargets();
  const isMobile = useIsMobile();

  const todaysMeals = getTodaysMeals();

  const handleAddMeal = async (mealData: any) => {
    try {
      await addMeal(mealData);
      setIsAddMealOpen(false);
      toast({
        title: "Meal Added",
        description: "Your meal has been logged successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add meal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await removeMeal(id);
      toast({
        title: "Meal Deleted",
        description: "Meal has been removed from your log.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to delete meal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatMacro = (current: number, target: number, unit: string) => {
    return `${Math.round(current)} / ${target} ${unit}`;
  };

  return (
    <div className="min-h-screen bg-background p-4 pb-safe">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-semibold text-foreground">
          Nutrition
        </h1>
        <AddMealDialog
          onAddMeal={handleAddMeal}
          trigger={
            <button 
              className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors focus-brand"
              aria-label="Add meal"
            >
              <Plus className="w-5 h-5" />
            </button>
          }
        />
      </div>

      {/* Daily Summary */}
      <GlassCard className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Today's Summary
        </h2>
        
        <div className="space-y-4">
          {/* Calories */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-foreground">Calories</span>
              <span className="text-sm text-muted-foreground">
                {formatMacro(kcal, kcalTarget, 'kcal')}
              </span>
            </div>
            <Progress 
              value={calculateProgress(kcal, kcalTarget)} 
              className="h-2"
            />
          </div>

          {/* Macros Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Protein */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-foreground">Protein</span>
                <span className="text-xs text-muted-foreground">
                  {formatMacro(protein, proteinTarget, 'g')}
                </span>
              </div>
              <Progress 
                value={calculateProgress(protein, proteinTarget)} 
                className="h-1.5"
              />
            </div>

            {/* Carbs */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-foreground">Carbs</span>
                <span className="text-xs text-muted-foreground">
                  {formatMacro(carb, carbTarget, 'g')}
                </span>
              </div>
              <Progress 
                value={calculateProgress(carb, carbTarget)} 
                className="h-1.5"
              />
            </div>

            {/* Fats */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-foreground">Fats</span>
                <span className="text-xs text-muted-foreground">
                  {formatMacro(fat, fatTarget, 'g')}
                </span>
              </div>
              <Progress 
                value={calculateProgress(fat, fatTarget)} 
                className="h-1.5"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Meal Logs */}
      <GlassCard className="p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Today's Meals
        </h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <MealLogList 
            meals={todaysMeals}
            onDeleteMeal={handleDeleteMeal}
          />
        )}
      </GlassCard>
    </div>
  );
};

export default NutritionLogScreen;