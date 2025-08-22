/**
 * Nutrition Tracking System Type Definitions
 * Comprehensive types for food tracking, recipes, meal planning, and analytics
 */

// Base nutrition types
export interface MacroNutrients {
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
}

export interface MicroNutrients {
  fiber?: number; // in grams
  sugar?: number; // in grams
  sodium?: number; // in milligrams
  potassium?: number; // in milligrams
  vitaminA?: number; // in IU
  vitaminC?: number; // in milligrams
  calcium?: number; // in milligrams
  iron?: number; // in milligrams
  cholesterol?: number; // in milligrams
  saturatedFat?: number; // in grams
  transFat?: number; // in grams
}

// Food item definition
export interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  servingSize: number;
  servingUnit: string;
  calories: number;
  macros: MacroNutrients;
  micronutrients?: MicroNutrients;
  nutritionixId?: string;
  userId?: string; // For custom foods
  isVerified: boolean;
  imageUrl?: string;
  category?: FoodCategory;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Food categories
export type FoodCategory = 
  | 'fruits'
  | 'vegetables'
  | 'grains'
  | 'protein'
  | 'dairy'
  | 'fats'
  | 'sweets'
  | 'beverages'
  | 'supplements'
  | 'other';

// Meal types
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// Food log entry
export interface FoodLogEntry {
  id: string;
  userId: string;
  food: Food;
  foodId: string;
  mealType: MealType;
  quantity: number;
  unit: string;
  calories: number;
  macros: MacroNutrients;
  micronutrients?: MicroNutrients;
  loggedAt: Date;
  notes?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Nutrition goals
export interface NutritionGoals {
  id?: string;
  userId: string;
  dailyCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
  sugarGrams?: number;
  sodiumMg?: number;
  waterMl: number;
  goalType?: GoalType;
  activityLevel?: ActivityLevel;
  updatedAt?: Date;
}

export type GoalType = 
  | 'weight_loss'
  | 'weight_gain'
  | 'maintenance'
  | 'muscle_gain'
  | 'performance';

export type ActivityLevel = 
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active';

// Recipe definitions
export interface Recipe {
  id: string;
  userId: string;
  name: string;
  description?: string;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string;
  nutritionPerServing: {
    calories: number;
    macros: MacroNutrients;
    micronutrients?: MicroNutrients;
  };
  prepTime?: number; // in minutes
  cookTime?: number; // in minutes
  totalTime?: number; // in minutes
  difficulty?: 'easy' | 'medium' | 'hard';
  cuisine?: string;
  mealType?: MealType[];
  tags?: string[];
  imageUrl?: string;
  isFavorite?: boolean;
  rating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface RecipeIngredient {
  foodId: string;
  food: Food;
  quantity: number;
  unit: string;
  notes?: string;
}

// Meal plan definitions
export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  dailyCaloriesTarget: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  meals: MealPlanDay[];
  shoppingList?: ShoppingListItem[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MealPlanDay {
  date: Date;
  meals: {
    breakfast: MealPlanItem[];
    lunch: MealPlanItem[];
    dinner: MealPlanItem[];
    snack: MealPlanItem[];
  };
  totalCalories?: number;
  totalMacros?: MacroNutrients;
}

export interface MealPlanItem {
  foodId?: string;
  recipeId?: string;
  food?: Food;
  recipe?: Recipe;
  quantity: number;
  unit: string;
}

// Shopping list
export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: FoodCategory;
  isChecked: boolean;
  notes?: string;
}

// Water tracking
export interface WaterLog {
  id: string;
  userId: string;
  amountMl: number;
  loggedAt: Date;
}

// Daily nutrition summary
export interface DailyNutritionSummary {
  date: Date;
  userId: string;
  totals: {
    calories: number;
    macros: MacroNutrients;
    micronutrients?: MicroNutrients;
  };
  goals: NutritionGoals;
  meals: {
    breakfast: FoodLogEntry[];
    lunch: FoodLogEntry[];
    dinner: FoodLogEntry[];
    snack: FoodLogEntry[];
  };
  water: {
    consumed: number; // in ml
    goal: number; // in ml
  };
  compliance: {
    calories: number; // percentage
    protein: number; // percentage
    carbs: number; // percentage
    fat: number; // percentage
    water: number; // percentage
  };
}

// Analytics types
export interface NutritionAnalytics {
  period: 'week' | 'month' | 'quarter' | 'year';
  startDate: Date;
  endDate: Date;
  averages: {
    calories: number;
    macros: MacroNutrients;
    water: number;
  };
  trends: {
    calories: TrendData[];
    protein: TrendData[];
    carbs: TrendData[];
    fat: TrendData[];
    water: TrendData[];
  };
  topFoods: {
    food: Food;
    frequency: number;
    totalCalories: number;
  }[];
  mealDistribution: {
    breakfast: number; // percentage
    lunch: number;
    dinner: number;
    snack: number;
  };
  goalAdherence: {
    daysOnTarget: number;
    totalDays: number;
    percentage: number;
  };
}

export interface TrendData {
  date: Date;
  value: number;
  goal?: number;
}

// Nutritionix API types
export interface NutritionixSearchResult {
  common: NutritionixCommonFood[];
  branded: NutritionixBrandedFood[];
}

export interface NutritionixCommonFood {
  food_name: string;
  serving_unit: string;
  tag_name: string;
  serving_qty: number;
  common_type: number | null;
  tag_id: string;
  photo: {
    thumb: string;
    highres?: string;
  };
  locale: string;
}

export interface NutritionixBrandedFood {
  food_name: string;
  serving_unit: string;
  nix_brand_id: string;
  brand_name_item_name: string;
  serving_qty: number;
  nf_calories: number;
  photo: {
    thumb: string;
    highres?: string;
  };
  brand_name: string;
  region: number;
  brand_type: number;
  nix_item_id: string;
  locale: string;
}

export interface NutritionixNutrients {
  food_name: string;
  brand_name?: string;
  serving_qty: number;
  serving_unit: string;
  serving_weight_grams: number;
  nf_calories: number;
  nf_total_fat: number;
  nf_saturated_fat?: number;
  nf_cholesterol?: number;
  nf_sodium?: number;
  nf_total_carbohydrate: number;
  nf_dietary_fiber?: number;
  nf_sugars?: number;
  nf_protein: number;
  nf_potassium?: number;
  nf_p?: number;
  full_nutrients?: Array<{
    attr_id: number;
    value: number;
  }>;
  nix_brand_name?: string;
  nix_brand_id?: string;
  nix_item_name?: string;
  nix_item_id?: string;
  tag_id?: string;
  upc?: string;
  consumed_at?: string;
  metadata?: any;
  source?: number;
  ndb_no?: number;
  tags?: any;
  alt_measures?: Array<{
    serving_weight: number;
    measure: string;
    seq?: number;
    qty: number;
  }>;
  lat?: number;
  lng?: number;
  meal_type?: number;
  photo?: {
    thumb: string;
    highres?: string;
    is_user_uploaded?: boolean;
  };
}

// Barcode scan result
export interface BarcodeScanResult {
  type: string;
  data: string;
  cornerPoints?: { x: number; y: number }[];
}

// Search filters
export interface FoodSearchFilters {
  query?: string;
  category?: FoodCategory;
  brandName?: string;
  minCalories?: number;
  maxCalories?: number;
  minProtein?: number;
  maxProtein?: number;
  isVerified?: boolean;
  isCustom?: boolean;
  barcode?: string;
}

// Meal suggestions
export interface MealSuggestion {
  id: string;
  name: string;
  description: string;
  foods: Food[];
  totalCalories: number;
  totalMacros: MacroNutrients;
  mealType: MealType;
  tags?: string[];
  imageUrl?: string;
}

// Quick add presets
export interface QuickAddPreset {
  id: string;
  name: string;
  icon?: string;
  amount: number;
  unit: 'ml' | 'oz' | 'cups';
}

// Notification preferences
export interface NutritionNotificationPreferences {
  mealReminders: {
    enabled: boolean;
    breakfast?: string; // time in HH:mm format
    lunch?: string;
    dinner?: string;
    snack?: string;
  };
  waterReminders: {
    enabled: boolean;
    interval: number; // in minutes
    startTime?: string;
    endTime?: string;
  };
  goalReminders: {
    enabled: boolean;
    time?: string;
  };
}