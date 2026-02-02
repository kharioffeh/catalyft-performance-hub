import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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

/** Map a DB row to a MealEntry */
function rowToMeal(row: Record<string, unknown>): MealEntry {
  return {
    id: row.id as string,
    date: row.date as string,
    time: '',
    name: row.name as string,
    description: '',
    calories: Number(row.calories) || 0,
    protein: Number(row.protein_g) || 0,
    carbs: Number(row.carbs_g) || 0,
    fat: Number(row.fats_g) || 0,
    createdAt: new Date(row.created_at as string),
  };
}

export const useNutrition = (): UseNutritionReturn => {
  const { profile } = useAuth();
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load meals from DB on mount and when profile changes
  useEffect(() => {
    if (!profile?.id) {
      setMeals([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const fetchMeals = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(200);

      if (!cancelled) {
        if (error) {
          console.error('Failed to load nutrition logs:', error);
        } else {
          setMeals((data || []).map(rowToMeal));
        }
        setIsLoading(false);
      }
    };

    fetchMeals();
    return () => { cancelled = true; };
  }, [profile?.id]);

  const addMeal = useCallback((meal: Omit<MealEntry, 'id' | 'createdAt'>) => {
    if (!profile?.id) return;

    // Optimistic local update
    const tempId = crypto.randomUUID();
    const newMeal: MealEntry = {
      ...meal,
      id: tempId,
      createdAt: new Date(),
    };
    setMeals(prev => [newMeal, ...prev]);

    // Persist to DB
    supabase
      .from('nutrition_logs')
      .insert({
        user_id: profile.id,
        date: meal.date,
        name: meal.name,
        calories: meal.calories || 0,
        protein_g: meal.protein || 0,
        carbs_g: meal.carbs || 0,
        fats_g: meal.fat || 0,
      })
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Failed to save meal:', error);
          // Roll back optimistic update
          setMeals(prev => prev.filter(m => m.id !== tempId));
        } else if (data) {
          // Replace temp ID with real DB ID
          setMeals(prev => prev.map(m => m.id === tempId ? rowToMeal(data) : m));
        }
      });
  }, [profile?.id]);

  const removeMeal = useCallback((id: string) => {
    // Optimistic removal
    setMeals(prev => prev.filter(meal => meal.id !== id));

    // Delete from DB
    supabase
      .from('nutrition_logs')
      .delete()
      .eq('id', id)
      .then(({ error }) => {
        if (error) {
          console.error('Failed to delete meal:', error);
        }
      });
  }, []);

  const updateMeal = useCallback((id: string, updates: Partial<MealEntry>) => {
    // Optimistic update
    setMeals(prev => prev.map(meal =>
      meal.id === id ? { ...meal, ...updates } : meal
    ));

    // Build DB update payload (only include fields that map to columns)
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.calories !== undefined) dbUpdates.calories = updates.calories;
    if (updates.protein !== undefined) dbUpdates.protein_g = updates.protein;
    if (updates.carbs !== undefined) dbUpdates.carbs_g = updates.carbs;
    if (updates.fat !== undefined) dbUpdates.fats_g = updates.fat;

    if (Object.keys(dbUpdates).length > 0) {
      supabase
        .from('nutrition_logs')
        .update(dbUpdates)
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            console.error('Failed to update meal:', error);
          }
        });
    }
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
