
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  // New props for illustration-based empty states
  type?: 'sleep' | 'readiness' | 'load';
  metric?: 'readiness' | 'sleep' | 'load' | 'strain';
  illustration?: string;
  ctaLabel?: string;
  onAction?: () => void;
}

const defaultCopy = {
  sleep: { 
    title: 'No sleep data yet', 
    description: 'Connect your device to start tracking sleep patterns and recovery insights.',
    cta: 'Connect my watch' 
  },
  readiness: { 
    title: 'No readiness score', 
    description: 'Enable HRV sync to see your daily readiness and recovery status.',
    cta: 'Enable HRV sync' 
  },
  load: { 
    title: 'No training load', 
    description: 'Log your first workout to start tracking training load and progress.',
    cta: 'Log first workout' 
  },
};

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  type,
  metric,
  illustration,
  ctaLabel,
  onAction
}) => {
  // Determine the metric color from type or explicit metric prop
  const metricColor = metric || type;
  
  // Use illustration-based layout if type is provided
  if (type) {
    const copy = defaultCopy[type];
    const illustrationSrc = illustration || `/illustrations/no-${type}.svg`;
    
    return (
      <div className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}>
        <img
          src={illustrationSrc}
          alt=""
          className="w-40 h-40 max-w-[70%] mb-6 hover:animate-wiggle transition-transform duration-300"
          style={metricColor ? { filter: `hue-rotate(${getHueRotation(metricColor)}deg)` } : undefined}
        />
        <h3 className="text-lg font-medium text-white mb-2">{title || copy.title}</h3>
        <p className="text-sm text-white/60 mb-6 max-w-[280px]">
          {description || copy.description}
        </p>
        {onAction && (
          <button
            onClick={onAction}
            className={cn(
              "px-6 py-2.5 rounded-full text-white font-medium transition-colors",
              metricColor ? 
                `bg-${metricColor} hover:bg-${metricColor}/90` : 
                "bg-indigo-500 hover:bg-indigo-400"
            )}
          >
            {ctaLabel || copy.cta}
          </button>
        )}
        {action && !onAction && action}
      </div>
    );
  }

  // Fallback to icon-based layout (existing functionality)
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      className
    )}>
      {Icon && (
        <div className="p-4 bg-white/5 dark:bg-white/5 rounded-full mb-4 backdrop-blur-sm">
          <Icon className={cn(
            "w-8 h-8",
            metricColor ? `text-${metricColor}` : "text-white/40"
          )} />
        </div>
      )}
      <h3 className="text-lg font-medium text-white mb-2">{title || 'No data available'}</h3>
      <p className="text-white/60 mb-6 max-w-md">{description || 'There is currently no data to display.'}</p>
      {action}
    </div>
  );
};

// Helper function to adjust illustration colors based on metric
const getHueRotation = (metric: string) => {
  switch (metric) {
    case 'readiness': return 120; // green
    case 'sleep': return 240; // blue  
    case 'load': return 45; // amber
    case 'strain': return 340; // rose
    default: return 0;
  }
};
