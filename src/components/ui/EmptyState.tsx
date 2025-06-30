
import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  // New props for illustration-based empty states
  type?: 'sleep' | 'readiness' | 'load';
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
  illustration,
  ctaLabel,
  onAction
}) => {
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
        />
        <h3 className="text-lg font-medium text-white mb-2">{title || copy.title}</h3>
        <p className="text-sm text-white/60 mb-6 max-w-[280px]">
          {description || copy.description}
        </p>
        {onAction && (
          <button
            onClick={onAction}
            className="px-6 py-2.5 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white font-medium transition-colors"
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
          <Icon className="w-8 h-8 text-white/40" />
        </div>
      )}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-white/60 mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
};
