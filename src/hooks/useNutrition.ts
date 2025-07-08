import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface MealEntry {
  id: string;
  date: string;
  time: string;
  name: string;
  description: string;
  calories?: number;
  createdAt: Date;
}

interface UseNutritionReturn {
  meals: MealEntry[];
  isLoading: boolean;
  addMeal: (meal: Omit<MealEntry, 'id' | 'createdAt'>) => void;
  removeMeal: (id: string) => void;
  updateMeal: (id: string, updates: Partial<MealEntry>) => void;
  getTodaysMeals: () => MealEntry[];
  getMealsForDate: (date: string) => MealEntry[];
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

  return {
    meals,
    isLoading,
    addMeal,
    removeMeal,
    updateMeal,
    getTodaysMeals,
    getMealsForDate,
  };
};