import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { MacroSummaryCard } from '@/components/nutrition/MacroSummaryCard';
import { MealSection } from '@/components/nutrition/MealSection';
import { SwipeableList } from '@/components/nutrition/SwipeableList';
import { Swipeable } from '@/components/nutrition/Swipeable';
import { FoodCard } from '@/components/nutrition/FoodCard';
import { Fab } from '@/components/ui/Fab';

interface Food {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  image?: string;
  brand?: string;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  foods: Food[];
}

const FoodDiaryScreen: React.FC = () => {
  const [meals, setMeals] = useState<Meal[]>([
    {
      id: '1',
      name: 'Breakfast',
      time: '8:00 AM',
      foods: [
        {
          id: '1',
          name: 'Oatmeal with Berries',
          calories: 280,
          protein: 12,
          carbs: 45,
          fats: 8,
          image: 'https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?w=80&h=80&fit=crop&crop=center',
          brand: 'Homemade'
        },
        {
          id: '2',
          name: 'Greek Yogurt',
          calories: 120,
          protein: 20,
          carbs: 8,
          fats: 2,
          image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=80&h=80&fit=crop&crop=center',
          brand: 'Chobani'
        },
        {
          id: '3',
          name: 'Almonds',
          calories: 20,
          protein: 3,
          carbs: 2,
          fats: 8,
          image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=center',
          brand: 'Raw'
        }
      ]
    },
    {
      id: '2',
      name: 'Lunch',
      time: '12:30 PM',
      foods: [
        {
          id: '4',
          name: 'Grilled Chicken Salad',
          calories: 450,
          protein: 35,
          carbs: 15,
          fats: 25,
          image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=80&h=80&fit=crop&crop=center',
          brand: 'Fresh & Co'
        },
        {
          id: '5',
          name: 'Quinoa',
          calories: 120,
          protein: 4,
          carbs: 22,
          fats: 2,
          image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&h=80&fit=crop&crop=center',
          brand: 'Organic'
        },
        {
          id: '6',
          name: 'Olive Oil Dressing',
          calories: 80,
          protein: 0,
          carbs: 0,
          fats: 9,
          image: 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=80&h=80&fit=crop&crop=center',
          brand: 'Extra Virgin'
        }
      ]
    },
    {
      id: '3',
      name: 'Snack',
      time: '3:00 PM',
      foods: [
        {
          id: '7',
          name: 'Apple',
          calories: 80,
          protein: 0,
          carbs: 20,
          fats: 0,
          image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=80&h=80&fit=crop&crop=center',
          brand: 'Gala'
        },
        {
          id: '8',
          name: 'Peanut Butter',
          calories: 100,
          protein: 4,
          carbs: 2,
          fats: 8,
          image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=80&h=80&fit=crop&crop=center',
          brand: 'Natural'
        }
      ]
    }
  ]);

  // Calculate daily totals
  const dailyTotals = meals.reduce(
    (acc, meal) => {
      const mealTotals = meal.foods.reduce(
        (foodAcc, food) => ({
          calories: foodAcc.calories + food.calories,
          protein: foodAcc.protein + food.protein,
          carbs: foodAcc.carbs + food.carbs,
          fats: foodAcc.fats + food.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );
      
      return {
        calories: acc.calories + mealTotals.calories,
        protein: acc.protein + mealTotals.protein,
        carbs: acc.carbs + mealTotals.carbs,
        fats: acc.fats + mealTotals.fats,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const deleteFood = (mealId: string, foodId: string) => {
    setMeals(meals.map(meal => 
      meal.id === mealId 
        ? { ...meal, foods: meal.foods.filter(food => food.id !== foodId) }
        : meal
    ));
  };

  const openFoodSearch = () => {
    // TODO: Implement food search functionality
    console.log('Opening food search...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Food Diary</h1>
          <p className="text-slate-300">Track your daily nutrition intake</p>
        </div>

        {/* Macro Summary Card */}
        <MacroSummaryCard
          calories={{ current: dailyTotals.calories, target: 2400 }}
          protein={{ current: dailyTotals.protein, target: 150 }}
          carbs={{ current: dailyTotals.carbs, target: 250 }}
          fats={{ current: dailyTotals.fats, target: 80 }}
        />

        {/* Meals List */}
        <SwipeableList>
          {meals.map((meal) => (
            <MealSection
              key={meal.id}
              name={meal.name}
              time={meal.time}
              foods={meal.foods}
              totalCalories={meal.foods.reduce((sum, food) => sum + food.calories, 0)}
              totalProtein={meal.foods.reduce((sum, food) => sum + food.protein, 0)}
              totalCarbs={meal.foods.reduce((sum, food) => sum + food.carbs, 0)}
              totalFats={meal.foods.reduce((sum, food) => sum + food.fats, 0)}
            >
              <div className="space-y-3">
                {meal.foods.map((food) => (
                  <Swipeable
                    key={food.id}
                    onSwipeRight={() => deleteFood(meal.id, food.id)}
                    threshold={80}
                  >
                    <FoodCard food={food} />
                  </Swipeable>
                ))}
              </div>
            </MealSection>
          ))}
        </SwipeableList>

        {/* Empty state when no meals */}
        {meals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🍽️</div>
            <h3 className="text-xl font-semibold text-white mb-2">No meals logged yet</h3>
            <p className="text-slate-400 mb-6">Start tracking your nutrition by adding your first meal</p>
            <button
              onClick={openFoodSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-colors"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add First Meal
            </button>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Fab
          onPress={openFoodSearch}
          aria-label="Add food"
          icon={<Plus className="w-6 h-6" />}
        />
      </div>
    </div>
  );
};

export default FoodDiaryScreen;