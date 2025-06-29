
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'sleep' | 'load' | 'strain';
  tone?: 'glass' | 'flat';
  shadowLevel?: 'sm' | 'md' | 'lg' | 'xl';
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, accent, tone = 'glass', shadowLevel = 'md', children, ...props }, ref) => {
    const getAccentClasses = () => {
      switch (accent) {
        case 'primary':
          return 'border-blue-400/40 dark:border-blue-400/60 bg-blue-500/10 dark:bg-blue-500/20';
        case 'secondary':
          return 'border-purple-400/40 dark:border-purple-400/60 bg-purple-500/10 dark:bg-purple-500/20';
        case 'success':
          return 'border-emerald-400/40 dark:border-emerald-400/60 bg-emerald-500/10 dark:bg-emerald-500/20';
        case 'warning':
          return 'border-amber-400/40 dark:border-amber-400/60 bg-amber-500/10 dark:bg-amber-500/20';
        case 'error':
          return 'border-red-400/40 dark:border-red-400/60 bg-red-500/10 dark:bg-red-500/20';
        case 'sleep':
          return 'border-blue-400/30 dark:border-blue-400/50 hover:border-blue-400/50 dark:hover:border-blue-400/70';
        case 'load':
          return 'border-purple-400/30 dark:border-purple-400/50 hover:border-purple-400/50 dark:hover:border-purple-400/70';
        case 'strain':
          return 'border-orange-400/30 dark:border-orange-400/50 hover:border-orange-400/50 dark:hover:border-orange-400/70';
        default:
          return 'border-white/10 dark:border-white/20 hover:border-white/20 dark:hover:border-white/30';
      }
    };

    const getToneStyles = () => {
      if (tone === 'flat') {
        return 'bg-transparent border-transparent shadow-none';
      }
      return cn(
        'bg-glass-card-light/60 dark:bg-glass-card-dark/80',
        'backdrop-blur-lg border shadow-glass',
        'hover:bg-glass-card-light/80 dark:hover:bg-glass-card-dark/90'
      );
    };

    const getShadowLevel = () => {
      switch (shadowLevel) {
        case 'sm':
          return 'shadow-glass-sm';
        case 'lg':
          return 'shadow-glass-lg';
        case 'xl':
          return 'shadow-glass-xl';
        default:
          return 'shadow-glass-md';
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl transition-all duration-300',
          tone !== 'flat' && getToneStyles(),
          tone !== 'flat' && getAccentClasses(),
          tone !== 'flat' && getShadowLevel(),
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

export default GlassCard;
