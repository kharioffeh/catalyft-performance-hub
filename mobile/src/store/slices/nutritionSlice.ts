/**
 * Nutrition state slice for Zustand store
 */

import { StateCreator } from 'zustand';
import { NutritionEntry, Meal, FoodItem, Food, Macros } from '../../types/models';
import { supabaseService } from '../../services/supabase';
import { safeValidateData, CreateNutritionEntrySchema } from '../../utils/validators';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface NutritionSlice {
  // State
  nutritionEntries: NutritionEntry[];
  currentEntry: NutritionEntry | null;
  foods: Food[];
  favoriteFoods: Food[];
  recentFoods: Food[];
  isLoading: boolean;
  error: string | null;
  
  // Daily targets
  dailyTargets: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    water: number; // in ml
  };
  
  // Actions
  setNutritionEntries: (entries: NutritionEntry[]) => void;
  setCurrentEntry: (entry: NutritionEntry | null) => void;
  setFoods: (foods: Food[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setDailyTargets: (targets: any) => void;
  
  // Nutrition entry CRUD
  loadNutritionEntries: (userId: string, startDate: Date, endDate: Date) => Promise<void>;
  loadTodayEntry: (userId: string) => Promise<void>;
  createNutritionEntry: (entry: any) => Promise<NutritionEntry>;
  updateNutritionEntry: (entryId: string, updates: any) => Promise<void>;
  deleteNutritionEntry: (entryId: string) => Promise<void>;
  
  // Meal management
  addMeal: (entryId: string, meal: Meal) => Promise<void>;
  updateMeal: (entryId: string, mealId: string, updates: Partial<Meal>) => Promise<void>;
  deleteMeal: (entryId: string, mealId: string) => Promise<void>;
  
  // Food item management
  addFoodToMeal: (entryId: string, mealId: string, food: FoodItem) => Promise<void>;
  updateFoodItem: (entryId: string, mealId: string, foodId: string, updates: Partial<FoodItem>) => Promise<void>;
  removeFoodFromMeal: (entryId: string, mealId: string, foodId: string) => Promise<void>;
  
  // Food database
  loadFoods: (filters?: any) => Promise<void>;
  searchFoods: (query: string) => Promise<Food[]>;
  createCustomFood: (food: any) => Promise<Food>;
  addToFavorites: (foodId: string) => Promise<void>;
  removeFromFavorites: (foodId: string) => Promise<void>;
  loadFavoriteFoods: (userId: string) => Promise<void>;
  loadRecentFoods: (userId: string) => Promise<void>;
  
  // Water tracking
  updateWaterIntake: (entryId: string, amount: number) => Promise<void>;
  addWater: (entryId: string, amount: number) => Promise<void>;
  
  // Barcode scanning
  scanBarcode: (barcode: string) => Promise<Food | null>;
  
  // Analytics
  getNutritionStats: (userId: string, period: 'week' | 'month' | 'year') => Promise<any>;
  getMacroBreakdown: (entryId: string) => any;
  getCalorieHistory: (userId: string, days: number) => Promise<any[]>;
  checkDailyGoals: (entry: NutritionEntry) => any;
  
  // Meal planning
  copyMeal: (meal: Meal, toDate: Date) => Promise<void>;
  copyDay: (fromDate: Date, toDate: Date) => Promise<void>;
  generateMealPlan: (userId: string, preferences: any) => Promise<any>;
}

export const createNutritionSlice: StateCreator<NutritionSlice> = (set, get) => ({
  // Initial state
  nutritionEntries: [],
  currentEntry: null,
  foods: [],
  favoriteFoods: [],
  recentFoods: [],
  isLoading: false,
  error: null,
  dailyTargets: {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    water: 2000,
  },

  // Basic setters
  setNutritionEntries: (entries) => set({ nutritionEntries: entries }),
  setCurrentEntry: (entry) => set({ currentEntry: entry }),
  setFoods: (foods) => set({ foods }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setDailyTargets: (targets) => set({ dailyTargets: { ...get().dailyTargets, ...targets } }),

  // Nutrition entry CRUD
  loadNutritionEntries: async (userId, startDate, endDate) => {
    set({ isLoading: true, error: null });
    try {
      const entries = await supabaseService.getNutritionEntries(userId, startDate, endDate);
      set({ nutritionEntries: entries, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load nutrition entries',
        isLoading: false 
      });
    }
  },

  loadTodayEntry: async (userId) => {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    try {
      const entries = await supabaseService.getNutritionEntries(userId, start, end);
      const todayEntry = entries[0] || null;
      set({ currentEntry: todayEntry });
      
      if (!todayEntry) {
        // Create entry for today if it doesn't exist
        const newEntry = await get().createNutritionEntry({
          user_id: userId,
          date: today.toISOString(),
          meals: [],
          water_intake: 0,
          total_calories: 0,
          macros: { protein: 0, carbs: 0, fat: 0 },
        });
        set({ currentEntry: newEntry });
      }
    } catch (error: any) {
      set({ error: error.message || 'Failed to load today\'s entry' });
    }
  },

  createNutritionEntry: async (entryData) => {
    set({ isLoading: true, error: null });
    try {
      // Validate entry data
      const validation = safeValidateData(CreateNutritionEntrySchema, entryData);
      if (!validation.success) {
        throw new Error(validation.error.errors[0].message);
      }

      const entry = await supabaseService.createNutritionEntry(entryData);
      
      set(state => ({
        nutritionEntries: [entry, ...state.nutritionEntries],
        currentEntry: entry,
        isLoading: false,
      }));
      
      return entry;
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to create nutrition entry',
        isLoading: false 
      });
      throw error;
    }
  },

  updateNutritionEntry: async (entryId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedEntry = await supabaseService.updateNutritionEntry(entryId, updates);
      
      set(state => ({
        nutritionEntries: state.nutritionEntries.map(e => 
          e.id === entryId ? updatedEntry : e
        ),
        currentEntry: state.currentEntry?.id === entryId ? updatedEntry : state.currentEntry,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update nutrition entry',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteNutritionEntry: async (entryId) => {
    set({ isLoading: true, error: null });
    try {
      await supabaseService.client
        .from('nutrition_entries')
        .delete()
        .eq('id', entryId);
      
      set(state => ({
        nutritionEntries: state.nutritionEntries.filter(e => e.id !== entryId),
        currentEntry: state.currentEntry?.id === entryId ? null : state.currentEntry,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete nutrition entry',
        isLoading: false 
      });
      throw error;
    }
  },

  // Meal management
  addMeal: async (entryId, meal) => {
    const entry = get().nutritionEntries.find(e => e.id === entryId);
    if (!entry) throw new Error('Entry not found');

    const updatedMeals = [...entry.meals, meal];
    const { totalCalories, macros } = get().calculateTotals(updatedMeals);

    await get().updateNutritionEntry(entryId, {
      meals: updatedMeals,
      total_calories: totalCalories,
      macros,
    });
  },

  updateMeal: async (entryId, mealId, updates) => {
    const entry = get().nutritionEntries.find(e => e.id === entryId);
    if (!entry) throw new Error('Entry not found');

    const updatedMeals = entry.meals.map(m => 
      m.id === mealId ? { ...m, ...updates } : m
    );
    const { totalCalories, macros } = get().calculateTotals(updatedMeals);

    await get().updateNutritionEntry(entryId, {
      meals: updatedMeals,
      total_calories: totalCalories,
      macros,
    });
  },

  deleteMeal: async (entryId, mealId) => {
    const entry = get().nutritionEntries.find(e => e.id === entryId);
    if (!entry) throw new Error('Entry not found');

    const updatedMeals = entry.meals.filter(m => m.id !== mealId);
    const { totalCalories, macros } = get().calculateTotals(updatedMeals);

    await get().updateNutritionEntry(entryId, {
      meals: updatedMeals,
      total_calories: totalCalories,
      macros,
    });
  },

  // Food item management
  addFoodToMeal: async (entryId, mealId, food) => {
    const entry = get().nutritionEntries.find(e => e.id === entryId);
    if (!entry) throw new Error('Entry not found');

    const updatedMeals = entry.meals.map(m => {
      if (m.id === mealId) {
        const updatedFoods = [...m.foods, food];
        const { totalCalories, macros } = get().calculateMealTotals(updatedFoods);
        return {
          ...m,
          foods: updatedFoods,
          totalCalories,
          macros,
        };
      }
      return m;
    });

    const { totalCalories, macros } = get().calculateTotals(updatedMeals);

    await get().updateNutritionEntry(entryId, {
      meals: updatedMeals,
      total_calories: totalCalories,
      macros,
    });
  },

  updateFoodItem: async (entryId, mealId, foodId, updates) => {
    const entry = get().nutritionEntries.find(e => e.id === entryId);
    if (!entry) throw new Error('Entry not found');

    const updatedMeals = entry.meals.map(m => {
      if (m.id === mealId) {
        const updatedFoods = m.foods.map(f => 
          f.id === foodId ? { ...f, ...updates } : f
        );
        const { totalCalories, macros } = get().calculateMealTotals(updatedFoods);
        return {
          ...m,
          foods: updatedFoods,
          totalCalories,
          macros,
        };
      }
      return m;
    });

    const { totalCalories, macros } = get().calculateTotals(updatedMeals);

    await get().updateNutritionEntry(entryId, {
      meals: updatedMeals,
      total_calories: totalCalories,
      macros,
    });
  },

  removeFoodFromMeal: async (entryId, mealId, foodId) => {
    const entry = get().nutritionEntries.find(e => e.id === entryId);
    if (!entry) throw new Error('Entry not found');

    const updatedMeals = entry.meals.map(m => {
      if (m.id === mealId) {
        const updatedFoods = m.foods.filter(f => f.id !== foodId);
        const { totalCalories, macros } = get().calculateMealTotals(updatedFoods);
        return {
          ...m,
          foods: updatedFoods,
          totalCalories,
          macros,
        };
      }
      return m;
    });

    const { totalCalories, macros } = get().calculateTotals(updatedMeals);

    await get().updateNutritionEntry(entryId, {
      meals: updatedMeals,
      total_calories: totalCalories,
      macros,
    });
  },

  // Food database
  loadFoods: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabaseService.client
        .from('foods')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ foods: data, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load foods',
        isLoading: false 
      });
    }
  },

  searchFoods: async (query) => {
    try {
      const { data, error } = await supabaseService.client
        .from('foods')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);

      if (error) throw error;
      return data;
    } catch (error: any) {
      set({ error: error.message || 'Failed to search foods' });
      return [];
    }
  },

  createCustomFood: async (foodData) => {
    try {
      const { data, error } = await supabaseService.client
        .from('foods')
        .insert({
          ...foodData,
          is_custom: true,
        })
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        foods: [...state.foods, data],
      }));

      return data;
    } catch (error: any) {
      set({ error: error.message || 'Failed to create custom food' });
      throw error;
    }
  },

  addToFavorites: async (foodId) => {
    // Implementation would depend on how favorites are stored
    // Could be a separate table or a user preference
    const food = get().foods.find(f => f.id === foodId);
    if (food) {
      set(state => ({
        favoriteFoods: [...state.favoriteFoods, food],
      }));
    }
  },

  removeFromFavorites: async (foodId) => {
    set(state => ({
      favoriteFoods: state.favoriteFoods.filter(f => f.id !== foodId),
    }));
  },

  loadFavoriteFoods: async (userId) => {
    // Implementation would load user's favorite foods
    // This is a placeholder
    set({ favoriteFoods: [] });
  },

  loadRecentFoods: async (userId) => {
    try {
      // Get recent nutrition entries
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 7);

      const entries = await supabaseService.getNutritionEntries(userId, startDate, endDate);
      
      // Extract unique recent foods
      const recentFoodsMap = new Map<string, Food>();
      entries.forEach(entry => {
        entry.meals.forEach(meal => {
          meal.foods.forEach(foodItem => {
            if (foodItem.food && !recentFoodsMap.has(foodItem.foodId)) {
              recentFoodsMap.set(foodItem.foodId, foodItem.food);
            }
          });
        });
      });

      set({ recentFoods: Array.from(recentFoodsMap.values()) });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load recent foods' });
    }
  },

  // Water tracking
  updateWaterIntake: async (entryId, amount) => {
    await get().updateNutritionEntry(entryId, {
      water_intake: amount,
    });
  },

  addWater: async (entryId, amount) => {
    const entry = get().nutritionEntries.find(e => e.id === entryId);
    if (!entry) throw new Error('Entry not found');

    await get().updateWaterIntake(entryId, entry.waterIntake + amount);
  },

  // Barcode scanning
  scanBarcode: async (barcode) => {
    try {
      const { data, error } = await supabaseService.client
        .from('foods')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (error) {
        // Could integrate with external API here
        return null;
      }

      return data;
    } catch (error: any) {
      set({ error: error.message || 'Failed to scan barcode' });
      return null;
    }
  },

  // Analytics
  getNutritionStats: async (userId, period) => {
    try {
      const endDate = new Date();
      const startDate = new Date();

      switch (period) {
        case 'week':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(endDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(endDate.getFullYear() - 1);
          break;
      }

      const entries = await supabaseService.getNutritionEntries(userId, startDate, endDate);

      const stats = {
        averageCalories: entries.reduce((sum, e) => sum + e.totalCalories, 0) / entries.length,
        averageMacros: {
          protein: entries.reduce((sum, e) => sum + e.macros.protein, 0) / entries.length,
          carbs: entries.reduce((sum, e) => sum + e.macros.carbs, 0) / entries.length,
          fat: entries.reduce((sum, e) => sum + e.macros.fat, 0) / entries.length,
        },
        totalCalories: entries.reduce((sum, e) => sum + e.totalCalories, 0),
        daysTracked: entries.length,
        averageWater: entries.reduce((sum, e) => sum + e.waterIntake, 0) / entries.length,
      };

      return stats;
    } catch (error: any) {
      set({ error: error.message || 'Failed to get nutrition stats' });
      return null;
    }
  },

  getMacroBreakdown: (entryId) => {
    const entry = get().nutritionEntries.find(e => e.id === entryId);
    if (!entry) return null;

    const { protein, carbs, fat } = entry.macros;
    const total = protein * 4 + carbs * 4 + fat * 9; // Calories from macros

    return {
      protein: {
        grams: protein,
        calories: protein * 4,
        percentage: total > 0 ? (protein * 4 / total) * 100 : 0,
      },
      carbs: {
        grams: carbs,
        calories: carbs * 4,
        percentage: total > 0 ? (carbs * 4 / total) * 100 : 0,
      },
      fat: {
        grams: fat,
        calories: fat * 9,
        percentage: total > 0 ? (fat * 9 / total) * 100 : 0,
      },
    };
  },

  getCalorieHistory: async (userId, days) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const entries = await supabaseService.getNutritionEntries(userId, startDate, endDate);

    return entries.map(e => ({
      date: e.date,
      calories: e.totalCalories,
      target: get().dailyTargets.calories,
    }));
  },

  checkDailyGoals: (entry) => {
    const { dailyTargets } = get();

    return {
      calories: {
        current: entry.totalCalories,
        target: dailyTargets.calories,
        percentage: (entry.totalCalories / dailyTargets.calories) * 100,
        remaining: dailyTargets.calories - entry.totalCalories,
      },
      protein: {
        current: entry.macros.protein,
        target: dailyTargets.protein,
        percentage: (entry.macros.protein / dailyTargets.protein) * 100,
        remaining: dailyTargets.protein - entry.macros.protein,
      },
      carbs: {
        current: entry.macros.carbs,
        target: dailyTargets.carbs,
        percentage: (entry.macros.carbs / dailyTargets.carbs) * 100,
        remaining: dailyTargets.carbs - entry.macros.carbs,
      },
      fat: {
        current: entry.macros.fat,
        target: dailyTargets.fat,
        percentage: (entry.macros.fat / dailyTargets.fat) * 100,
        remaining: dailyTargets.fat - entry.macros.fat,
      },
      water: {
        current: entry.waterIntake,
        target: dailyTargets.water,
        percentage: (entry.waterIntake / dailyTargets.water) * 100,
        remaining: dailyTargets.water - entry.waterIntake,
      },
    };
  },

  // Meal planning
  copyMeal: async (meal, toDate) => {
    // Implementation would copy a meal to another date
    console.log('Copying meal to', toDate);
  },

  copyDay: async (fromDate, toDate) => {
    // Implementation would copy all meals from one day to another
    console.log('Copying day from', fromDate, 'to', toDate);
  },

  generateMealPlan: async (userId, preferences) => {
    // Implementation would generate a meal plan based on preferences
    // Could integrate with AI/ML service
    return {
      plan: [],
      totalCalories: 0,
      macros: { protein: 0, carbs: 0, fat: 0 },
    };
  },

  // Helper methods (not exposed in interface)
  calculateMealTotals: (foods: FoodItem[]) => {
    const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
    const macros = foods.reduce((acc, f) => ({
      protein: acc.protein + f.macros.protein,
      carbs: acc.carbs + f.macros.carbs,
      fat: acc.fat + f.macros.fat,
      fiber: (acc.fiber || 0) + (f.macros.fiber || 0),
      sugar: (acc.sugar || 0) + (f.macros.sugar || 0),
      saturatedFat: (acc.saturatedFat || 0) + (f.macros.saturatedFat || 0),
      sodium: (acc.sodium || 0) + (f.macros.sodium || 0),
    }), { protein: 0, carbs: 0, fat: 0 } as Macros);

    return { totalCalories, macros };
  },

  calculateTotals: (meals: Meal[]) => {
    const totalCalories = meals.reduce((sum, m) => sum + m.totalCalories, 0);
    const macros = meals.reduce((acc, m) => ({
      protein: acc.protein + m.macros.protein,
      carbs: acc.carbs + m.macros.carbs,
      fat: acc.fat + m.macros.fat,
      fiber: (acc.fiber || 0) + (m.macros.fiber || 0),
      sugar: (acc.sugar || 0) + (m.macros.sugar || 0),
      saturatedFat: (acc.saturatedFat || 0) + (m.macros.saturatedFat || 0),
      sodium: (acc.sodium || 0) + (m.macros.sodium || 0),
    }), { protein: 0, carbs: 0, fat: 0 } as Macros);

    return { totalCalories, macros };
  },
});