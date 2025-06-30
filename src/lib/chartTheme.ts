
// Central chart theme and helper utilities
export const colors = {
  text: "#E4E4E7",
  grid: "rgba(255,255,255,0.08)",
  accent: "#7C3AED",
  positive: "#10B981",
  negative: "#EF4444",
  warning: "#F59E0B",
  info: "#3B82F6",
  muted: "rgba(255,255,255,0.6)",
  background: "rgba(0,0,0,0.1)"
};

export const chartTheme = {
  colors,
  fontSize: {
    small: 11,
    normal: 12,
    large: 14
  },
  spacing: {
    padding: 16,
    margin: 8
  }
};

// Helper to create standardized line configurations
export const makeLine = (color: string, options: {
  strokeWidth?: number;
  strokeDasharray?: string;
  dot?: boolean;
  activeDot?: boolean;
} = {}) => ({
  stroke: color,
  strokeWidth: options.strokeWidth || 2,
  strokeDasharray: options.strokeDasharray || "0",
  dot: options.dot !== false ? { fill: color, strokeWidth: 2, r: 4 } : false,
  activeDot: options.activeDot !== false ? { r: 6, fill: color } : false
});

// Helper to create standardized Y-axis
export const makeYAxis = (domain?: [number, number], label?: string, options: {
  fontSize?: number;
  tickCount?: number;
} = {}) => ({
  domain: domain || ['auto', 'auto'],
  fontSize: options.fontSize || chartTheme.fontSize.small,
  tickLine: false,
  axisLine: false,
  tickCount: options.tickCount || 5,
  label: label ? {
    value: label,
    angle: -90,
    position: 'insideLeft',
    style: { textAnchor: 'middle', fill: colors.text }
  } : undefined
});

// Helper to create standardized X-axis
export const makeXAxis = (options: {
  fontSize?: number;
  tickFormatter?: (value: any) => string;
  interval?: number | 'preserveStart' | 'preserveEnd' | 'preserveStartEnd';
} = {}) => ({
  fontSize: options.fontSize || chartTheme.fontSize.small,
  tickLine: false,
  axisLine: false,
  tickFormatter: options.tickFormatter,
  interval: options.interval || 'preserveStartEnd'
});

// Reference line configurations
export const referenceLines = {
  readiness: [
    { value: 50, color: colors.negative, label: "Low", strokeDasharray: "5 5" },
    { value: 75, color: colors.warning, label: "Moderate", strokeDasharray: "5 5" }
  ],
  acwr: [
    { value: 0.8, color: colors.info, label: "Low Risk", strokeDasharray: "5 5" },
    { value: 1.3, color: colors.warning, label: "Moderate Risk", strokeDasharray: "5 5" },
    { value: 1.6, color: colors.negative, label: "High Risk", strokeDasharray: "5 5" }
  ],
  sleep: [
    { value: 7, color: colors.positive, label: "Optimal", strokeDasharray: "3 3" },
    { value: 9, color: colors.positive, label: "Optimal", strokeDasharray: "3 3" }
  ]
};

// Tooltip formatter utilities
export const formatWithUnit = (value: number, unit: string): string => {
  if (typeof value !== 'number') return '--';
  
  switch (unit) {
    case '%':
      return `${Math.round(value)}%`;
    case 'h':
      return `${value.toFixed(1)}h`;
    case 'ms':
      return `${Math.round(value)}ms`;
    case 'bpm':
      return `${Math.round(value)} bpm`;
    default:
      return value.toFixed(1);
  }
};

export const createTooltipFormatter = (unitMap: Record<string, string>) => {
  return (value: any, name: string) => {
    const unit = unitMap[name] || '';
    return [formatWithUnit(Number(value), unit), name];
  };
};

export const standardTooltipProps = {
  contentStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    color: colors.text,
    fontSize: chartTheme.fontSize.small
  },
  cursor: { stroke: colors.grid, strokeWidth: 1 }
};
