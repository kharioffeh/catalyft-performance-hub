
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

  const getLightGradient = () => {
    switch (variant) {
      case 'dashboard':
        return 'bg-gradient-to-br from-slate-50 to-blue-50';
      case 'analytics':
        return 'bg-gradient-to-br from-slate-50 to-purple-50';
      case 'settings':
        return 'bg-gradient-to-br from-slate-50 to-gray-50';
      case 'chat':
        return 'bg-gradient-to-br from-slate-50 to-slate-100';
      default:
        return 'bg-gradient-to-br from-slate-50 to-indigo-50';
    }
  };

  const getDarkGradient = () => {
    switch (variant) {
      case 'dashboard':
        return 'bg-gradient-to-br from-slate-950 to-blue-950';
      case 'analytics':
        return 'bg-gradient-to-br from-slate-950 to-purple-950';
      case 'settings':
        return 'bg-gradient-to-br from-slate-950 to-gray-950';
      case 'chat':
        return 'bg-gradient-to-br from-slate-950 to-slate-900';
      default:
        return 'bg-gradient-to-br from-slate-950 to-indigo-950';
    }
  };

  const getGradient = () => {
    return resolvedTheme === 'light' ? getLightGradient() : getDarkGradient();
  };

  return (
    <div className={cn(
      "min-h-screen transition-all duration-300",
      getGradient(),
      className
    )}>
      {children}
    </div>
  );
};
