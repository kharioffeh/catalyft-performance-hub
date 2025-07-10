
// Metric-specific color tokens for consistent theming - updated to match new Tailwind config
export const metricTokens = {
  readiness: {
    primary: '#10B981', // emerald-500
    light: '#34D399',   // emerald-400  
    dark: '#059669',    // emerald-600
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(52, 211, 153, 0.2)', // using ring color
  },
  sleep: {
    primary: '#6366F1', // indigo-500
    light: '#818CF8',   // indigo-400
    dark: '#4F46E5',    // indigo-600
    bg: 'rgba(99, 102, 241, 0.1)',
    border: 'rgba(129, 140, 248, 0.2)', // using ring color
  },
  load: {
    primary: '#F59E0B', // amber-500
    light: '#FBBF24',   // amber-400
    dark: '#D97706',    // amber-600
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(251, 191, 36, 0.2)', // using ring color
  },
  strain: {
    primary: '#F43F5E', // rose-500
    light: '#FB7185',   // rose-400
    dark: '#E11D48',    // rose-600
    bg: 'rgba(244, 63, 94, 0.1)',
    border: 'rgba(251, 113, 133, 0.2)', // using ring color
  },
  stress: {
    primary: '#3B82F6', // blue-500
    light: '#60A5FA',   // blue-400
    dark: '#2563EB',    // blue-600
    bg: 'rgba(59, 130, 246, 0.1)',
    border: 'rgba(96, 165, 250, 0.2)', // using ring color
  },
} as const;

export type MetricType = keyof typeof metricTokens;

export const getMetricColor = (metric: MetricType, variant: 'primary' | 'light' | 'dark' | 'bg' | 'border' = 'primary') => {
  return metricTokens[metric][variant];
};
