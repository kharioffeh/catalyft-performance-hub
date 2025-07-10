/**
 * Example implementations showing how to use the FAB component
 * for AddSession and AddMeal functionality
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Fab } from '@/components/ui/Fab';
import { CreateSessionDialog } from '@/components/CreateSessionDialog';
import { AddMealDialog } from '@/components/nutrition/AddMealDialog';
import { MealEntry } from '@/hooks/useNutrition';
import { QueryClient } from '@tanstack/react-query';
import { createAddSessionHandler, createAddMealHandler } from '@/utils/fabNavigation';

interface FabExamplesProps {
  variant: 'session' | 'meal';
  queryClient?: QueryClient;
  onAddMeal?: (meal: Omit<MealEntry, 'id' | 'createdAt'>) => void;
}

export const FabExamples: React.FC<FabExamplesProps> = ({
  variant,
  queryClient,
  onAddMeal
}) => {
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);
  const navigate = useNavigate();

  if (variant === 'session') {
    return (
      <>
        <Fab 
          onPress={createAddSessionHandler(() => setIsCreateSessionOpen(true))}
          aria-label="Add new training session"
        />
        
        {queryClient && (
          <CreateSessionDialog
            open={isCreateSessionOpen}
            onOpenChange={setIsCreateSessionOpen}
            queryClient={queryClient}
          />
        )}
      </>
    );
  }

  if (variant === 'meal' && onAddMeal) {
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
  }

  return null;
};

// Example with disabled state
export const DisabledFabExample: React.FC = () => {
  return (
    <Fab 
      onPress={() => {}}
      disabled={true}
      aria-label="Feature unavailable"
    />
  );
};

// Example with navigation to specific screen
export const NavigationFabExample: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Fab 
      onPress={() => navigate('/nutrition')}
      aria-label="Go to nutrition page"
    />
  );
};