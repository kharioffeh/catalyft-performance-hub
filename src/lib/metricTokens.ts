
// Metric-specific color tokens for consistent theming
export const metricTokens = {
  readiness: {
    primary: '#10B981', // emerald-500
    light: '#6EE7B7',   // emerald-300
    dark: '#059669',    // emerald-600
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.2)',
  },
  sleep: {
    primary: '#3B82F6', // blue-500
    light: '#93C5FD',   // blue-300
    dark: '#1D4ED8',    // blue-600
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(59, 130, 246, 0.2)',
  },
  load: {
    primary: '#F59E0B', // amber-500
    light: '#FCD34D',   // amber-300
    dark: '#D97706',    // amber-600
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.2)',
  },
  strain: {
    primary: '#EF4444', // red-500
    light: '#FCA5A5',   // red-300
    dark: '#DC2626',    // red-600
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.2)',
  },
} as const;

export type MetricType = keyof typeof metricTokens;

export const getMetricColor = (metric: MetricType, variant: 'primary' | 'light' | 'dark' | 'bg' | 'border' = 'primary') => {
  return metricTokens[metric][variant];
};
