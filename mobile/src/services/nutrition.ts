/**
 * Nutrition Service
 * Handles all nutrition-related database operations and business logic
 */

import { supabase } from './supabase';
import nutritionixService from './nutritionix';
import {
  Food,
  FoodLogEntry,
  Recipe,
  RecipeIngredient,
  MealPlan,
  MealPlanDay,
  MealPlanItem,
  NutritionGoals,
  WaterLog,
  DailyNutritionSummary,
  NutritionAnalytics,
  TrendData,
  MealType,
  FoodSearchFilters,
  ShoppingListItem,
  MealSuggestion,
} from '../types/nutrition';
import { format, startOfDay, endOfDay, subDays, addDays, differenceInDays } from 'date-fns';

class NutritionService {
  // ==================== FOOD OPERATIONS ====================

  /**
   * Search foods from database and Nutritionix
   */
  async searchFoods(query: string, filters?: FoodSearchFilters): Promise<Food[]> {
    try {
      const results: Food[] = [];

      // Search local database first
      let dbQuery = supabase
        .from('foods')
        .select('*')
        .or(`name.ilike.%${query}%,brand.ilike.%${query}%`);

      if (filters?.category) {
        dbQuery = dbQuery.eq('category', filters.category);
      }
      if (filters?.isVerified !== undefined) {
        dbQuery = dbQuery.eq('is_verified', filters.isVerified);
      }
      if (filters?.barcode) {
        dbQuery = dbQuery.eq('barcode', filters.barcode);
      }

      const { data: dbFoods, error } = await dbQuery.limit(20);
      
      if (!error && dbFoods) {
        results.push(...this.transformFoods(dbFoods));
      }

      // Search Nutritionix API
      if (!filters?.isCustom) {
        const nutritionixResults = await nutritionixService.searchFoods(query);
        const nutritionixFoods = await nutritionixService.convertSearchResultsToFoods(nutritionixResults);
        
        // Filter out duplicates based on nutritionix_id
        const existingNutritionixIds = new Set(results.map(f => f.nutritionixId).filter(Boolean));
        const uniqueNutritionixFoods = nutritionixFoods.filter(
          f => !existingNutritionixIds.has(f.nutritionixId)
        );
        
        results.push(...uniqueNutritionixFoods);
      }

      return results;
    } catch (error) {
      console.error('[NutritionService] Search foods error:', error);
      throw error;
    }
  }

  /**
   * Get food by ID
   */
  async getFoodById(foodId: string): Promise<Food | null> {
    try {
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .eq('id', foodId)
        .single();

      if (error || !data) return null;

      return this.transformFood(data);
    } catch (error) {
      console.error('[NutritionService] Get food by ID error:', error);
      return null;
    }
  }

  /**
   * Create custom food
   */
  async createCustomFood(food: Omit<Food, 'id' | 'createdAt' | 'updatedAt'>): Promise<Food> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('foods')
        .insert({
          name: food.name,
          brand: food.brand,
          barcode: food.barcode,
          serving_size: food.servingSize,
          serving_unit: food.servingUnit,
          calories: food.calories,
          protein: food.macros.protein,
          carbs: food.macros.carbs,
          fat: food.macros.fat,
          fiber: food.micronutrients?.fiber,
          sugar: food.micronutrients?.sugar,
          sodium: food.micronutrients?.sodium,
          user_id: user.id,
          is_verified: false,
          image_url: food.imageUrl,
          category: food.category,
          tags: food.tags,
        })
        .select()
        .single();

      if (error) throw error;

