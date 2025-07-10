import React from 'react';
import { AddMealDialog } from './AddMealDialog';
import { MealEntry } from '@/hooks/useNutrition';
import { useIsMobile } from '@/hooks/use-mobile';
import { Fab } from '@/components/ui/Fab';

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
    <AddMealDialog 
      onAddMeal={onAddMeal}
      trigger={
        <Fab 
          onPress={() => {}}
          aria-label="Add new meal"
        />
      }
    />
  );
};