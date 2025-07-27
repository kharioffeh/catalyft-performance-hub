import { 
  calculateMacroTotals, 
  getDefaultMacroTargets, 
  calculateNutritionScore,
  getMealsForDate,
  getTodaysMeals,
  MealEntry
} from '../hooks/useNutrition';

describe('Nutrition Utilities', () => {
  const mockMeals: MealEntry[] = [
    {
      id: '1',
      date: '2024-01-01',
      time: '08:00',
      name: 'Breakfast',
      description: 'Oatmeal with banana',
      calories: 300,
      protein: 12,
      carbs: 60,
      fat: 5,
      createdAt: new Date()
    },
    {
      id: '2',
      date: '2024-01-01',
      time: '12:00',
      name: 'Lunch',
      description: 'Chicken salad',
      calories: 400,
      protein: 35,
      carbs: 20,
      fat: 15,
      createdAt: new Date()
    },
    {
      id: '3',
      date: '2024-01-02',
      time: '08:00',
      name: 'Breakfast',
      description: 'Eggs and toast',
      calories: 350,
      protein: 20,
      carbs: 30,
      fat: 18,
      createdAt: new Date()
    }
  ];

  describe('calculateMacroTotals', () => {
    it('calculates macro totals correctly', () => {
      const mealsForDay = mockMeals.filter(meal => meal.date === '2024-01-01');
      const totals = calculateMacroTotals(mealsForDay);
      
      expect(totals.calories).toBe(700);
      expect(totals.protein).toBe(47);
      expect(totals.carbs).toBe(80);
      expect(totals.fat).toBe(20);
    });

    it('handles empty meals array', () => {
      const totals = calculateMacroTotals([]);
      
      expect(totals.calories).toBe(0);
      expect(totals.protein).toBe(0);
      expect(totals.carbs).toBe(0);
      expect(totals.fat).toBe(0);
    });

    it('handles meals with missing macro data', () => {
      const mealsWithMissing: MealEntry[] = [
        {
          id: '1',
          date: '2024-01-01',
          time: '08:00',
          name: 'Snack',
          description: 'Apple',
          createdAt: new Date()
        }
      ];
      
      const totals = calculateMacroTotals(mealsWithMissing);
      
      expect(totals.calories).toBe(0);
      expect(totals.protein).toBe(0);
      expect(totals.carbs).toBe(0);
      expect(totals.fat).toBe(0);
    });
  });

  describe('getDefaultMacroTargets', () => {
    it('returns default targets', () => {
      const targets = getDefaultMacroTargets();
      
      expect(targets.kcalTarget).toBe(2200);
      expect(targets.proteinTarget).toBe(120);
      expect(targets.carbTarget).toBe(250);
      expect(targets.fatTarget).toBe(80);
    });
  });

  describe('calculateNutritionScore', () => {
    it('calculates score for meals matching targets', () => {
      const targets = {
        kcalTarget: 700,
        proteinTarget: 47,
        carbTarget: 80,
        fatTarget: 20
      };
      
      const mealsForDay = mockMeals.filter(meal => meal.date === '2024-01-01');
      const score = calculateNutritionScore(mealsForDay, targets);
      
      expect(score).toBeGreaterThan(90); // Should be high since meals match targets
    });

    it('returns 0 for no meals', () => {
      const targets = getDefaultMacroTargets();
      const score = calculateNutritionScore([], targets);
      
      expect(score).toBe(0);
    });

    it('calculates lower score for insufficient macros', () => {
      const targets = {
        kcalTarget: 2000,
        proteinTarget: 150,
        carbTarget: 300,
        fatTarget: 80
      };
      
      const mealsForDay = mockMeals.filter(meal => meal.date === '2024-01-01');
      const score = calculateNutritionScore(mealsForDay, targets);
      
      expect(score).toBeLessThan(70); // Should be lower due to insufficient intake
    });
  });

  describe('getMealsForDate', () => {
    it('filters meals for specific date', () => {
      const mealsForDate = getMealsForDate(mockMeals, '2024-01-01');
      
      expect(mealsForDate).toHaveLength(2);
      expect(mealsForDate.every(meal => meal.date === '2024-01-01')).toBe(true);
    });

    it('returns empty array for date with no meals', () => {
      const mealsForDate = getMealsForDate(mockMeals, '2024-01-03');
      
      expect(mealsForDate).toHaveLength(0);
    });
  });

  describe('getTodaysMeals', () => {
    it('filters meals for today', () => {
      // Mock today's date to be 2024-01-01
      const originalToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = jest.fn(() => '2024-01-01T00:00:00.000Z');
      
      const todaysMeals = getTodaysMeals(mockMeals);
      
      expect(todaysMeals).toHaveLength(2);
      
      // Restore original method
      Date.prototype.toISOString = originalToISOString;
    });
  });
});