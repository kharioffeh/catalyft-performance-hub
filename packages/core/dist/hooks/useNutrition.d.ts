import { MacroTotals, NutritionTargets } from '../types/metrics';
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
/**
 * Calculate macro totals from meals
 */
export declare const calculateMacroTotals: (meals: MealEntry[]) => MacroTotals;
/**
 * Get default macro targets
 */
export declare const getDefaultMacroTargets: () => NutritionTargets;
/**
 * Calculate nutrition score based on macro targets
 */
export declare const calculateNutritionScore: (meals: MealEntry[], targets: NutritionTargets) => number;
/**
 * Filter meals for a specific date
 */
export declare const getMealsForDate: (meals: MealEntry[], date: string) => MealEntry[];
/**
 * Get today's meals
 */
export declare const getTodaysMeals: (meals: MealEntry[]) => MealEntry[];
