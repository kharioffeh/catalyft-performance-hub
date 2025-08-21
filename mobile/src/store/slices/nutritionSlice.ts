/**
 * Nutrition Store Slice
 * Manages all nutrition-related state including food logs, goals, and analytics
 */

import { StateCreator } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import {
  Food,
  FoodLogEntry,
  Recipe,
  MealPlan,
  NutritionGoals,
  WaterLog,
  DailyNutritionSummary,
  NutritionAnalytics,
  MealType,
  FoodSearchFilters,
  QuickAddPreset,
} from '../../types/nutrition';
import nutritionService from '../../services/nutrition';
import { format } from 'date-fns';

// Nutrition slice state
export interface NutritionSlice {
  // Current date being viewed
  currentDate: Date;
  
  // Today's data
  todaysFoodLogs: FoodLogEntry[];
  todaysWaterLogs: WaterLog[];
  dailySummary: DailyNutritionSummary | null;
  
  // User data
  nutritionGoals: NutritionGoals | null;
  recentFoods: Food[];
  favoriteFoods: Food[];
  customFoods: Food[];
  
  // Search and selection
  searchQuery: string;
  searchResults: Food[];
  searchFilters: FoodSearchFilters;
  selectedFood: Food | null;
  isSearching: boolean;
  
  // Recipes
  userRecipes: Recipe[];
  selectedRecipe: Recipe | null;
  
  // Meal plans
  activeMealPlan: MealPlan | null;
  mealPlans: MealPlan[];
  
  // Analytics
  nutritionAnalytics: NutritionAnalytics | null;
  analyticsLoading: boolean;
  
  // Water tracking
  waterGoal: number;
  quickWaterPresets: QuickAddPreset[];
  
  // UI State
  selectedMealType: MealType;
  isAddingFood: boolean;
  isScanningBarcode: boolean;
  lastScannedBarcode: string | null;
  
  // Loading states
  isLoadingFoodLogs: boolean;
  isLoadingGoals: boolean;
  isSavingFood: boolean;
  
  // Error states
  lastError: string | null;
  
  // Actions - Date Navigation
  setCurrentDate: (date: Date) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  
  // Actions - Food Search
  searchFoods: (query: string, filters?: FoodSearchFilters) => Promise<void>;
  clearSearch: () => void;
  setSearchFilters: (filters: FoodSearchFilters) => void;
  selectFood: (food: Food | null) => void;
  
  // Actions - Food Logging
  logFood: (food: Food, quantity: number, unit: string, mealType: MealType) => Promise<void>;
  updateFoodLog: (logId: string, updates: Partial<FoodLogEntry>) => Promise<void>;
  deleteFoodLog: (logId: string) => Promise<void>;
  copyMeal: (fromDate: Date, toDate: Date, mealType: MealType) => Promise<void>;
  quickLogFood: (food: Food, mealType: MealType) => Promise<void>;
  
  // Actions - Water Tracking
  logWater: (amountMl: number) => Promise<void>;
  quickLogWater: (presetId: string) => Promise<void>;
  setWaterGoal: (goalMl: number) => void;
  
  // Actions - Favorites and Recent
  toggleFavoriteFood: (foodId: string) => Promise<void>;
  loadRecentFoods: () => Promise<void>;
  loadFavoriteFoods: () => Promise<void>;
  
