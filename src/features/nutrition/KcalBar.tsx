import React from 'react';
import { cn } from '@/lib/utils';
import { useTargets } from '@/hooks/useTargets';
import { useNutritionDay } from '@/hooks/useNutritionDay';

export const KcalBar: React.FC = () => {
  const { kcalTarget } = useTargets();
  const { kcal } = useNutritionDay();

  // Calculate progress percentage
  const progressPercentage = kcalTarget > 0 ? (kcal / kcalTarget) * 100 : 0;
  const formattedPercentage = progressPercentage.toFixed(1);
  const isOverTarget = progressPercentage > 100;

  return (
    <div className="glass-card p-4 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-white-90">Calories</h3>
        <span className="text-sm text-white-60">
          {Math.round(kcal)} / {Math.round(kcalTarget)} kcal
        </span>
      </div>

      {/* Progress Bar Container */}
      <div className="mb-2">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
          {/* Main Progress Bar */}
          <div 
            className={cn(
              "h-full rounded-full absolute left-0 top-0 transition-all duration-500",
              isOverTarget ? "bg-orange-500" : "bg-brand-blue"
            )}
            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
          />
          
          {/* Overflow Bar (when >100%) */}
          {isOverTarget && (
            <div 
              className="h-full bg-orange-500 rounded-full absolute top-0 opacity-60"
              style={{ 
                left: '100%', 
                width: `${Math.min(progressPercentage - 100, 50)}%` 
              }}
            />
          )}
        </div>
      </div>

      {/* Percentage Display */}
      <div className="flex justify-between items-center">
        <span className={cn(
          "text-sm font-medium",
          isOverTarget ? "text-orange-400" : "text-white-90"
        )}>
          {formattedPercentage}%
        </span>
        {isOverTarget && (
          <span className="text-xs text-orange-400 font-medium">
            Over target
          </span>
        )}
      </div>
    </div>
  );
};
