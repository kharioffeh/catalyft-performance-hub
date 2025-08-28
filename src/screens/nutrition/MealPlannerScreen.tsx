import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, Clock, Users, Target, ArrowLeft, ArrowRight, DragHandle, Edit, Trash2 } from 'lucide-react';

interface Meal {
  id: string;
  name: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  prepTime: string;
  servings: number;
  image?: string;
  tags: string[];
}

interface DayPlan {
  date: string;
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
    snacks: Meal[];
  };
}

interface WeeklyPlan {
  weekStart: Date;
  days: DayPlan[];
}

const MealPlannerScreen: React.FC = () => {
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan>(() => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
    
    const days: DayPlan[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        meals: {
          breakfast: undefined,
          lunch: undefined,
          dinner: undefined,
          snacks: []
        }
      });
    }
    
    return { weekStart, days };
  });

  const [availableMeals] = useState<Meal[]>([
    {
      id: '1',
      name: 'Greek Yogurt Bowl',
      type: 'breakfast',
      calories: 320,
      protein: 25,
      carbs: 35,
      fat: 12,
      prepTime: '5 minutes',
      servings: 1,
      tags: ['High Protein', 'Quick', 'Breakfast']
    },
    {
      id: '2',
      name: 'Grilled Chicken Salad',
      type: 'lunch',
      calories: 450,
      protein: 35,
      carbs: 25,
      fat: 22,
      prepTime: '15 minutes',
      servings: 1,
      tags: ['High Protein', 'Low Carb', 'Lunch']
    },
    {
      id: '3',
      name: 'Salmon with Quinoa',
      type: 'dinner',
      calories: 580,
      protein: 42,
      carbs: 45,
      fat: 28,
      prepTime: '25 minutes',
      servings: 1,
      tags: ['High Protein', 'Omega-3', 'Dinner']
    },
    {
      id: '4',
      name: 'Protein Smoothie',
      type: 'snack',
      calories: 180,
      protein: 20,
      carbs: 15,
      fat: 5,
      prepTime: '3 minutes',
      servings: 1,
      tags: ['High Protein', 'Quick', 'Snack']
    }
  ]);

  const [draggedMeal, setDraggedMeal] = useState<Meal | null>(null);
  const [showAddMeal, setShowAddMeal] = useState(false);

  const getWeekDates = () => {
    const weekStart = new Date(currentWeek);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const getDayNumber = (date: Date) => {
    return date.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newWeek = new Date(currentWeek);
    if (direction === 'prev') {
      newWeek.setDate(newWeek.getDate() - 7);
    } else {
      newWeek.setDate(newWeek.getDate() + 7);
    }
    setCurrentWeek(newWeek);
  };

  const handleDragStart = (meal: Meal) => {
    setDraggedMeal(meal);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number, mealType: string) => {
    e.preventDefault();
    if (!draggedMeal) return;

    const newWeeklyPlan = { ...weeklyPlan };
    const day = newWeeklyPlan.days[dayIndex];

    if (mealType === 'snack') {
      day.meals.snacks = [...day.meals.snacks, draggedMeal];
    } else {
      day.meals[mealType as keyof typeof day.meals] = draggedMeal;
    }

    setWeeklyPlan(newWeeklyPlan);
    setDraggedMeal(null);
  };

  const removeMeal = (dayIndex: number, mealType: string, mealId?: string) => {
    const newWeeklyPlan = { ...weeklyPlan };
    const day = newWeeklyPlan.days[dayIndex];

    if (mealType === 'snack' && mealId) {
      day.meals.snacks = day.meals.snacks.filter(meal => meal.id !== mealId);
    } else {
      day.meals[mealType as keyof typeof day.meals] = undefined;
    }

    setWeeklyPlan(newWeeklyPlan);
  };

  const getDayTotals = (day: DayPlan) => {
    const allMeals = [
      day.meals.breakfast,
      day.meals.lunch,
      day.meals.dinner,
      ...day.meals.snacks
    ].filter(Boolean) as Meal[];

    return allMeals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fat: acc.fat + meal.fat
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  };

  const weekDates = getWeekDates();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Meal Planner</h1>
          <p className="text-slate-300">Plan your weekly meals and nutrition</p>
        </div>

        {/* Week Navigation */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => navigateWeek('prev')}
                className="text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-xl font-bold text-white">
                  {weekDates[0].toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </h2>
                <p className="text-slate-400 text-sm">
                  Week {Math.ceil((weekDates[0].getDate() + weekDates[0].getDay()) / 7)}
                </p>
              </div>
              
              <Button
                variant="ghost"
                onClick={() => navigateWeek('next')}
                className="text-white hover:bg-white/10"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Calendar Grid */}
        <div className="grid grid-cols-7 gap-4">
          {/* Day Headers */}
          {weekDates.map((date, index) => (
            <div key={index} className="text-center">
              <div className={`p-3 rounded-lg ${
                isToday(date) 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white/5 text-slate-300'
              }`}>
                <div className="text-sm font-medium">{getDayName(date)}</div>
                <div className="text-lg font-bold">{getDayNumber(date)}</div>
              </div>
            </div>
          ))}

          {/* Meal Slots */}
          {['breakfast', 'lunch', 'dinner'].map((mealType) => (
            <>
              {/* Meal Type Label */}
              <div className="col-span-7 text-center mb-2">
                <h3 className="text-lg font-semibold text-white capitalize">{mealType}</h3>
              </div>
              
              {/* Meal Slots for each day */}
              {weekDates.map((date, dayIndex) => (
                <div
                  key={`${mealType}-${dayIndex}`}
                  className="min-h-[120px] p-3 bg-white/5 rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 transition-colors"
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, dayIndex, mealType)}
                >
                  {weeklyPlan.days[dayIndex]?.meals[mealType as keyof typeof weeklyPlan.days[0].meals] ? (
                    <div className="relative">
                      <MealCard
                        meal={weeklyPlan.days[dayIndex]?.meals[mealType as keyof typeof weeklyPlan.days[0].meals] as Meal}
                        onRemove={() => removeMeal(dayIndex, mealType)}
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                      Drop meal here
                    </div>
                  )}
                </div>
              ))}
            </>
          ))}

          {/* Snacks Row */}
          <div className="col-span-7 text-center mb-2">
            <h3 className="text-lg font-semibold text-white">Snacks</h3>
          </div>
          
          {weekDates.map((date, dayIndex) => (
            <div
              key={`snacks-${dayIndex}`}
              className="min-h-[120px] p-3 bg-white/5 rounded-lg border-2 border-dashed border-white/20 hover:border-white/40 transition-colors"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, dayIndex, 'snack')}
            >
              <div className="space-y-2">
                {weeklyPlan.days[dayIndex]?.meals.snacks.map((snack, snackIndex) => (
                  <MealCard
                    key={snack.id}
                    meal={snack}
                    onRemove={() => removeMeal(dayIndex, 'snack', snack.id)}
                    compact
                  />
                ))}
                {weeklyPlan.days[dayIndex]?.meals.snacks.length === 0 && (
                  <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                    Drop snacks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Available Meals */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Available Meals</CardTitle>
              <Button
                onClick={() => setShowAddMeal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Meal
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableMeals.map((meal) => (
                <div
                  key={meal.id}
                  draggable
                  onDragStart={() => handleDragStart(meal)}
                  className="cursor-move"
                >
                  <MealCard meal={meal} draggable />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Summary */}
        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Weekly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {weeklyPlan.days.map((day, index) => {
                const totals = getDayTotals(day);
                return (
                  <div key={index} className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-sm font-medium text-slate-300 mb-2">
                      {getDayName(weekDates[index])}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-white">{totals.calories}</div>
                      <div className="text-xs text-slate-400">kcal</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                      <div className="text-red-400">{totals.protein}g</div>
                      <div className="text-yellow-400">{totals.carbs}g</div>
                      <div className="text-green-400">{totals.fat}g</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface MealCardProps {
  meal: Meal;
  onRemove?: () => void;
  compact?: boolean;
  draggable?: boolean;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onRemove, compact = false, draggable = false }) => {
  return (
    <div className={`bg-white/10 rounded-lg border border-white/20 p-3 ${
      compact ? 'text-xs' : 'text-sm'
    } ${draggable ? 'cursor-move' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-white truncate">{meal.name}</div>
          <div className="text-slate-400">{meal.calories} kcal</div>
          
          {!compact && (
            <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
              <div className="text-red-400">P: {meal.protein}g</div>
              <div className="text-yellow-400">C: {meal.carbs}g</div>
              <div className="text-green-400">F: {meal.fat}g</div>
            </div>
          )}
          
          {!compact && (
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {meal.prepTime}
              <Users className="w-3 h-3" />
              {meal.servings}
            </div>
          )}
        </div>
        
        {onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-red-400 hover:bg-red-500/10 p-1 h-auto"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
        
        {draggable && (
          <div className="text-slate-400">
            <DragHandle className="w-4 h-4" />
          </div>
        )}
      </div>
      
      {!compact && meal.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {meal.tags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs bg-white/10 border-white/20 text-white"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default MealPlannerScreen;