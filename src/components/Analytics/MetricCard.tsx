
import React from 'react';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  metric: 'readiness' | 'sleep' | 'load' | 'strain';
  title: string;
  latest?: number;
  delta?: number;
  onClick: () => void;
  unit?: string;
  target?: number;
  children?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  title,
  latest,
  delta,
  onClick,
  unit = "",
  target,
  children
}) => {
  const getTrendIcon = () => {
    if (delta === undefined) return null;
    if (delta > 0) return <ArrowUp className="w-3 h-3 text-green-500" />;
    if (delta < 0) return <ArrowDown className="w-3 h-3 text-red-500" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  const getTrendColor = () => {
    if (delta === undefined) return "text-gray-500";
    if (delta > 0) return "text-green-600";
    if (delta < 0) return "text-red-600";
    return "text-gray-500";
  };

  const formatValue = (value?: number) => {
    if (value === undefined) return "—";
    return value % 1 === 0 ? value.toString() : value.toFixed(1);
  };

  const getProgressPercentage = () => {
    if (!target || latest === undefined) return 0;
    return Math.min((latest / target) * 100, 100);
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        'relative rounded-xl bg-card backdrop-blur-lg border border-border p-4 cursor-pointer transition-all duration-200',
        `before:absolute before:inset-0 before:rounded-xl before:pointer-events-none before:ring-1 before:ring-${metric}/ring`,
        `hover:bg-${metric}/10`
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex flex-col gap-1">
            <h3 className="text-xs text-white/60 font-medium">{title}</h3>
            <span className={cn(
              "text-3xl font-semibold",
              `text-${metric}`
            )}>
              {formatValue(latest)}{unit}
            </span>
            {delta !== undefined && (
              <div className={`flex items-center gap-1 text-sm ${getTrendColor()}`}>
                {getTrendIcon()}
                <span>{Math.abs(delta).toFixed(1)}</span>
              </div>
            )}
          </div>
          {delta !== undefined && (
            <p className="text-xs text-white/40 mt-1">vs 7d avg</p>
          )}
        </div>
      </div>
      
      {target && latest !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-white/60 mb-1">
            <span>Progress to target</span>
            <span>{target}{unit}</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-1.5">
            <div 
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                `bg-${metric}`
              )}
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
        </div>
      )}
      
      {children}
    </div>
  );
};
