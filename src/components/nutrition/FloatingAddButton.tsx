import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AddMealDialog } from './AddMealDialog';
import { MealEntry } from '@/hooks/useNutrition';
import { useIsMobile } from '@/hooks/use-mobile';

interface FloatingAddButtonProps {
  onAddMeal: (meal: Omit<MealEntry, 'id' | 'createdAt'>) => void;
}

export const FloatingAddButton: React.FC<FloatingAddButtonProps> = ({ 
  onAddMeal 
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AddMealDialog 
        onAddMeal={onAddMeal}
        trigger={
          <Button 
            className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 border-0"
          >
            <Plus className="w-6 h-6" />
          </Button>
        }
      />
    </div>
  );
};