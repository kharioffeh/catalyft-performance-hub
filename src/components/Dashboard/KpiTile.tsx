
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { AnimatedKpiValue } from '@/components/animations/AnimatedKpiValue';

interface KpiTileProps {
  title: string;
  value: number | string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  color?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export const KpiTile: React.FC<KpiTileProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'text-gray-600',
  onClick,
  isLoading = false
}) => {
  const isClickable = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  // Enhanced value rendering with animation
  const renderValue = () => {
    if (isLoading) {
      return <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />;
    }

    const numericValue = typeof value === 'number' ? value : parseFloat(value.toString());
    
    if (!isNaN(numericValue)) {
      return (
        <AnimatedKpiValue
          value={numericValue}
          className="text-2xl font-bold text-gray-900 leading-none"
          duration={0.8}
          delay={0.1}
        />
      );
    }

    return (
      <div className="text-2xl font-bold text-gray-900 leading-none">
        {value}
      </div>
    );
  };

  const tileContent = (
    <>
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium text-muted-foreground truncate flex-1">
          {title}
        </h3>
        {Icon && (
          <div className="flex-shrink-0 ml-2">
            <Icon className={cn("w-4 h-4", color)} />
          </div>
        )}
      </div>
      
      {/* Value display */}
      <div className="flex-1 flex flex-col justify-center">
        {renderValue()}
        
        {/* Trend indicator */}
        {trend && !isLoading && (
          <div className={cn(
            "flex items-center gap-1 text-xs mt-1",
            trend.positive ? "text-green-600" : "text-red-600"
          )}>
            {trend.positive ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </>
  );

  const baseClasses = cn(
    // Fixed dimensions (165px ≈ 165dp at standard DPI)
    "w-[165px] h-[165px]",
    // Styling
    "bg-white rounded-2xl shadow-sm border border-gray-100",
    "p-4 flex flex-col",
    // Touch optimization - minimum 48dp touch target is satisfied by 165px size
    "transition-all duration-200",
    // Clickable states
    isClickable && [
      "cursor-pointer hover:shadow-md hover:scale-[1.02]",
      "active:scale-[0.98] active:shadow-sm",
      "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
    ]
  );

  if (isClickable) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={baseClasses}
        aria-label={`${title}: ${value}`}
      >
        {tileContent}
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {tileContent}
    </div>
  );
};
