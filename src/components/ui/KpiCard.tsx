
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon?: LucideIcon | React.ReactNode;
  delta?: {
    value: string;
    positive: boolean;
  };
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
  layout?: 'horizontal' | 'vertical';
}

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  icon: Icon,
  delta,
  onClick,
  isLoading = false,
  className,
  layout = 'vertical'
}) => {
  const isClickable = !!onClick;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onClick && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick();
    }
  };

  // Fixed icon rendering logic
  const renderIcon = () => {
    if (!Icon) return null;
    
    // If it's already a React element, render it directly
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    
    // If it's a component (function or forwardRef), render as JSX
    if (typeof Icon === 'function' || (Icon && typeof Icon === 'object' && 'render' in Icon)) {
      const IconComponent = Icon as React.ComponentType<any>;
      return <IconComponent className="w-4 h-4 text-white/60" />;
    }
    
    return null;
  };

  const cardContent = (
    <>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-white/70">{title}</h3>
        {Icon && (
          <div className="p-2 bg-white/10 rounded-lg">
            {renderIcon()}
          </div>
        )}
      </div>
      
      <div className="flex items-end justify-between">
        <div className="flex-1">
          {isLoading ? (
            <Skeleton className="h-8 w-16 bg-white/10" />
          ) : (
            <span className="text-2xl font-bold text-white">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
          )}
          
          {delta && !isLoading && (
            <div className={cn(
              "flex items-center gap-1 text-xs mt-1",
              delta.positive ? "text-emerald-400" : "text-rose-400"
            )}>
              {delta.positive ? (
                <ArrowUp className="w-3 h-3" />
              ) : (
                <ArrowDown className="w-3 h-3" />
              )}
              <span>{delta.value}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );

  const baseClasses = cn(
    'backdrop-blur-lg bg-white/5 border border-white/10 rounded-2xl p-4',
    'flex flex-col justify-between',
    'transition-all duration-200',
    layout === 'horizontal' ? 'h-24' : 'h-32',
    isClickable && 'cursor-pointer hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 focus:ring-offset-2 focus:ring-offset-transparent',
    className
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
        {cardContent}
      </div>
    );
  }

  return (
    <div className={baseClasses}>
      {cardContent}
    </div>
  );
};

export default KpiCard;
