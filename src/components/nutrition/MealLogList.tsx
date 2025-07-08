import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MealEntry } from '@/hooks/useNutrition';
import { Clock, Trash2, Edit } from 'lucide-react';

interface MealLogListProps {
  meals: MealEntry[];
  onDeleteMeal: (id: string) => void;
  onEditMeal?: (meal: MealEntry) => void;
}

export const MealLogList: React.FC<MealLogListProps> = ({
  meals,
  onDeleteMeal,
  onEditMeal,
}) => {
  const sortedMeals = [...meals].sort((a, b) => {
    // Sort by time (assuming HH:MM format)
    return a.time.localeCompare(b.time);
  });

  if (meals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-white/40" />
        </div>
        <h3 className="text-lg font-medium text-white/80 mb-2">No meals logged today</h3>
        <p className="text-white/60 text-sm">Start logging your meals to track your nutrition</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedMeals.map((meal) => (
        <Card key={meal.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-white">{meal.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-white/60">
                    <Clock className="w-3 h-3" />
                    {meal.time}
                  </div>
                  {meal.calories && (
                    <Badge className="bg-blue-500/20 text-blue-300 text-xs">
                      {meal.calories} kcal
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-white/80 leading-relaxed">
                  {meal.description}
                </p>
                <div className="text-xs text-white/50 mt-2">
                  Logged {meal.createdAt.toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-3">
                {onEditMeal && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEditMeal(meal)}
                    className="h-8 w-8 p-0 text-white/60 hover:text-white hover:bg-white/10"
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onDeleteMeal(meal.id)}
                  className="h-8 w-8 p-0 text-red-400/60 hover:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};