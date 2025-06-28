
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
        return 'border-indigo-400/40 bg-indigo-500/10';
      case 'secondary':
        return 'border-purple-400/40 bg-purple-500/10';
      case 'success':
        return 'border-emerald-400/40 bg-emerald-500/10';
      case 'warning':
        return 'border-amber-400/40 bg-amber-500/10';
      case 'error':
        return 'border-red-400/40 bg-red-500/10';
      default:
        return 'border-gray-400/30 bg-gray-800/60';
    }
  };

  return (
    <div
      className={cn(
        'backdrop-blur-md border rounded-2xl shadow-xl transition-all hover:bg-gray-800/70',
        getAccentClasses(),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
