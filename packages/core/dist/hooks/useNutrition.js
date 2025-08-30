/**
 * Calculate macro totals from meals
 */
export const calculateMacroTotals = (meals) => {
    return meals.reduce((totals, meal) => ({
        protein: totals.protein + (meal.protein || 0),
        carbs: totals.carbs + (meal.carbs || 0),
        fat: totals.fat + (meal.fat || 0),
        calories: totals.calories + (meal.calories || 0),
    }), { protein: 0, carbs: 0, fat: 0, calories: 0 });
};
/**
 * Get default macro targets
 */
export const getDefaultMacroTargets = () => {
    return {
        kcalTarget: 2200,
        proteinTarget: 120,
        carbTarget: 250,
        fatTarget: 80,
    };
};
/**
 * Calculate nutrition score based on macro targets
 */
export const calculateNutritionScore = (meals, targets) => {
    if (meals.length === 0)
        return 0;
    const macros = calculateMacroTotals(meals);
    // Calculate macro ratios (0-100 each)
    const proteinRatio = Math.min((macros.protein / targets.proteinTarget) * 100, 100);
    const carbsRatio = Math.min((macros.carbs / targets.carbTarget) * 100, 100);
    const fatRatio = Math.min((macros.fat / targets.fatTarget) * 100, 100);
    // Meal frequency score (target: 3-4 meals per day)
    const mealFrequencyScore = Math.min((meals.length / 3) * 100, 100);
    // Weighted average
    const score = (proteinRatio * 0.3 +
        carbsRatio * 0.25 +
        fatRatio * 0.25 +
        mealFrequencyScore * 0.2);
    return Math.round(score);
};
/**
 * Filter meals for a specific date
 */
export const getMealsForDate = (meals, date) => {
    return meals.filter(meal => meal.date === date);
};
/**
 * Get today's meals
 */
export const getTodaysMeals = (meals) => {
    const today = new Date().toISOString().split('T')[0];
    return getMealsForDate(meals, today);
};
