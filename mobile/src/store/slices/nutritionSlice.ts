/**
 * Nutrition State Management Slice
 * Manages all nutrition-related state including food logs, goals, and analytics
 */

import {
  Food,
  FoodLogEntry,
  NutritionGoals,
  DailyNutritionSummary,
  NutritionAnalytics,
  Recipe,
  MealPlan,
  MealType,
  WaterLog,
  FoodSearchFilters,
  QuickAddPreset,
} from '../../types/nutrition';
import { nutritionService } from '../../services/nutrition';
import { format } from 'date-fns';

// Nutrition slice state
export interface NutritionSlice {
  // Date navigation
  currentDate: Date;
  
  // Food logs
  todaysFoodLogs: FoodLogEntry[];
  dailySummary: DailyNutritionSummary | null;
  
  // Nutrition goals
  nutritionGoals: NutritionGoals | null;
  
  // Food search
  searchLoading: boolean;
  searchFilters: FoodSearchFilters;
  selectedFood: Food | null;
  
  // Favorites and recent
  favoriteFoods: Food[];
  recentFoods: Food[];
  customFoods: Food[];
  
  // Water tracking
  todaysWaterLogs: WaterLog[];
  waterGoal: number;
  quickWaterPresets: QuickAddPreset[];
  
  // Recipes
  userRecipes: Recipe[];
  selectedRecipe: Recipe | null;
  
  // Meal plans
  mealPlans: MealPlan[];
  activeMealPlan: MealPlan | null;
  
  // Analytics
  nutritionAnalytics: NutritionAnalytics | null;
  analyticsLoading: boolean;
  
  // UI State
  selectedMealType: MealType | null;
  isLoading: boolean;
  lastError: string | null;
  lastScannedBarcode: string | null;
  
  // Actions - Date Navigation
  setCurrentDate: (date: Date) => void;
  goToToday: () => void;
  goToPreviousDay: () => void;
  goToNextDay: () => void;
  
  // Actions - Food Search
  searchFoods: (query: string, filters?: FoodSearchFilters) => Promise<void>;
  clearSearch: () => void;
  setSearchFilters: (filters: FoodSearchFilters) => void;
  selectFood: (food: Food) => void;
  
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
  loadDailySummary: (date: Date) => Promise<void>;
  refreshTodaysData: () => Promise<void>;
  
  // Actions - Analytics
  loadNutritionAnalytics: (period: 'week' | 'month' | 'quarter' | 'year') => Promise<void>;
  
  // Actions - Barcode Scanning
  scanBarcode: (barcode: string) => Promise<void>;
  clearLastScannedBarcode: () => void;
  
  // Actions - Meal Type
  setSelectedMealType: (mealType: MealType | null) => void;
  getMealTypeForCurrentTime: () => MealType;
  
  // Actions - Recipes
  loadUserRecipes: () => Promise<void>;
  createRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  selectRecipe: (recipe: Recipe | null) => void;
  
