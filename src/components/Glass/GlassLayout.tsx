
import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

interface GlassLayoutProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dashboard' | 'analytics' | 'settings' | 'chat';
}

export const GlassLayout: React.FC<GlassLayoutProps> = ({
  children,
  className,
  variant = 'default'
}) => {
  const { resolvedTheme } = useTheme();

  return (
    <div className={cn(
      "min-h-screen w-full bg-brand-charcoal transition-all duration-300",
      className
    )}>
      {children}
    </div>
  );
};
