import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MacroRing } from './MacroRing';

interface MacroSummaryCardProps {
  calories: { current: number; target: number };
  protein: { current: number; target: number };
  carbs: { current: number; target: number };
  fats: { current: number; target: number };
  className?: string;
}

export const MacroSummaryCard: React.FC<MacroSummaryCardProps> = ({
  calories,
  protein,
  carbs,
  fats,
  className = ''
}) => {
  const getCalorieColor = () => {
    const percentage = (calories.current / calories.target) * 100;
    if (percentage >= 90) return 'text-green-400';
    if (percentage >= 70) return 'text-yellow-400';
    return 'text-blue-400';
  };

  return (
    <Card className={`bg-white/5 border-white/10 backdrop-blur-sm ${className}`}>
      <CardContent className="p-6">
        {/* Calories Display */}
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-white mb-1">
            {calories.current.toLocaleString()} / {calories.target.toLocaleString()} cal
          </div>
          <div className={`text-sm font-medium ${getCalorieColor()}`}>
            {Math.round((calories.current / calories.target) * 100)}% of daily goal
          </div>
        </div>

        {/* Macro Rings */}
        <div className="flex justify-center gap-8">
          <MacroRing 
            macro="Protein" 
            value={protein.current} 
            target={protein.target} 
            color="#EF4444" 
            size={80}
          />
          <MacroRing 
            macro="Carbs" 
            value={carbs.current} 
            target={carbs.target} 
            color="#3B82F6" 
            size={80}
          />
          <MacroRing 
            macro="Fats" 
            value={fats.current} 
            target={fats.target} 
            color="#F59E0B" 
            size={80}
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{protein.current}g</div>
            <div className="text-xs text-white/60">Protein</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{carbs.current}g</div>
            <div className="text-xs text-white/60">Carbs</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{fats.current}g</div>
            <div className="text-xs text-white/60">Fats</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};