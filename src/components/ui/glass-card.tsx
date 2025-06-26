
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  className, 
  accent,
  children, 
  ...props 
}) => {
  const getAccentClasses = () => {
    switch (accent) {
      case 'primary':
        return 'border-indigo-400/30 bg-indigo-500/5';
      case 'secondary':
        return 'border-purple-400/30 bg-purple-500/5';
      case 'success':
        return 'border-emerald-400/30 bg-emerald-500/5';
      case 'warning':
        return 'border-amber-400/30 bg-amber-500/5';
      case 'error':
        return 'border-red-400/30 bg-red-500/5';
      default:
        return 'border-white/20 bg-white/5';
    }
  };

  return (
    <div
      className={cn(
        'backdrop-blur-md border rounded-2xl shadow-xl transition-all hover:bg-white/10',
        getAccentClasses(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