  // Actions - Meal Plans
  loadMealPlans: () => Promise<void>;
  setActiveMealPlan: (planId: string | null) => Promise<void>;
  
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

// Create nutrition slice - simplified type for compatibility
export const createNutritionSlice = (set: any, get: any, api: any): NutritionSlice => ({
  // Initial state
  currentDate: new Date(),
  todaysFoodLogs: [],
  dailySummary: null,
  nutritionGoals: null,
  searchResults: [],
  searchLoading: false,
  searchFilters: {},
  selectedFood: null,
  favoriteFoods: [],
  recentFoods: [],
  customFoods: [],
  todaysWaterLogs: [],
  waterGoal: 2000, // Default 2L
  quickWaterPresets: [
    { id: '1', name: 'Glass', icon: '🥤', amount: 250, unit: 'ml' },
    { id: '2', name: 'Bottle', icon: '🍶', amount: 500, unit: 'ml' },
    { id: '3', name: 'Large Bottle', icon: '💧', amount: 1000, unit: 'ml' },
  ],
  userRecipes: [],
  selectedRecipe: null,
  mealPlans: [],
  activeMealPlan: null,
  nutritionAnalytics: null,
  analyticsLoading: false,
  selectedMealType: null,
  isLoading: false,
  lastError: null,
  lastScannedBarcode: null,

  // Actions - Date Navigation
  setCurrentDate: (date: Date) => set((state: NutritionSlice) => {
    state.currentDate = date;
  }),

  goToToday: () => set((state: NutritionSlice) => {
    state.currentDate = new Date();
  }),

  goToPreviousDay: () => set((state: NutritionSlice) => {
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() - 1);
    state.currentDate = newDate;
  }),

  goToNextDay: () => set((state: NutritionSlice) => {
    const newDate = new Date(state.currentDate);
    newDate.setDate(newDate.getDate() + 1);
    state.currentDate = newDate;
  }),

  // Actions - Food Search
  searchFoods: async (query: string, filters?: FoodSearchFilters) => {
    set((state: NutritionSlice) => {
      state.searchLoading = true;
      state.lastError = null;
    });

    try {
      const results = await nutritionService.searchFoods(query, filters);
      set((state: NutritionSlice) => {
        // searchResults removed - handled by main store
        state.searchLoading = false;
      });
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.searchLoading = false;
        state.lastError = error.message;
      });
    }
  },

  clearSearch: () => set((state: NutritionSlice) => {
            // searchResults removed - handled by main store
    state.searchFilters = {};
    state.selectedFood = null;
  }),

  setSearchFilters: (filters: FoodSearchFilters) => set((state: NutritionSlice) => {
    state.searchFilters = filters;
  }),

  selectFood: (food: Food) => set((state: NutritionSlice) => {
    state.selectedFood = food;
  }),

  // Actions - Food Logging
  logFood: async (food: Food, quantity: number, unit: string, mealType: MealType) => {
    set((state: NutritionSlice) => {
      state.isLoading = true;
    });

    try {
      const entry = await nutritionService.logFood({
        userId: '', // Will be set by service
        food,
        foodId: food.id,
        mealType,
        quantity,
        unit,
        calories: (food.calories * quantity) / food.servingSize,
        macros: {
          protein: (food.macros.protein * quantity) / food.servingSize,
          carbs: (food.macros.carbs * quantity) / food.servingSize,
          fat: (food.macros.fat * quantity) / food.servingSize,
        },
        micronutrients: food.micronutrients ? {
          ...food.micronutrients,
        } : undefined,
        loggedAt: new Date(),
      });

      set((state: NutritionSlice) => {
        state.todaysFoodLogs.push(entry);
        state.isLoading = false;
      });

      // Refresh daily summary
      await get().loadDailySummary(get().currentDate);
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.isLoading = false;
        state.lastError = error.message;
      });
    }
  },

  updateFoodLog: async (logId: string, updates: Partial<FoodLogEntry>) => {
    try {
      const updatedLog = await nutritionService.updateFoodLog(logId, updates);
      
      set((state: NutritionSlice) => {
        const index = state.todaysFoodLogs.findIndex((log: FoodLogEntry) => log.id === logId);
        if (index !== -1) {
          state.todaysFoodLogs[index] = updatedLog;
        }
      });

      await get().loadDailySummary(get().currentDate);
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.lastError = error.message;
      });
    }
  },

  deleteFoodLog: async (logId: string) => {
    try {
      await nutritionService.deleteFoodLog(logId);
      
      set((state: NutritionSlice) => {
        state.todaysFoodLogs = state.todaysFoodLogs.filter((log: FoodLogEntry) => log.id !== logId);
      });

      await get().loadDailySummary(get().currentDate);
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.lastError = error.message;
      });
    }
  },

  copyMeal: async (fromDate: Date, toDate: Date, mealType: MealType) => {
    try {
      const copiedEntries = await nutritionService.copyMeal(fromDate, toDate, mealType);
      
      if (format(toDate, 'yyyy-MM-dd') === format(get().currentDate, 'yyyy-MM-dd')) {
        set((state: NutritionSlice) => {
          state.todaysFoodLogs.push(...copiedEntries);
        });
      }

      await get().loadDailySummary(get().currentDate);
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.lastError = error.message;
      });
    }
  },

  quickLogFood: async (food: Food, mealType: MealType) => {
    await get().logFood(food, food.servingSize, food.servingUnit, mealType);
  },

  // Actions - Water Tracking
  logWater: async (amountMl: number) => {
    try {
      const log = await nutritionService.logWater(amountMl);
      
      set((state: NutritionSlice) => {
        state.todaysWaterLogs.push(log);
      });

      await get().loadDailySummary(get().currentDate);
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.lastError = error.message;
      });
    }
  },

  quickLogWater: async (presetId: string) => {
    const preset = get().quickWaterPresets.find((p: QuickAddPreset) => p.id === presetId);
    if (preset) {
      await get().logWater(preset.amount);
    }
  },

  setWaterGoal: (goalMl: number) => set((state: NutritionSlice) => {
    state.waterGoal = goalMl;
  }),

  // Actions - Favorites and Recent
  toggleFavoriteFood: async (foodId: string) => {
    try {
      const isFavorite = await nutritionService.toggleFavoriteFood(foodId);
      
      if (isFavorite) {
        const food = await nutritionService.getFoodById(foodId);
        if (food) {
          set((state: NutritionSlice) => {
            state.favoriteFoods.push(food);
          });
        }
      } else {
        set((state: NutritionSlice) => {
          state.favoriteFoods = state.favoriteFoods.filter((f: Food) => f.id !== foodId);
        });
      }
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.lastError = error.message;
      });
    }
  },

  loadRecentFoods: async () => {
    try {
      const foods = await nutritionService.getRecentFoods();
      set((state: NutritionSlice) => {
        state.recentFoods = foods;
      });
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.lastError = error.message;
      });
    }
  },

  loadFavoriteFoods: async () => {
    try {
      const foods = await nutritionService.getFavoriteFoods();
      set((state: NutritionSlice) => {
        state.favoriteFoods = foods;
      });
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.lastError = error.message;
      });
    }
  },

  // Actions - Custom Foods
  createCustomFood: async (food: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>) => {
    set((state: NutritionSlice) => {
      state.isLoading = true;
    });

    try {
      const newFood = await nutritionService.createCustomFood(food);
      
      set((state: NutritionSlice) => {
        state.customFoods.push(newFood);
        state.isLoading = false;
      });
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.isLoading = false;
        state.lastError = error.message;
      });
    }
  },

  loadCustomFoods: async () => {
    try {
      const foods = await nutritionService.searchFoods('', { isCustom: true });
      set((state: NutritionSlice) => {
        state.customFoods = foods;
      });
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.lastError = error.message;
      });
    }
  },

  // Actions - Goals
  loadNutritionGoals: async () => {
    set((state: NutritionSlice) => {
      state.isLoading = true;
    });

    try {
      const goals = await nutritionService.getNutritionGoals();
      set((state: NutritionSlice) => {
        state.nutritionGoals = goals;
        state.isLoading = false;
        if (goals?.waterMl) {
          state.waterGoal = goals.waterMl;
        }
      });
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.isLoading = false;
        state.lastError = error.message;
      });
    }
  },

  updateNutritionGoals: async (goals: Partial<NutritionGoals>) => {
    try {
      const updatedGoals = await nutritionService.updateNutritionGoals(goals);
      
      set((state: NutritionSlice) => {
        state.nutritionGoals = updatedGoals;
        if (updatedGoals.waterMl) {
          state.waterGoal = updatedGoals.waterMl;
        }
      });
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.lastError = error.message;
      });
    }
  },

  // Actions - Daily Summary
  loadDailySummary: async (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const currentFormattedDate = format(get().currentDate, 'yyyy-MM-dd');
    
    set((state: NutritionSlice) => {
      state.isLoading = true;
    });

    try {
      const [summary, foodLogs, waterLogs] = await Promise.all([
        nutritionService.getDailyNutritionSummary(date),
        nutritionService.getFoodLogs(date),
        nutritionService.getWaterLogs(date),
      ]);

      set((state: NutritionSlice) => {
        if (formattedDate === currentFormattedDate) {
          state.todaysFoodLogs = foodLogs;
          state.todaysWaterLogs = waterLogs;
        }
        state.dailySummary = summary;
        state.isLoading = false;
      });
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.isLoading = false;
        state.lastError = error.message;
      });
    }
  },

  refreshTodaysData: async () => {
    const currentDate = get().currentDate;
    
    try {
      await Promise.all([
        get().loadDailySummary(currentDate),
        get().loadNutritionGoals(),
        get().loadRecentFoods(),
        get().loadFavoriteFoods(),
      ]);
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.lastError = error.message;
      });
    }
  },

  // Actions - Analytics
  loadNutritionAnalytics: async (period: 'week' | 'month' | 'quarter' | 'year') => {
    set((state: NutritionSlice) => {
      state.analyticsLoading = true;
    });

    try {
      const analytics = await nutritionService.getNutritionAnalytics(period);
      set((state: NutritionSlice) => {
        state.nutritionAnalytics = analytics;
        state.analyticsLoading = false;
      });
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.analyticsLoading = false;
        state.lastError = error.message;
      });
    }
  },

  // Actions - Barcode Scanning
  scanBarcode: async (barcode: string) => {
    set((state: NutritionSlice) => {
      state.isLoading = true;
      state.lastScannedBarcode = barcode;
    });

    try {
      const foods = await nutritionService.searchFoods('', { barcode });
      
      set((state: NutritionSlice) => {
        // searchResults removed - handled by main store
        state.isLoading = false;
        if (foods.length === 1) {
          state.selectedFood = foods[0];
        }
      });
    } catch (error: any) {
      set((state: NutritionSlice) => {
        state.isLoading = false;
        state.lastError = error.message;
      });
    }
  },

  clearLastScannedBarcode: () => set((state: NutritionSlice) => {
    state.lastScannedBarcode = null;
  }),

  // Actions - Meal Type
  setSelectedMealType: (mealType: MealType | null) => set((state: NutritionSlice) => {
    state.selectedMealType = mealType;
  }),

  getMealTypeForCurrentTime: () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast' as MealType;
    if (hour < 15) return 'lunch' as MealType;
    if (hour < 20) return 'dinner' as MealType;
    return 'snack' as MealType;
  },

  // Actions - Recipes (TODO)
  loadUserRecipes: async () => {
    // TODO: Implement recipe loading
  },

  createRecipe: async (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => {
    // TODO: Implement recipe creation
  },

  selectRecipe: (recipe: Recipe | null) => set((state: NutritionSlice) => {
    state.selectedRecipe = recipe;
  }),

  // Actions - Meal Plans (TODO)
  loadMealPlans: async () => {
    // TODO: Implement meal plan loading
  },

  setActiveMealPlan: async (planId: string | null) => {
    // TODO: Implement active meal plan setting
  },

  // Actions - Error Handling
  clearError: () => set((state: NutritionSlice) => {
    state.lastError = null;
  }),

  // Computed values
  getTotalCalories: () => {
    const { todaysFoodLogs } = get();
    return todaysFoodLogs.reduce((total: number, log: FoodLogEntry) => total + log.calories, 0);
  },

  getTotalMacros: () => {
    const { todaysFoodLogs } = get();
    return todaysFoodLogs.reduce(
      (totals: any, log: FoodLogEntry) => ({
        protein: totals.protein + log.macros.protein,
        carbs: totals.carbs + log.macros.carbs,
        fat: totals.fat + log.macros.fat,
      }),
      { protein: 0, carbs: 0, fat: 0 }
    );
  },

  getTotalWater: () => {
    const { todaysWaterLogs } = get();
    return todaysWaterLogs.reduce((total: number, log: WaterLog) => total + log.amountMl, 0);
  },

  getRemainingCalories: () => {
    const { nutritionGoals } = get();
    const totalCalories = get().getTotalCalories();
    return (nutritionGoals?.dailyCalories || 2000) - totalCalories;
  },

  getMealCalories: (mealType: MealType) => {
    const { todaysFoodLogs } = get();
    return todaysFoodLogs
      .filter((log: FoodLogEntry) => log.mealType === mealType)
      .reduce((total: number, log: FoodLogEntry) => total + log.calories, 0);
  },

  getCalorieProgress: () => {
    const { nutritionGoals } = get();
    const totalCalories = get().getTotalCalories();
    const goal = nutritionGoals?.dailyCalories || 2000;
    return (totalCalories / goal) * 100;
  },

  getMacroProgress: () => {
    const { nutritionGoals } = get();
    const totalMacros = get().getTotalMacros();
    
    return {
      protein: ((totalMacros.protein / (nutritionGoals?.proteinGrams || 150)) * 100),
      carbs: ((totalMacros.carbs / (nutritionGoals?.carbsGrams || 250)) * 100),
      fat: ((totalMacros.fat / (nutritionGoals?.fatGrams || 65)) * 100),
    };
  },

  getWaterProgress: () => {
    const { waterGoal } = get();
    const totalWater = get().getTotalWater();
    return (totalWater / waterGoal) * 100;
  },
});