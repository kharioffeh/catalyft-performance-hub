import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Target } from 'lucide-react';

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

interface MealSectionProps {
  name: string;
  time: string;
  foods: Food[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  children: React.ReactNode;
  className?: string;
}

export const MealSection: React.FC<MealSectionProps> = ({
  name,
  time,
  foods,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFats,
  children,
  className = ''
}) => {
  return (
    <Card className={`bg-white/5 border-white/10 backdrop-blur-sm ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <div>
              <CardTitle className="text-lg text-white">{name}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Clock className="w-4 h-4" />
                {time}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-lg font-bold text-white">{totalCalories} kcal</div>
            <div className="text-xs text-slate-400">Total</div>
          </div>
        </div>

        {/* Macro breakdown */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
          <div className="text-center p-3 bg-red-500/10 rounded-lg">
            <div className="text-sm font-medium text-red-400">Protein</div>
            <div className="text-lg font-bold text-white">{totalProtein}g</div>
          </div>
          <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
            <div className="text-sm font-medium text-yellow-400">Carbs</div>
            <div className="text-lg font-bold text-white">{totalCarbs}g</div>
          </div>
          <div className="text-center p-3 bg-green-500/10 rounded-lg">
            <div className="text-sm font-medium text-green-400">Fat</div>
            <div className="text-lg font-bold text-white">{totalFats}g</div>
          </div>
        </div>
      </CardHeader>

      {/* Food items */}
      <div className="px-6 pb-4">
        {children}
      </div>
    </Card>
  );
};