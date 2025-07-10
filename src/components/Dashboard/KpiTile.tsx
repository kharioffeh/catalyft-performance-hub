
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { AnimatedKpiValue } from '@/components/animations/AnimatedKpiValue';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { motion, Transition } from 'framer-motion';

interface KpiTileProps {
  title: string;
  value: number | string;
  target?: number; // Target value for pulse animation
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
  target,
  icon: Icon,
  trend,
  color = 'text-gray-600',
  onClick,
  isLoading = false
}) => {
  const { width } = useWindowDimensions();
  const isClickable = !!onClick;
  
  // Check if value meets or exceeds target for pulse animation
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString()) || 0;
  const meetsTarget = target !== undefined && numericValue >= target;
  
  // Responsive font sizes based on screen width
  const isSmallScreen = width < 360;
  const valueTextClass = isSmallScreen ? 'text-xl' : 'text-2xl';
  const titleTextClass = isSmallScreen ? 'text-[10px]' : 'text-xs';

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

    if (!isNaN(numericValue)) {
      return (
        <AnimatedKpiValue
          value={numericValue}
          className={cn(valueTextClass, "font-bold text-gray-900 leading-none")}
          duration={0.8}
          delay={0.1}
        />
      );
    }

    return (
      <div className={cn(valueTextClass, "font-bold text-gray-900 leading-none")}>
        {value}
      </div>
    );
  };

  const tileContent = (
    <>
      {/* Header with title and icon */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={cn(titleTextClass, "font-medium text-muted-foreground truncate flex-1")}>
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
            "flex items-center gap-1 mt-1",
            isSmallScreen ? "text-[10px]" : "text-xs",
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
    // Responsive dimensions with max width constraint
    "w-full max-w-[180px] h-[165px]",
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

  // Pulse animation when target is met
  const pulseAnimation = meetsTarget ? {
    boxShadow: [
      "0 0 0 0 rgba(16, 185, 129, 0.2)",
      "0 0 0 10px rgba(16, 185, 129, 0)",
      "0 0 0 0 rgba(16, 185, 129, 0)"
    ],
    borderColor: [
      "rgba(229, 231, 235, 1)", // border-gray-100
      "rgba(16, 185, 129, 0.5)", // #10B981 at 50% opacity
      "rgba(229, 231, 235, 1)"
    ]
  } : {};

  const pulseTransition: Transition = meetsTarget ? {
    duration: 2,
    repeat: Infinity,
    ease: [0.4, 0, 0.6, 1] // easeInOut cubic-bezier
  } : {};

  if (isClickable) {
    return (
      <motion.div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={baseClasses}
        aria-label={`${title}: ${value}`}
        animate={pulseAnimation}
        transition={pulseTransition}
      >
        {tileContent}
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={baseClasses}
      animate={pulseAnimation}
      transition={pulseTransition}
    >
      {tileContent}
    </motion.div>
  );
};
