import React from 'react';

interface SleepGaugeProps {
  value: number; // 0-100 (sleep efficiency)
  size?: 'mini' | 'regular' | 'large';
  showValue?: boolean;
  className?: string;
}

export const SleepGauge: React.FC<SleepGaugeProps> = ({ 
  value, 
  size = 'regular', 
  showValue = true,
  className = '' 
}) => {
  // Clamp value between 0-100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Calculate stroke-dasharray for the progress
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (clampedValue / 100) * circumference;
  
  // Get color based on sleep efficiency level
  const getSleepColor = (val: number) => {
    if (val >= 85) return 'hsl(var(--success))'; // Green - Excellent sleep
    if (val >= 70) return 'hsl(var(--warning))'; // Yellow - Good sleep
    return 'hsl(var(--destructive))'; // Red - Poor sleep
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
  const sleepColor = getSleepColor(clampedValue);

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
          stroke={sleepColor}
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
            style={{ color: sleepColor }}
          >
            {Math.round(clampedValue)}%
          </div>
          <div className={`${config.text} text-white/60 uppercase tracking-wide`}>
            sleep
          </div>
        </div>
      )}
    </div>
  );
};