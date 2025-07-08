import React from 'react';

interface LoadGaugeProps {
  value: number; // Daily load value (0-1000+ typical range)
  acwr?: number; // ACWR ratio (0.5-2.0 typical range)
  size?: 'mini' | 'regular' | 'large';
  showValue?: boolean;
  className?: string;
  metric?: 'load' | 'acwr';
}

export const LoadGauge: React.FC<LoadGaugeProps> = ({ 
  value, 
  acwr,
  size = 'regular', 
  showValue = true,
  className = '',
  metric = 'load'
}) => {
  // For load gauge: normalize to 0-100 scale (assuming max load of 1000)
  // For ACWR gauge: normalize 0.5-2.0 range to 0-100 scale
  const normalizedValue = metric === 'acwr' 
    ? Math.max(0, Math.min(100, ((value - 0.5) / 1.5) * 100))
    : Math.max(0, Math.min(100, (value / 1000) * 100));
  
  // Calculate stroke-dasharray for the progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;
  
  // Get color based on metric type and value
  const getColor = () => {
    if (metric === 'acwr') {
      // ACWR color coding: optimal 0.8-1.3, caution 1.3-1.5, danger >1.5
      if (value >= 0.8 && value <= 1.3) return 'hsl(var(--success))'; // Green - Optimal
      if (value <= 1.5) return 'hsl(var(--warning))'; // Yellow - Caution
      return 'hsl(var(--destructive))'; // Red - High risk
    } else {
      // Load color coding: progressive intensity
      if (value <= 300) return 'hsl(var(--success))'; // Green - Low load
      if (value <= 600) return 'hsl(var(--warning))'; // Yellow - Moderate load
      return 'hsl(var(--destructive))'; // Red - High load
    }
  };

  // Get size configurations
  const sizeConfig = {
    mini: { 
      svg: 'w-16 h-16', 
      text: 'text-xs', 
      valueText: 'text-lg font-bold',
      strokeWidth: 4 
    },
    regular: { 
      svg: 'w-24 h-24', 
      text: 'text-sm', 
      valueText: 'text-xl font-bold',
      strokeWidth: 6 
    },
    large: { 
      svg: 'w-32 h-32', 
      text: 'text-base', 
      valueText: 'text-2xl font-bold',
      strokeWidth: 8 
    }
  };

  const config = sizeConfig[size];
  const gaugeColor = getColor();

  // Format display value
  const displayValue = metric === 'acwr' 
    ? value.toFixed(2)
    : Math.round(value).toString();

  const displayLabel = metric === 'acwr' ? 'acwr' : 'load';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg 
        className={config.svg}
        viewBox="0 0 100 100"
      >
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={config.strokeWidth}
          opacity="0.2"
        />
        
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={gaugeColor}
          strokeWidth={config.strokeWidth}
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      
      {/* Center value display */}
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div 
            className={`${config.valueText} text-white`}
            style={{ color: gaugeColor }}
          >
            {displayValue}
          </div>
          <div className={`${config.text} text-white/60 uppercase tracking-wide`}>
            {displayLabel}
          </div>
        </div>
      )}
    </div>
  );
};