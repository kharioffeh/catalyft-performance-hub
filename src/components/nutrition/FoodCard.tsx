import React from 'react';
import { MacroBadge } from './MacroBadge';

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

interface FoodCardProps {
  food: Food;
  onDelete?: () => void;
  className?: string;
}

export const FoodCard: React.FC<FoodCardProps> = ({ 
  food, 
  onDelete,
  className = '' 
}) => {
  const defaultImage = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=80&h=80&fit=crop&crop=center';

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center gap-4">
        {/* Food Image */}
        <div className="flex-shrink-0">
          <img
            src={food.image || defaultImage}
            alt={food.name}
            className="w-16 h-16 rounded-lg object-cover bg-white/10"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = defaultImage;
            }}
          />
        </div>

        {/* Food Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <h3 className="text-white font-semibold truncate">{food.name}</h3>
              {food.brand && (
                <p className="text-sm text-white/60 truncate">{food.brand}</p>
              )}
              <p className="text-lg font-bold text-white mt-1">{food.calories} cal</p>
            </div>
          </div>
        </div>

        {/* Macro Badges */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <MacroBadge type="P" value={food.protein} size="sm" />
          <MacroBadge type="C" value={food.carbs} size="sm" />
          <MacroBadge type="F" value={food.fats} size="sm" />
        </div>
      </div>
    </div>
  );
};