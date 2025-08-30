import React from 'react';

interface MacroRingProps {
  macro: string;
  value: number;
  target: number;
  color: string;
  size?: number;
}

export const MacroRing: React.FC<MacroRingProps> = ({ 
  macro, 
  value, 
  target, 
  color, 
  size = 60 
}) => {
  const radius = size / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min((value / target) * 100, 100);
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="4"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-sm font-bold text-white">
            {Math.round(progress)}%
          </div>
        </div>
      </div>
      
      {/* Label and values */}
      <div className="text-center mt-2">
        <div className="text-xs font-medium text-white/70">{macro}</div>
        <div className="text-xs text-white/50">
          {value}g / {target}g
        </div>
      </div>
    </div>
  );
};