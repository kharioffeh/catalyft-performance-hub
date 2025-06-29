
import { cn } from '@/lib/utils';

/**
 * Utility function to conditionally apply classes based on theme
 */
export const cnTheme = (lightClasses: string, darkClasses: string): string => {
  return cn(lightClasses, `dark:${darkClasses.replace(/^dark:/, '')}`);
};

/**
 * Get theme-aware color classes for common use cases
 */
export const getThemeColors = () => ({
  surface: 'bg-surface-light dark:bg-surface-dark',
  card: 'bg-glass-card-light/60 dark:bg-glass-card-dark/80',
  cardHover: 'hover:bg-glass-card-light/80 dark:hover:bg-glass-card-dark/90',
  border: 'border-white/20 dark:border-white/10',
  text: 'text-gray-800 dark:text-white',
  textMuted: 'text-gray-600 dark:text-white/70',
  accent: 'text-theme-accent',
  success: 'text-theme-success',
  danger: 'text-theme-danger',
  info: 'text-theme-info',
  warning: 'text-theme-warning',
});

/**
 * Get chart colors based on theme
 */
export const getChartColors = (theme: 'light' | 'dark') => ({
  emerald: theme === 'light' ? '#10b981' : '#34d399',
  sky: theme === 'light' ? '#0ea5e9' : '#38bdf8',
  violet: theme === 'light' ? '#8b5cf6' : '#a78bfa',
  amber: theme === 'light' ? '#f59e0b' : '#fbbf24',
  rose: theme === 'light' ? '#f43f5e' : '#fb7185',
});

/**
 * Glass morphism utility classes
 */
export const glassStyles = {
  card: 'bg-white/5 dark:bg-white/5 backdrop-blur-lg border border-white/10 dark:border-white/10 shadow-glass',
  cardHover: 'hover:bg-white/10 dark:hover:bg-white/10',
  surface: 'bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md',
  overlay: 'bg-black/20 dark:bg-black/40 backdrop-blur-sm',
  skeleton: 'bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5',
};

/**
 * Skeleton animation keyframes for custom fade effect
 */
export const skeletonKeyframes = {
  'skeleton-fade': {
    '0%, 100%': { opacity: '0.3' },
    '50%': { opacity: '0.6' },
  },
};
