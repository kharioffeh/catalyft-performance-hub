import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface NutritionTargets {
  kcalTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

/**
 * Hook to get nutrition targets for the current user
 */
export const useTargets = (): NutritionTargets => {
  const { profile } = useAuth();

  const getTargets = useCallback((): NutritionTargets => {
    // Default targets - could be user-customizable later from profile/program
    return {
      kcalTarget: 2200,
      proteinTarget: 120,
      carbTarget: 250,
      fatTarget: 80,
    };
  }, [profile]);

  return getTargets();
};