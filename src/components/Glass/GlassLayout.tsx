
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
        return 'bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100';
      case 'analytics':
        return 'bg-gradient-to-br from-gray-100 via-purple-50 to-gray-100';
      case 'settings':
        return 'bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100';
      case 'chat':
        return 'bg-gradient-to-br from-white via-gray-50 to-white';
      default:
        return 'bg-gradient-to-br from-gray-100 via-indigo-50 to-gray-100';
    }
  };

  const getDarkGradient = () => {
    switch (variant) {
      case 'dashboard':
        return 'bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900';
      case 'analytics':
        return 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900';
      case 'settings':
        return 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-900';
      case 'chat':
        return 'bg-gradient-to-br from-black/90 via-neutral-900/90 to-black/80';
      default:
        return 'bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900';
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
