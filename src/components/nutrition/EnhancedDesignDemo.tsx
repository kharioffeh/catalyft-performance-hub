import React from 'react';
import { MacroSummaryCard } from './MacroSummaryCard';
import { MealSection } from './MealSection';
import { SwipeableList } from './SwipeableList';
import { Swipeable } from './Swipeable';
import { FoodCard } from './FoodCard';

// Demo data
const demoFoods = [
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
  }
];

export const EnhancedDesignDemo: React.FC = () => {
  const handleDelete = (foodId: string) => {
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Enhanced Design Demo</h1>
          <p className="text-slate-300">Showcasing the new MyFitnessPal-inspired nutrition interface</p>
        </div>

        {/* Macro Summary Card */}
        <MacroSummaryCard
          calories={{ current: 1850, target: 2400 }}
          protein={{ current: 120, target: 150 }}
          carbs={{ current: 200, target: 250 }}
          fats={{ current: 65, target: 80 }}
        />

        {/* Demo Meal Section */}
        <MealSection
          name="Breakfast"
          time="8:00 AM"
          foods={demoFoods}
          totalCalories={400}
          totalProtein={32}
          totalCarbs={53}
          totalFats={10}
        >
          <SwipeableList>
            {demoFoods.map((food) => (
              <Swipeable
                key={food.id}
                onSwipeRight={() => handleDelete(food.id)}
                threshold={80}
              >
                <FoodCard food={food} />
              </Swipeable>
            ))}
          </SwipeableList>
        </MealSection>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="text-white font-semibold mb-2">Visual Macro Tracking</h3>
            <p className="text-slate-400 text-sm">See your progress at a glance with colorful rings</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">🍽️</div>
            <h3 className="text-white font-semibold mb-2">Food Images</h3>
            <p className="text-slate-400 text-sm">Recognize your meals instantly with photos</p>
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-center">
            <div className="text-2xl mb-2">👆</div>
            <h3 className="text-white font-semibold mb-2">Swipe to Delete</h3>
            <p className="text-slate-400 text-sm">Quick and intuitive food removal</p>
          </div>
        </div>
      </div>
    </div>
  );
};