      return this.transformFood(data);
    } catch (error) {
      console.error('[NutritionService] Create custom food error:', error);
      throw error;
    }
  }

  /**
   * Get user's recent foods
   */
  async getRecentFoods(limit = 30): Promise<Food[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('recent_foods')
        .select(`
          food_id,
          last_used,
          use_count,
          foods (*)
        `)
        .eq('user_id', user.id)
        .order('last_used', { ascending: false })
        .limit(limit);

      if (error || !data) return [];

      return data.map(item => this.transformFood(item.foods));
    } catch (error) {
      console.error('[NutritionService] Get recent foods error:', error);
      return [];
    }
  }

  /**
   * Get user's favorite foods
   */
  async getFavoriteFoods(): Promise<Food[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('favorite_foods')
        .select(`
          foods (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map(item => this.transformFood(item.foods));
    } catch (error) {
      console.error('[NutritionService] Get favorite foods error:', error);
      return [];
    }
  }

  /**
   * Toggle favorite food
   */
  async toggleFavoriteFood(foodId: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if already favorited
      const { data: existing } = await supabase
        .from('favorite_foods')
        .select('id')
        .eq('user_id', user.id)
        .eq('food_id', foodId)
        .single();

      if (existing) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorite_foods')
          .delete()
          .eq('id', existing.id);
        
        if (error) throw error;
        return false;
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorite_foods')
          .insert({
            user_id: user.id,
            food_id: foodId,
          });
        
        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('[NutritionService] Toggle favorite food error:', error);
      throw error;
    }
  }

  // ==================== FOOD LOG OPERATIONS ====================

  /**
   * Log food entry
   */
  async logFood(entry: Omit<FoodLogEntry, 'id' | 'createdAt' | 'updatedAt'>): Promise<FoodLogEntry> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate nutrition based on quantity
      const food = entry.food;
      const multiplier = entry.quantity / food.servingSize;
      
      const { data, error } = await supabase
        .from('food_logs')
        .insert({
          user_id: user.id,
          food_id: entry.foodId,
          meal_type: entry.mealType,
          quantity: entry.quantity,
          unit: entry.unit,
          calories: entry.calories,
          protein: entry.macros.protein,
          carbs: entry.macros.carbs,
          fat: entry.macros.fat,
          fiber: entry.micronutrients?.fiber,
          sugar: entry.micronutrients?.sugar,
          sodium: entry.micronutrients?.sodium,
          notes: entry.notes,
          image_url: entry.imageUrl,
          logged_at: format(entry.loggedAt, 'yyyy-MM-dd'),
        })
        .select()
        .single();

      if (error) throw error;

      // Update recent foods
      await this.updateRecentFood(entry.foodId);

      return this.transformFoodLogEntry(data, food);
    } catch (error) {
      console.error('[NutritionService] Log food error:', error);
      throw error;
    }
  }

  /**
   * Get food logs for a specific date
   */
  async getFoodLogs(date: Date): Promise<FoodLogEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const dateStr = format(date, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('food_logs')
        .select(`
          *,
          foods (*)
        `)
        .eq('user_id', user.id)
        .eq('logged_at', dateStr)
        .order('created_at', { ascending: true });

      if (error || !data) return [];

      return data.map(log => this.transformFoodLogEntry(log, log.foods));
    } catch (error) {
      console.error('[NutritionService] Get food logs error:', error);
      return [];
    }
  }

  /**
   * Update food log entry
   */
  async updateFoodLog(logId: string, updates: Partial<FoodLogEntry>): Promise<FoodLogEntry> {
    try {
      const updateData: any = {};
      
      if (updates.quantity !== undefined) {
        updateData.quantity = updates.quantity;
        // Recalculate nutrition if quantity changed
        if (updates.food) {
          const multiplier = updates.quantity / updates.food.servingSize;
          updateData.calories = updates.food.calories * multiplier;
          updateData.protein = updates.food.macros.protein * multiplier;
          updateData.carbs = updates.food.macros.carbs * multiplier;
          updateData.fat = updates.food.macros.fat * multiplier;
        }
      }
      
      if (updates.mealType) updateData.meal_type = updates.mealType;
      if (updates.notes !== undefined) updateData.notes = updates.notes;

      const { data, error } = await supabase
        .from('food_logs')
        .update(updateData)
        .eq('id', logId)
        .select(`
          *,
          foods (*)
        `)
        .single();

      if (error) throw error;

      return this.transformFoodLogEntry(data, data.foods);
    } catch (error) {
      console.error('[NutritionService] Update food log error:', error);
      throw error;
    }
  }

  /**
   * Delete food log entry
   */
  async deleteFoodLog(logId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('food_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('[NutritionService] Delete food log error:', error);
      return false;
    }
  }

  /**
   * Copy meal from one date to another
   */
  async copyMeal(fromDate: Date, toDate: Date, mealType: MealType): Promise<FoodLogEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get source meal
      const fromDateStr = format(fromDate, 'yyyy-MM-dd');
      const { data: sourceLogs, error: fetchError } = await supabase
        .from('food_logs')
        .select(`
          *,
          foods (*)
        `)
        .eq('user_id', user.id)
        .eq('logged_at', fromDateStr)
        .eq('meal_type', mealType);

      if (fetchError || !sourceLogs) throw fetchError;

      // Copy to new date
      const toDateStr = format(toDate, 'yyyy-MM-dd');
      const newLogs = sourceLogs.map(log => ({
        user_id: user.id,
        food_id: log.food_id,
        meal_type: log.meal_type,
        quantity: log.quantity,
        unit: log.unit,
        calories: log.calories,
        protein: log.protein,
        carbs: log.carbs,
        fat: log.fat,
        fiber: log.fiber,
        sugar: log.sugar,
        sodium: log.sodium,
        logged_at: toDateStr,
      }));

      const { data: insertedLogs, error: insertError } = await supabase
        .from('food_logs')
        .insert(newLogs)
        .select(`
          *,
          foods (*)
        `);

      if (insertError) throw insertError;

      return insertedLogs.map(log => this.transformFoodLogEntry(log, log.foods));
    } catch (error) {
      console.error('[NutritionService] Copy meal error:', error);
      throw error;
    }
  }

  // ==================== WATER TRACKING ====================

  /**
   * Log water intake
   */
  async logWater(amountMl: number): Promise<WaterLog> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('water_logs')
        .insert({
          user_id: user.id,
          amount_ml: amountMl,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        amountMl: data.amount_ml,
        loggedAt: new Date(data.logged_at),
      };
    } catch (error) {
      console.error('[NutritionService] Log water error:', error);
      throw error;
    }
  }

  /**
   * Get water logs for a date
   */
  async getWaterLogs(date: Date): Promise<WaterLog[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const startOfDayDate = startOfDay(date);
      const endOfDayDate = endOfDay(date);

      const { data, error } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startOfDayDate.toISOString())
        .lte('logged_at', endOfDayDate.toISOString())
        .order('logged_at', { ascending: false });

      if (error || !data) return [];

      return data.map(log => ({
        id: log.id,
        userId: log.user_id,
        amountMl: log.amount_ml,
        loggedAt: new Date(log.logged_at),
      }));
    } catch (error) {
      console.error('[NutritionService] Get water logs error:', error);
      return [];
    }
  }

  /**
   * Get total water intake for a date
   */
  async getDailyWaterIntake(date: Date): Promise<number> {
    const logs = await this.getWaterLogs(date);
    return logs.reduce((total, log) => total + log.amountMl, 0);
  }

  // ==================== NUTRITION GOALS ====================

  /**
   * Get user's nutrition goals
   */
  async getNutritionGoals(): Promise<NutritionGoals | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        dailyCalories: data.daily_calories,
        proteinGrams: data.protein_grams,
        carbsGrams: data.carbs_grams,
        fatGrams: data.fat_grams,
        fiberGrams: data.fiber_grams,
        sugarGrams: data.sugar_grams,
        sodiumMg: data.sodium_mg,
        waterMl: data.water_ml,
        goalType: data.goal_type,
        activityLevel: data.activity_level,
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('[NutritionService] Get nutrition goals error:', error);
      return null;
    }
  }

  /**
   * Update nutrition goals
   */
  async updateNutritionGoals(goals: Partial<NutritionGoals>): Promise<NutritionGoals> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {};
      if (goals.dailyCalories !== undefined) updateData.daily_calories = goals.dailyCalories;
      if (goals.proteinGrams !== undefined) updateData.protein_grams = goals.proteinGrams;
      if (goals.carbsGrams !== undefined) updateData.carbs_grams = goals.carbsGrams;
      if (goals.fatGrams !== undefined) updateData.fat_grams = goals.fatGrams;
      if (goals.fiberGrams !== undefined) updateData.fiber_grams = goals.fiberGrams;
      if (goals.sugarGrams !== undefined) updateData.sugar_grams = goals.sugarGrams;
      if (goals.sodiumMg !== undefined) updateData.sodium_mg = goals.sodiumMg;
      if (goals.waterMl !== undefined) updateData.water_ml = goals.waterMl;
      if (goals.goalType) updateData.goal_type = goals.goalType;
      if (goals.activityLevel) updateData.activity_level = goals.activityLevel;

      const { data, error } = await supabase
        .from('nutrition_goals')
        .upsert({
          user_id: user.id,
          ...updateData,
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        dailyCalories: data.daily_calories,
        proteinGrams: data.protein_grams,
        carbsGrams: data.carbs_grams,
        fatGrams: data.fat_grams,
        fiberGrams: data.fiber_grams,
        sugarGrams: data.sugar_grams,
        sodiumMg: data.sodium_mg,
        waterMl: data.water_ml,
        goalType: data.goal_type,
        activityLevel: data.activity_level,
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error('[NutritionService] Update nutrition goals error:', error);
      throw error;
    }
  }

  // ==================== DAILY SUMMARY ====================

  /**
   * Get daily nutrition summary
   */
  async getDailyNutritionSummary(date: Date): Promise<DailyNutritionSummary> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get food logs
      const foodLogs = await this.getFoodLogs(date);

      // Group by meal type
      const meals = {
        breakfast: foodLogs.filter(log => log.mealType === 'breakfast'),
        lunch: foodLogs.filter(log => log.mealType === 'lunch'),
        dinner: foodLogs.filter(log => log.mealType === 'dinner'),
        snack: foodLogs.filter(log => log.mealType === 'snack'),
      };

      // Calculate totals
      const totals = foodLogs.reduce(
        (acc, log) => ({
          calories: acc.calories + log.calories,
          macros: {
            protein: acc.macros.protein + log.macros.protein,
            carbs: acc.macros.carbs + log.macros.carbs,
            fat: acc.macros.fat + log.macros.fat,
          },
          micronutrients: {
            fiber: (acc.micronutrients?.fiber || 0) + (log.micronutrients?.fiber || 0),
            sugar: (acc.micronutrients?.sugar || 0) + (log.micronutrients?.sugar || 0),
            sodium: (acc.micronutrients?.sodium || 0) + (log.micronutrients?.sodium || 0),
          },
        }),
        {
          calories: 0,
          macros: { protein: 0, carbs: 0, fat: 0 },
          micronutrients: { fiber: 0, sugar: 0, sodium: 0 },
        }
      );

      // Get goals
      const goals = await this.getNutritionGoals() || {
        userId: user.id,
        dailyCalories: 2000,
        proteinGrams: 50,
        carbsGrams: 250,
        fatGrams: 65,
        waterMl: 2000,
      } as NutritionGoals;

      // Get water intake
      const waterConsumed = await this.getDailyWaterIntake(date);

      // Calculate compliance percentages
      const compliance = {
        calories: goals.dailyCalories > 0 ? (totals.calories / goals.dailyCalories) * 100 : 0,
        protein: goals.proteinGrams > 0 ? (totals.macros.protein / goals.proteinGrams) * 100 : 0,
        carbs: goals.carbsGrams > 0 ? (totals.macros.carbs / goals.carbsGrams) * 100 : 0,
        fat: goals.fatGrams > 0 ? (totals.macros.fat / goals.fatGrams) * 100 : 0,
        water: goals.waterMl > 0 ? (waterConsumed / goals.waterMl) * 100 : 0,
      };

      return {
        date,
        userId: user.id,
        totals,
        goals,
        meals,
        water: {
          consumed: waterConsumed,
          goal: goals.waterMl,
        },
        compliance,
      };
    } catch (error) {
      console.error('[NutritionService] Get daily nutrition summary error:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Get nutrition analytics
   */
  async getNutritionAnalytics(
    period: 'week' | 'month' | 'quarter' | 'year',
    endDate: Date = new Date()
  ): Promise<NutritionAnalytics> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate date range
      let startDate: Date;
      switch (period) {
        case 'week':
          startDate = subDays(endDate, 7);
          break;
        case 'month':
          startDate = subDays(endDate, 30);
          break;
        case 'quarter':
          startDate = subDays(endDate, 90);
          break;
        case 'year':
          startDate = subDays(endDate, 365);
          break;
      }

      // Get all food logs in range
      const { data: logs, error } = await supabase
        .from('food_logs')
        .select(`
          *,
          foods (*)
        `)
        .eq('user_id', user.id)
        .gte('logged_at', format(startDate, 'yyyy-MM-dd'))
        .lte('logged_at', format(endDate, 'yyyy-MM-dd'))
        .order('logged_at', { ascending: true });

      if (error || !logs) throw error;

      // Calculate daily trends
      const dailyData = new Map<string, any>();
      logs.forEach(log => {
        const dateKey = log.logged_at;
        if (!dailyData.has(dateKey)) {
          dailyData.set(dateKey, {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            meals: { breakfast: 0, lunch: 0, dinner: 0, snack: 0 },
          });
        }
        
        const day = dailyData.get(dateKey);
        day.calories += log.calories;
        day.protein += log.protein;
        day.carbs += log.carbs;
        day.fat += log.fat;
        day.meals[log.meal_type] += log.calories;
      });

      // Get water logs
      const { data: waterLogs } = await supabase
        .from('water_logs')
        .select('*')
        .eq('user_id', user.id)
        .gte('logged_at', startDate.toISOString())
        .lte('logged_at', endDate.toISOString());

      const waterByDate = new Map<string, number>();
      waterLogs?.forEach(log => {
        const dateKey = format(new Date(log.logged_at), 'yyyy-MM-dd');
        waterByDate.set(dateKey, (waterByDate.get(dateKey) || 0) + log.amount_ml);
      });

      // Build trends
      const trends: any = {
        calories: [],
        protein: [],
        carbs: [],
        fat: [],
        water: [],
      };

      const goals = await this.getNutritionGoals();
      
      for (let d = startDate; d <= endDate; d = addDays(d, 1)) {
        const dateKey = format(d, 'yyyy-MM-dd');
        const dayData = dailyData.get(dateKey) || { calories: 0, protein: 0, carbs: 0, fat: 0 };
        
        trends.calories.push({ date: d, value: dayData.calories, goal: goals?.dailyCalories });
        trends.protein.push({ date: d, value: dayData.protein, goal: goals?.proteinGrams });
        trends.carbs.push({ date: d, value: dayData.carbs, goal: goals?.carbsGrams });
        trends.fat.push({ date: d, value: dayData.fat, goal: goals?.fatGrams });
        trends.water.push({ date: d, value: waterByDate.get(dateKey) || 0, goal: goals?.waterMl });
      }

      // Calculate averages
      const totalDays = differenceInDays(endDate, startDate) + 1;
      const totals = Array.from(dailyData.values());
      const averages = {
        calories: totals.reduce((sum, d) => sum + d.calories, 0) / totalDays,
        macros: {
          protein: totals.reduce((sum, d) => sum + d.protein, 0) / totalDays,
          carbs: totals.reduce((sum, d) => sum + d.carbs, 0) / totalDays,
          fat: totals.reduce((sum, d) => sum + d.fat, 0) / totalDays,
        },
        water: Array.from(waterByDate.values()).reduce((sum, v) => sum + v, 0) / totalDays,
      };

      // Top foods
      const foodFrequency = new Map<string, { food: any; frequency: number; totalCalories: number }>();
      logs.forEach(log => {
        const foodId = log.food_id;
        if (!foodFrequency.has(foodId)) {
          foodFrequency.set(foodId, {
            food: log.foods,
            frequency: 0,
            totalCalories: 0,
          });
        }
        const freq = foodFrequency.get(foodId)!;
        freq.frequency++;
        freq.totalCalories += log.calories;
      });

      const topFoods = Array.from(foodFrequency.values())
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10)
        .map(item => ({
          food: this.transformFood(item.food),
          frequency: item.frequency,
          totalCalories: item.totalCalories,
        }));

      // Meal distribution
      const totalMealCalories = totals.reduce((sum, d) => 
        sum + d.meals.breakfast + d.meals.lunch + d.meals.dinner + d.meals.snack, 0
      );
      
      const mealDistribution = {
        breakfast: (totals.reduce((sum, d) => sum + d.meals.breakfast, 0) / totalMealCalories) * 100,
        lunch: (totals.reduce((sum, d) => sum + d.meals.lunch, 0) / totalMealCalories) * 100,
        dinner: (totals.reduce((sum, d) => sum + d.meals.dinner, 0) / totalMealCalories) * 100,
        snack: (totals.reduce((sum, d) => sum + d.meals.snack, 0) / totalMealCalories) * 100,
      };

      // Goal adherence
      const daysOnTarget = totals.filter(d => {
        if (!goals) return false;
        const calorieTarget = Math.abs(d.calories - goals.dailyCalories) / goals.dailyCalories < 0.1;
        return calorieTarget;
      }).length;

      return {
        period,
        startDate,
        endDate,
        averages,
        trends,
        topFoods,
        mealDistribution,
        goalAdherence: {
          daysOnTarget,
          totalDays,
          percentage: (daysOnTarget / totalDays) * 100,
        },
      };
    } catch (error) {
      console.error('[NutritionService] Get nutrition analytics error:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Transform database food to Food type
   */
  private transformFood(dbFood: any): Food {
    return {
      id: dbFood.id,
      name: dbFood.name,
      brand: dbFood.brand,
      barcode: dbFood.barcode,
      servingSize: dbFood.serving_size,
      servingUnit: dbFood.serving_unit,
      calories: dbFood.calories,
      macros: {
        protein: dbFood.protein,
        carbs: dbFood.carbs,
        fat: dbFood.fat,
      },
      micronutrients: {
        fiber: dbFood.fiber,
        sugar: dbFood.sugar,
        sodium: dbFood.sodium,
        saturatedFat: dbFood.saturated_fat,
        transFat: dbFood.trans_fat,
        cholesterol: dbFood.cholesterol,
        potassium: dbFood.potassium,
        vitaminA: dbFood.vitamin_a,
        vitaminC: dbFood.vitamin_c,
        calcium: dbFood.calcium,
        iron: dbFood.iron,
      },
      nutritionixId: dbFood.nutritionix_id,
      userId: dbFood.user_id,
      isVerified: dbFood.is_verified,
      imageUrl: dbFood.image_url,
      category: dbFood.category,
      tags: dbFood.tags,
      createdAt: new Date(dbFood.created_at),
      updatedAt: new Date(dbFood.updated_at),
    };
  }

  /**
   * Transform multiple database foods
   */
  private transformFoods(dbFoods: any[]): Food[] {
    return dbFoods.map(food => this.transformFood(food));
  }

  /**
   * Transform database food log to FoodLogEntry type
   */
  private transformFoodLogEntry(dbLog: any, food: any): FoodLogEntry {
    return {
      id: dbLog.id,
      userId: dbLog.user_id,
      food: this.transformFood(food),
      foodId: dbLog.food_id,
      mealType: dbLog.meal_type,
      quantity: dbLog.quantity,
      unit: dbLog.unit,
      calories: dbLog.calories,
      macros: {
        protein: dbLog.protein,
        carbs: dbLog.carbs,
        fat: dbLog.fat,
      },
      micronutrients: {
        fiber: dbLog.fiber,
        sugar: dbLog.sugar,
        sodium: dbLog.sodium,
      },
      loggedAt: new Date(dbLog.logged_at),
      notes: dbLog.notes,
      imageUrl: dbLog.image_url,
      createdAt: new Date(dbLog.created_at),
      updatedAt: new Date(dbLog.updated_at),
    };
  }

  /**
   * Update recent foods cache
   */
  private async updateRecentFood(foodId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existing } = await supabase
        .from('recent_foods')
        .select('id, use_count')
        .eq('user_id', user.id)
        .eq('food_id', foodId)
        .single();

      if (existing) {
        await supabase
          .from('recent_foods')
          .update({
            last_used: new Date().toISOString(),
            use_count: existing.use_count + 1,
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('recent_foods')
          .insert({
            user_id: user.id,
            food_id: foodId,
            last_used: new Date().toISOString(),
            use_count: 1,
          });
      }
    } catch (error) {
      console.error('[NutritionService] Update recent food error:', error);
    }
  }
}

// Export singleton instance
export const nutritionService = new NutritionService();

export default nutritionService;