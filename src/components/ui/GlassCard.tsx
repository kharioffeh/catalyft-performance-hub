
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
          return 'border-indigo-400/40 bg-indigo-500/10';
        case 'secondary':
          return 'border-purple-400/40 bg-purple-500/10';
        case 'success':
          return 'border-emerald-400/40 bg-emerald-500/10';
        case 'warning':
          return 'border-amber-400/40 bg-amber-500/10';
        case 'error':
          return 'border-red-400/40 bg-red-500/10';
        case 'sleep':
          return 'border-blue-400/30 hover:border-blue-400/50';
        case 'load':
          return 'border-purple-400/30 hover:border-purple-400/50';
        case 'strain':
          return 'border-orange-400/30 hover:border-orange-400/50';
        default:
          return 'border-white/10 hover:border-white/20';
      }
    };

    const getToneStyles = () => {
      if (tone === 'flat') {
        return 'bg-transparent border-transparent shadow-none';
      }
      return 'bg-white/5 backdrop-blur-lg border shadow-glass hover:bg-white/10';
    };

    const getShadowLevel = () => {
      switch (shadowLevel) {
        case 'sm':
          return 'shadow-sm';
        case 'lg':
          return 'shadow-lg';
        case 'xl':
          return 'shadow-xl';
        default:
          return 'shadow-md';
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