  // Actions - Custom Foods
  createCustomFood: (food: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  loadCustomFoods: () => Promise<void>;
  
  // Actions - Goals
  loadNutritionGoals: () => Promise<void>;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => Promise<void>;
  
  // Actions - Daily Summary
  loadDailySummary: (date?: Date) => Promise<void>;
  refreshTodaysData: () => Promise<void>;
  
  // Actions - Analytics
  loadNutritionAnalytics: (period: 'week' | 'month' | 'quarter' | 'year') => Promise<void>;
  
  // Actions - Barcode Scanning
  scanBarcode: (barcode: string) => Promise<Food | null>;
  clearLastScannedBarcode: () => void;
  
  // Actions - Meal Type
  setSelectedMealType: (mealType: MealType) => void;
  getMealTypeForCurrentTime: () => MealType;
  
  // Actions - Recipes
  loadUserRecipes: () => Promise<void>;
  createRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  selectRecipe: (recipe: Recipe | null) => void;
  
  // Actions - Meal Plans
  loadMealPlans: () => Promise<void>;
  setActiveMealPlan: (planId: string) => Promise<void>;
  
  // Actions - Error Handling
  clearError: () => void;
  
  // Computed values
  getTotalCalories: () => number;
  getTotalMacros: () => { protein: number; carbs: number; fat: number };
  getTotalWater: () => number;
  getRemainingCalories: () => number;
  getMealCalories: (mealType: MealType) => number;
  getCalorieProgress: () => number;
  getMacroProgress: () => { protein: number; carbs: number; fat: number };
  getWaterProgress: () => number;
}

// Create nutrition slice
export const createNutritionSlice: StateCreator<
  NutritionSlice,
  [['zustand/immer', never]],
  [],
  NutritionSlice
> = immer((set, get) => ({
  // Initial state
  currentDate: new Date(),
  todaysFoodLogs: [],
  todaysWaterLogs: [],
  dailySummary: null,
  nutritionGoals: null,
  recentFoods: [],
  favoriteFoods: [],
  customFoods: [],
  searchQuery: '',
  searchResults: [],
  searchFilters: {},
  selectedFood: null,
  isSearching: false,
  userRecipes: [],
  selectedRecipe: null,
  activeMealPlan: null,
  mealPlans: [],
  nutritionAnalytics: null,
  analyticsLoading: false,
  waterGoal: 2000,
  quickWaterPresets: [
    { id: '1', name: 'Glass', amount: 250, unit: 'ml', icon: '🥤' },
    { id: '2', name: 'Bottle', amount: 500, unit: 'ml', icon: '🍶' },
    { id: '3', name: 'Large Bottle', amount: 1000, unit: 'ml', icon: '💧' },
  ],
  selectedMealType: 'breakfast' as MealType,
  isAddingFood: false,
  isScanningBarcode: false,
  lastScannedBarcode: null,
  isLoadingFoodLogs: false,
  isLoadingGoals: false,
  isSavingFood: false,
  lastError: null,

  // Date Navigation
  setCurrentDate: (date) => set((state) => {
    state.currentDate = date;
  }),
  
  goToToday: () => set((state) => {
    state.currentDate = new Date();
  }),
  
  goToPreviousDay: () => set((state) => {
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() - 1);
    state.currentDate = newDate;
  }),
  
  goToNextDay: () => set((state) => {
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() + 1);
    state.currentDate = newDate;
  }),

  // Food Search
  searchFoods: async (query, filters) => {
    set((state) => {
      state.isSearching = true;
      state.searchQuery = query;
      if (filters) state.searchFilters = filters;
    });

    try {
      const results = await nutritionService.searchFoods(query, filters);
      set((state) => {
        state.searchResults = results;
        state.isSearching = false;
      });
    } catch (error) {
      set((state) => {
        state.isSearching = false;
        state.lastError = error instanceof Error ? error.message : 'Search failed';
      });
    }
  },

  clearSearch: () => set((state) => {
    state.searchQuery = '';
    state.searchResults = [];
    state.searchFilters = {};
    state.selectedFood = null;
  }),

  setSearchFilters: (filters) => set((state) => {
    state.searchFilters = filters;
  }),

  selectFood: (food) => set((state) => {
    state.selectedFood = food;
  }),

  // Food Logging
  logFood: async (food, quantity, unit, mealType) => {
    set((state) => {
      state.isSavingFood = true;
    });

    try {
      // Calculate nutrition based on quantity
      const multiplier = quantity / food.servingSize;
      const entry: Omit<FoodLogEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        userId: '', // Will be set by service
        food,
        foodId: food.id,
        mealType,
        quantity,
        unit,
        calories: food.calories * multiplier,
        macros: {
          protein: food.macros.protein * multiplier,
          carbs: food.macros.carbs * multiplier,
          fat: food.macros.fat * multiplier,
        },
        micronutrients: food.micronutrients ? {
          fiber: (food.micronutrients.fiber || 0) * multiplier,
          sugar: (food.micronutrients.sugar || 0) * multiplier,
          sodium: (food.micronutrients.sodium || 0) * multiplier,
        } : undefined,
        loggedAt: get().currentDate,
      };

      const loggedEntry = await nutritionService.logFood(entry);
      
      set((state) => {
        // Only add to today's logs if it's for today
        if (format(state.currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
          state.todaysFoodLogs.push(loggedEntry);
        }
        state.isSavingFood = false;
        state.isAddingFood = false;
        state.selectedFood = null;
      });

      // Refresh daily summary
      await get().loadDailySummary(get().currentDate);
    } catch (error) {
      set((state) => {
        state.isSavingFood = false;
        state.lastError = error instanceof Error ? error.message : 'Failed to log food';
      });
    }
  },

  updateFoodLog: async (logId, updates) => {
    try {
      const updatedLog = await nutritionService.updateFoodLog(logId, updates);
      
      set((state) => {
        const index = state.todaysFoodLogs.findIndex(log => log.id === logId);
        if (index !== -1) {
          state.todaysFoodLogs[index] = updatedLog;
        }
      });

      // Refresh daily summary
      await get().loadDailySummary(get().currentDate);
    } catch (error) {
      set((state) => {
        state.lastError = error instanceof Error ? error.message : 'Failed to update food log';
      });
    }
  },

  deleteFoodLog: async (logId) => {
    try {
      await nutritionService.deleteFoodLog(logId);
      
      set((state) => {
        state.todaysFoodLogs = state.todaysFoodLogs.filter(log => log.id !== logId);
      });

      // Refresh daily summary
      await get().loadDailySummary(get().currentDate);
    } catch (error) {
      set((state) => {
        state.lastError = error instanceof Error ? error.message : 'Failed to delete food log';
      });
    }
  },

  copyMeal: async (fromDate, toDate, mealType) => {
    try {
      const copiedLogs = await nutritionService.copyMeal(fromDate, toDate, mealType);
      
      // If copying to today, update today's logs
      if (format(toDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
        set((state) => {
          state.todaysFoodLogs.push(...copiedLogs);
        });
      }

      // Refresh daily summary
      await get().loadDailySummary(toDate);
    } catch (error) {
      set((state) => {
        state.lastError = error instanceof Error ? error.message : 'Failed to copy meal';
      });
    }
  },

  quickLogFood: async (food, mealType) => {
    // Log with default serving size
    await get().logFood(food, food.servingSize, food.servingUnit, mealType);
  },

  // Water Tracking
  logWater: async (amountMl) => {
    try {
      const waterLog = await nutritionService.logWater(amountMl);
      
      set((state) => {
        if (format(new Date(), 'yyyy-MM-dd') === format(state.currentDate, 'yyyy-MM-dd')) {
          state.todaysWaterLogs.push(waterLog);
        }
      });

      // Refresh daily summary
      await get().loadDailySummary(get().currentDate);
    } catch (error) {
      set((state) => {
        state.lastError = error instanceof Error ? error.message : 'Failed to log water';
      });
    }
  },

  quickLogWater: async (presetId) => {
    const preset = get().quickWaterPresets.find(p => p.id === presetId);
    if (preset) {
      await get().logWater(preset.amount);
    }
  },

  setWaterGoal: (goalMl) => set((state) => {
    state.waterGoal = goalMl;
  }),

  // Favorites and Recent
  toggleFavoriteFood: async (foodId) => {
    try {
      const isFavorite = await nutritionService.toggleFavoriteFood(foodId);
      
      if (isFavorite) {
        // Add to favorites
        const food = await nutritionService.getFoodById(foodId);
        if (food) {
          set((state) => {
            state.favoriteFoods.push(food);
          });
        }
      } else {
        // Remove from favorites
        set((state) => {
          state.favoriteFoods = state.favoriteFoods.filter(f => f.id !== foodId);
        });
      }
    } catch (error) {
      set((state) => {
        state.lastError = error instanceof Error ? error.message : 'Failed to toggle favorite';
      });
    }
  },

  loadRecentFoods: async () => {
    try {
      const foods = await nutritionService.getRecentFoods();
      set((state) => {
        state.recentFoods = foods;
      });
    } catch (error) {
      set((state) => {
        state.lastError = error instanceof Error ? error.message : 'Failed to load recent foods';
      });
    }
  },

  loadFavoriteFoods: async () => {
    try {
      const foods = await nutritionService.getFavoriteFoods();
      set((state) => {
        state.favoriteFoods = foods;
      });
    } catch (error) {
      set((state) => {
        state.lastError = error instanceof Error ? error.message : 'Failed to load favorite foods';
      });
    }
  },

  // Custom Foods
  createCustomFood: async (food) => {
    set((state) => {
      state.isSavingFood = true;
    });

    try {
      const createdFood = await nutritionService.createCustomFood(food);
      
      set((state) => {
        state.customFoods.push(createdFood);
        state.isSavingFood = false;
      });
    } catch (error) {
      set((state) => {
        state.isSavingFood = false;
        state.lastError = error instanceof Error ? error.message : 'Failed to create custom food';
      });
    }
  },

  loadCustomFoods: async () => {
    try {
      const foods = await nutritionService.searchFoods('', { isCustom: true });
      set((state) => {
        state.customFoods = foods;
      });
    } catch (error) {
      set((state) => {
        state.lastError = error instanceof Error ? error.message : 'Failed to load custom foods';
      });
    }
  },

  // Goals
  loadNutritionGoals: async () => {
    set((state) => {
      state.isLoadingGoals = true;
    });

    try {
      const goals = await nutritionService.getNutritionGoals();
      set((state) => {
        state.nutritionGoals = goals;
        state.isLoadingGoals = false;
        if (goals?.waterMl) {
          state.waterGoal = goals.waterMl;
        }
      });
    } catch (error) {
      set((state) => {
        state.isLoadingGoals = false;
        state.lastError = error instanceof Error ? error.message : 'Failed to load nutrition goals';
      });
    }
  },

  updateNutritionGoals: async (goals) => {
    try {
      const updatedGoals = await nutritionService.updateNutritionGoals(goals);
      set((state) => {
        state.nutritionGoals = updatedGoals;
        if (updatedGoals.waterMl) {
          state.waterGoal = updatedGoals.waterMl;
        }
      });
    } catch (error) {
      set((state) => {
        state.lastError = error instanceof Error ? error.message : 'Failed to update nutrition goals';
      });
    }
  },

  // Daily Summary
  loadDailySummary: async (date) => {
    const targetDate = date || get().currentDate;
    
    set((state) => {
      state.isLoadingFoodLogs = true;
    });

    try {
      const summary = await nutritionService.getDailyNutritionSummary(targetDate);
      
      set((state) => {
        state.dailySummary = summary;
        
        // Update today's logs if loading for today
        if (format(targetDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')) {
          state.todaysFoodLogs = [
            ...summary.meals.breakfast,
            ...summary.meals.lunch,
            ...summary.meals.dinner,
            ...summary.meals.snack,
          ];
        }
        
        state.isLoadingFoodLogs = false;
      });
    } catch (error) {
      set((state) => {
        state.isLoadingFoodLogs = false;
        state.lastError = error instanceof Error ? error.message : 'Failed to load daily summary';
      });
    }
  },

  refreshTodaysData: async () => {
    const today = new Date();
    await Promise.all([
      get().loadDailySummary(today),
      get().loadRecentFoods(),
      get().loadFavoriteFoods(),
    ]);
  },

  // Analytics
  loadNutritionAnalytics: async (period) => {
    set((state) => {
      state.analyticsLoading = true;
    });

    try {
      const analytics = await nutritionService.getNutritionAnalytics(period);
      set((state) => {
        state.nutritionAnalytics = analytics;
        state.analyticsLoading = false;
      });
    } catch (error) {
      set((state) => {
        state.analyticsLoading = false;
        state.lastError = error instanceof Error ? error.message : 'Failed to load analytics';
      });
    }
  },

  // Barcode Scanning
  scanBarcode: async (barcode) => {
    set((state) => {
      state.isScanningBarcode = true;
      state.lastScannedBarcode = barcode;
    });

    try {
      const food = await nutritionService.searchFoods('', { barcode });
      
      set((state) => {
        state.isScanningBarcode = false;
        if (food && food.length > 0) {
          state.selectedFood = food[0];
        }
      });

      return food && food.length > 0 ? food[0] : null;
    } catch (error) {
      set((state) => {
        state.isScanningBarcode = false;
        state.lastError = error instanceof Error ? error.message : 'Failed to scan barcode';
      });
      return null;
    }
  },

  clearLastScannedBarcode: () => set((state) => {
    state.lastScannedBarcode = null;
  }),

  // Meal Type
  setSelectedMealType: (mealType) => set((state) => {
    state.selectedMealType = mealType;
  }),

  getMealTypeForCurrentTime: () => {
    const hour = new Date().getHours();
    if (hour < 10) return 'breakfast';
    if (hour < 14) return 'lunch';
    if (hour < 18) return 'dinner';
    return 'snack';
  },

  // Recipes
  loadUserRecipes: async () => {
    // TODO: Implement when recipe service is ready
  },

  createRecipe: async (recipe) => {
    // TODO: Implement when recipe service is ready
  },

  selectRecipe: (recipe) => set((state) => {
    state.selectedRecipe = recipe;
  }),

  // Meal Plans
  loadMealPlans: async () => {
    // TODO: Implement when meal plan service is ready
  },

  setActiveMealPlan: async (planId) => {
    // TODO: Implement when meal plan service is ready
  },

  // Error Handling
  clearError: () => set((state) => {
    state.lastError = null;
  }),

  // Computed values
  getTotalCalories: () => {
    const { todaysFoodLogs } = get();
    return todaysFoodLogs.reduce((total, log) => total + log.calories, 0);
  },

  getTotalMacros: () => {
    const { todaysFoodLogs } = get();
    return todaysFoodLogs.reduce(
      (totals, log) => ({
        protein: totals.protein + log.macros.protein,
        carbs: totals.carbs + log.macros.carbs,
        fat: totals.fat + log.macros.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );
  },

  getTotalWater: () => {
    const { todaysWaterLogs } = get();
    return todaysWaterLogs.reduce((total, log) => total + log.amountMl, 0);
  },

  getRemainingCalories: () => {
    const { nutritionGoals } = get();
    const totalCalories = get().getTotalCalories();
    return (nutritionGoals?.dailyCalories || 2000) - totalCalories;
  },

  getMealCalories: (mealType) => {
    const { todaysFoodLogs } = get();
    return todaysFoodLogs
      .filter(log => log.mealType === mealType)
      .reduce((total, log) => total + log.calories, 0);
  },

  getCalorieProgress: () => {
    const { nutritionGoals } = get();
    const totalCalories = get().getTotalCalories();
    const goal = nutritionGoals?.dailyCalories || 2000;
    return (totalCalories / goal) * 100;
  },

  getMacroProgress: () => {
    const { nutritionGoals } = get();
    const totals = get().getTotalMacros();
    
    return {
      protein: nutritionGoals?.proteinGrams 
        ? (totals.protein / nutritionGoals.proteinGrams) * 100 
        : 0,
      carbs: nutritionGoals?.carbsGrams 
        ? (totals.carbs / nutritionGoals.carbsGrams) * 100 
        : 0,
      fat: nutritionGoals?.fatGrams 
        ? (totals.fat / nutritionGoals.fatGrams) * 100 
        : 0,
    };
  },

  getWaterProgress: () => {
    const { waterGoal } = get();
    const totalWater = get().getTotalWater();
    return (totalWater / waterGoal) * 100;
  },
}));