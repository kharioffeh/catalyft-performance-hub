import { useCallback } from 'react';
import { useNutrition } from './useNutrition';

export interface NutritionDay {
  kcal: number;
  protein: number;
  carb: number;
  fat: number;
}

/**
 * Hook to get today's nutrition intake
 */
export const useNutritionDay = (): NutritionDay => {
  const { getTodaysMacros } = useNutrition();

  const getTodaysNutrition = useCallback((): NutritionDay => {
    const macros = getTodaysMacros();
    return {
      kcal: macros.calories,
      protein: macros.protein,
      carb: macros.carbs,
      fat: macros.fat,
    };
  }, [getTodaysMacros]);

  return getTodaysNutrition();
};