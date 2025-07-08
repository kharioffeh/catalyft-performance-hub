import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface MealEntry {
  id: string;
  date: string;
  time: string;
  name: string;
  description: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  createdAt: Date;
}

interface MacroTargets {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

interface MacroTotals {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

interface UseNutritionReturn {
  meals: MealEntry[];
  isLoading: boolean;
  addMeal: (meal: Omit<MealEntry, 'id' | 'createdAt'>) => void;
  removeMeal: (id: string) => void;
  updateMeal: (id: string, updates: Partial<MealEntry>) => void;
  getTodaysMeals: () => MealEntry[];
  getMealsForDate: (date: string) => MealEntry[];
  getTodaysMacros: () => MacroTotals;
  getMacroTargets: () => MacroTargets;
  getNutritionScore: () => number;
}

export const useNutrition = (): UseNutritionReturn => {
  const { profile } = useAuth();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addMeal = useCallback((meal: Omit<MealEntry, 'id' | 'createdAt'>) => {
    const newMeal: MealEntry = {
      ...meal,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    setMeals(prev => [...prev, newMeal]);
  }, []);

  const removeMeal = useCallback((id: string) => {
    setMeals(prev => prev.filter(meal => meal.id !== id));
  }, []);

  const updateMeal = useCallback((id: string, updates: Partial<MealEntry>) => {
    setMeals(prev => prev.map(meal => 
      meal.id === id ? { ...meal, ...updates } : meal
    ));
  }, []);

  const getTodaysMeals = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return meals.filter(meal => meal.date === today);
  }, [meals]);

  const getMealsForDate = useCallback((date: string) => {
    return meals.filter(meal => meal.date === date);
  }, [meals]);

  const getTodaysMacros = useCallback((): MacroTotals => {
    const todaysMeals = getTodaysMeals();
    return todaysMeals.reduce((totals, meal) => ({
      protein: totals.protein + (meal.protein || 0),
      carbs: totals.carbs + (meal.carbs || 0),
      fat: totals.fat + (meal.fat || 0),
      calories: totals.calories + (meal.calories || 0),
    }), { protein: 0, carbs: 0, fat: 0, calories: 0 });
  }, [getTodaysMeals]);

  const getMacroTargets = useCallback((): MacroTargets => {
    // Default targets - could be user-customizable later
    return {
      protein: 120,
      carbs: 250,
      fat: 80,
      calories: 2200,
    };
  }, []);

  const getNutritionScore = useCallback((): number => {
    const todaysMeals = getTodaysMeals();
    const macros = getTodaysMacros();
    const targets = getMacroTargets();
    
    if (todaysMeals.length === 0) return 0;
    
    // Calculate macro ratios (0-100 each)
    const proteinRatio = Math.min((macros.protein / targets.protein) * 100, 100);
    const carbsRatio = Math.min((macros.carbs / targets.carbs) * 100, 100);
    const fatRatio = Math.min((macros.fat / targets.fat) * 100, 100);
    
    // Meal frequency score (target: 3-4 meals per day)
    const mealFrequencyScore = Math.min((todaysMeals.length / 3) * 100, 100);
    
    // Weighted average
    const score = (
      proteinRatio * 0.3 +
      carbsRatio * 0.25 +
      fatRatio * 0.25 +
      mealFrequencyScore * 0.2
    );
    
    return Math.round(score);
  }, [getTodaysMeals, getTodaysMacros, getMacroTargets]);

  return {
    meals,
    isLoading,
    addMeal,
    removeMeal,
    updateMeal,
    getTodaysMeals,
    getMealsForDate,
    getTodaysMacros,
    getMacroTargets,
    getNutritionScore,
  };
};