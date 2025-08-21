/**
 * Nutritionix API Service
 * Provides access to 1M+ food database with search, barcode lookup, and nutrition data
 */

import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config';
import {
  Food,
  NutritionixSearchResult,
  NutritionixCommonFood,
  NutritionixBrandedFood,
  NutritionixNutrients,
  MacroNutrients,
  MicroNutrients,
} from '../types/nutrition';

// API Configuration
const NUTRITIONIX_API_URL = 'https://trackapi.nutritionix.com/v2';
const CACHE_PREFIX = '@nutritionix_cache:';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Search result limits
const MAX_COMMON_RESULTS = 20;
const MAX_BRANDED_RESULTS = 20;

class NutritionixService {
  private api: AxiosInstance;
  private searchCache: Map<string, { data: any; timestamp: number }>;

  constructor() {
    this.api = axios.create({
      baseURL: NUTRITIONIX_API_URL,
      headers: {
        'x-app-id': config.nutritionix.appId,
        'x-app-key': config.nutritionix.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    this.searchCache = new Map();
    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for error handling and logging
   */
  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`[Nutritionix] ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('[Nutritionix] Request error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        console.log(`[Nutritionix] Response ${response.status}`);
        return response;
      },
      (error) => {
        console.error('[Nutritionix] Response error:', error.response?.data || error.message);
        return Promise.reject(this.handleApiError(error));
      }
    );
  }

  /**
   * Handle API errors with user-friendly messages
   */
  private handleApiError(error: any): Error {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          return new Error('Invalid Nutritionix API credentials');
        case 404:
          return new Error('Food item not found');
        case 429:
          return new Error('Too many requests. Please try again later');
        case 500:
          return new Error('Nutritionix server error. Please try again');
        default:
          return new Error(error.response.data?.message || 'An error occurred');
      }
    }
    if (error.request) {
      return new Error('Network error. Please check your connection');
    }
    return error;
  }

  /**
   * Search for foods by query string
   */
  async searchFoods(query: string, detailed = false): Promise<NutritionixSearchResult> {
    if (!query || query.trim().length < 2) {
      return { common: [], branded: [] };
    }

    const cacheKey = `search:${query.toLowerCase()}:${detailed}`;
    
    // Check cache first
    const cached = await this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.api.post('/search/instant', {
        query: query.trim(),
        self: false,
        branded: true,
        common: true,
        detailed: detailed,
        claims: false,
        common_general: true,
        common_grocery: true,
        common_restaurant: true,
        locale: 'en_US',
      });

      const result: NutritionixSearchResult = {
        common: response.data.common?.slice(0, MAX_COMMON_RESULTS) || [],
        branded: response.data.branded?.slice(0, MAX_BRANDED_RESULTS) || [],
      };

      // Cache the result
      await this.setCachedData(cacheKey, result);

      return result;
    } catch (error) {
      console.error('[Nutritionix] Search error:', error);
      throw error;
    }
  }

  /**
   * Get detailed nutrition information for common foods
   */
  async getCommonFoodNutrients(foodName: string): Promise<NutritionixNutrients | null> {
    const cacheKey = `common:${foodName.toLowerCase()}`;
    
    const cached = await this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.api.post('/natural/nutrients', {
        query: foodName,
        timezone: 'US/Eastern',
        locale: 'en_US',
      });

      const nutrients = response.data.foods?.[0] || null;
      
      if (nutrients) {
        await this.setCachedData(cacheKey, nutrients);
      }

      return nutrients;
    } catch (error) {
      console.error('[Nutritionix] Get common food nutrients error:', error);
      return null;
    }
  }

  /**
   * Get detailed nutrition information for branded foods
   */
  async getBrandedFoodNutrients(nixItemId: string): Promise<NutritionixNutrients | null> {
    const cacheKey = `branded:${nixItemId}`;
    
    const cached = await this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.api.get(`/search/item`, {
        params: {
          nix_item_id: nixItemId,
        },
      });

      const nutrients = response.data.foods?.[0] || null;
      
      if (nutrients) {
        await this.setCachedData(cacheKey, nutrients);
      }

      return nutrients;
    } catch (error) {
      console.error('[Nutritionix] Get branded food nutrients error:', error);
      return null;
    }
  }

  /**
   * Search for food by barcode
   */
  async searchByBarcode(barcode: string): Promise<Food | null> {
    const cacheKey = `barcode:${barcode}`;
    
    const cached = await this.getCachedData(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.api.get('/search/item', {
        params: {
          upc: barcode,
        },
      });

      const item = response.data.foods?.[0];
      if (!item) {
        return null;
      }

      const food = this.convertNutritionixToFood(item);
      
      if (food) {
        food.barcode = barcode;
        await this.setCachedData(cacheKey, food);
      }

      return food;
    } catch (error) {
      console.error('[Nutritionix] Barcode search error:', error);
      return null;
    }
  }

  /**
   * Get food suggestions based on meal type and time of day
   */
  async getMealSuggestions(mealType: string): Promise<NutritionixSearchResult> {
    const queries: Record<string, string[]> = {
      breakfast: ['oatmeal', 'eggs', 'toast', 'cereal', 'yogurt', 'fruit', 'bacon', 'pancakes'],
      lunch: ['sandwich', 'salad', 'soup', 'wrap', 'burger', 'pizza', 'chicken', 'rice'],
      dinner: ['pasta', 'steak', 'salmon', 'chicken', 'vegetables', 'rice', 'potato', 'salad'],
      snack: ['apple', 'banana', 'nuts', 'chips', 'cookies', 'protein bar', 'cheese', 'crackers'],
    };

    const suggestions = queries[mealType.toLowerCase()] || queries.snack;
    const randomQuery = suggestions[Math.floor(Math.random() * suggestions.length)];

    return this.searchFoods(randomQuery);
  }

  /**
   * Parse nutrition data with natural language
   */
  async parseNaturalLanguage(text: string): Promise<NutritionixNutrients[]> {
    try {
      const response = await this.api.post('/natural/nutrients', {
        query: text,
        timezone: 'US/Eastern',
        locale: 'en_US',
        use_raw_foods: false,
        use_branded_foods: true,
      });

      return response.data.foods || [];
    } catch (error) {
      console.error('[Nutritionix] Natural language parse error:', error);
      return [];
    }
  }

  /**
   * Get exercise calories burned
   */
  async getExerciseCalories(query: string, durationMin: number, weight_kg?: number): Promise<number> {
    try {
      const response = await this.api.post('/natural/exercise', {
        query: `${query} for ${durationMin} minutes`,
        gender: 'male', // Default, should be from user profile
        weight_kg: weight_kg || 70, // Default 70kg
        height_cm: 175, // Default height
        age: 30, // Default age
      });

      const exercises = response.data.exercises || [];
      const totalCalories = exercises.reduce((sum: number, ex: any) => sum + (ex.nf_calories || 0), 0);

      return Math.round(totalCalories);
    } catch (error) {
      console.error('[Nutritionix] Exercise calories error:', error);
      return 0;
    }
  }

  /**
   * Convert Nutritionix nutrients to our Food type
   */
  convertNutritionixToFood(nutrients: NutritionixNutrients): Food {
    const macros: MacroNutrients = {
      protein: nutrients.nf_protein || 0,
      carbs: nutrients.nf_total_carbohydrate || 0,
      fat: nutrients.nf_total_fat || 0,
    };

    const micronutrients: MicroNutrients = {
      fiber: nutrients.nf_dietary_fiber,
      sugar: nutrients.nf_sugars,
      sodium: nutrients.nf_sodium,
      saturatedFat: nutrients.nf_saturated_fat,
      cholesterol: nutrients.nf_cholesterol,
      potassium: nutrients.nf_potassium,
    };

    // Extract additional micronutrients from full_nutrients array
    if (nutrients.full_nutrients) {
      nutrients.full_nutrients.forEach(nutrient => {
        switch (nutrient.attr_id) {
          case 318: // Vitamin A
            micronutrients.vitaminA = nutrient.value;
            break;
          case 401: // Vitamin C
            micronutrients.vitaminC = nutrient.value;
            break;
          case 301: // Calcium
            micronutrients.calcium = nutrient.value;
            break;
          case 303: // Iron
            micronutrients.iron = nutrient.value;
            break;
        }
      });
    }

    return {
      id: '', // Will be generated by database
      name: nutrients.food_name,
      brand: nutrients.brand_name || nutrients.nix_brand_name,
      servingSize: nutrients.serving_qty,
      servingUnit: nutrients.serving_unit,
      calories: nutrients.nf_calories || 0,
      macros,
      micronutrients,
      nutritionixId: nutrients.nix_item_id || nutrients.tag_id,
      isVerified: true,
      imageUrl: nutrients.photo?.highres || nutrients.photo?.thumb,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Convert search result items to Food array
   */
  async convertSearchResultsToFoods(result: NutritionixSearchResult): Promise<Food[]> {
    const foods: Food[] = [];

    // Convert common foods
    for (const common of result.common) {
      const nutrients = await this.getCommonFoodNutrients(common.food_name);
      if (nutrients) {
        foods.push(this.convertNutritionixToFood(nutrients));
      }
    }

    // Convert branded foods (already have basic nutrition)
    for (const branded of result.branded) {
      foods.push({
        id: '',
        name: branded.food_name,
        brand: branded.brand_name,
        servingSize: branded.serving_qty,
        servingUnit: branded.serving_unit,
        calories: branded.nf_calories || 0,
        macros: {
          protein: 0, // Would need detailed lookup
          carbs: 0,
          fat: 0,
        },
        nutritionixId: branded.nix_item_id,
        isVerified: true,
        imageUrl: branded.photo?.highres || branded.photo?.thumb,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    return foods;
  }

  /**
   * Cache management methods
   */
  private async getCachedData(key: string): Promise<any | null> {
    try {
      // Check memory cache first
      const memCached = this.searchCache.get(key);
      if (memCached && Date.now() - memCached.timestamp < CACHE_DURATION) {
        console.log(`[Nutritionix] Memory cache hit: ${key}`);
        return memCached.data;
      }

      // Check AsyncStorage cache
      const stored = await AsyncStorage.getItem(CACHE_PREFIX + key);
      if (stored) {
        const { data, timestamp } = JSON.parse(stored);
        if (Date.now() - timestamp < CACHE_DURATION) {
          console.log(`[Nutritionix] Storage cache hit: ${key}`);
          // Update memory cache
          this.searchCache.set(key, { data, timestamp });
          return data;
        }
      }
    } catch (error) {
      console.error('[Nutritionix] Cache read error:', error);
    }
    return null;
  }

  private async setCachedData(key: string, data: any): Promise<void> {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
      };

      // Update memory cache
      this.searchCache.set(key, cacheData);

      // Update AsyncStorage cache
      await AsyncStorage.setItem(CACHE_PREFIX + key, JSON.stringify(cacheData));

      // Clean up old cache entries if memory cache is too large
      if (this.searchCache.size > 100) {
        const entries = Array.from(this.searchCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        // Remove oldest 20 entries
        for (let i = 0; i < 20; i++) {
          this.searchCache.delete(entries[i][0]);
        }
      }
    } catch (error) {
      console.error('[Nutritionix] Cache write error:', error);
    }
  }

  /**
   * Clear all cached data
   */
  async clearCache(): Promise<void> {
    try {
      // Clear memory cache
      this.searchCache.clear();

      // Clear AsyncStorage cache
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
      }

      console.log('[Nutritionix] Cache cleared');
    } catch (error) {
      console.error('[Nutritionix] Clear cache error:', error);
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    try {
      const response = await this.api.get('/search/instant', {
        params: {
          query: query,
          self: false,
          branded: false,
          common: true,
          detailed: false,
        },
      });

      const suggestions = response.data.common?.map((item: any) => item.food_name) || [];
      return suggestions.slice(0, 10);
    } catch (error) {
      console.error('[Nutritionix] Autocomplete error:', error);
      return [];
    }
  }

  /**
   * Report a food item issue
   */
  async reportFoodIssue(foodId: string, issue: string): Promise<boolean> {
    try {
      // This would typically send to your backend
      console.log(`[Nutritionix] Food issue reported: ${foodId} - ${issue}`);
      return true;
    } catch (error) {
      console.error('[Nutritionix] Report issue error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const nutritionixService = new NutritionixService();

// Export types and methods
export default nutritionixService;
export type { NutritionixService };