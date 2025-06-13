
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassContainerProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  className,
  padding = 'md'
}) => {
  const getPadding = () => {
    switch (padding) {
      case 'none': return '';
      case 'sm': return 'p-3';
      case 'md': return 'p-4 md:p-6';
      case 'lg': return 'p-6 md:p-8';
      default: return 'p-4 md:p-6';
    }
  };

  return (
    <div className={cn(
      "rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl transition-all hover:bg-white/15",
      getPadding(),
      className
    )}>
      {children}
    </div>
  );
};
