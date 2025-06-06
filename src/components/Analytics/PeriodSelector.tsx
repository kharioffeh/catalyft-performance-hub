
import React from 'react';

interface PeriodSelectorProps {
  period: 7 | 30 | 90;
  onPeriodChange: (period: 7 | 30 | 90) => void;
  className?: string;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period,
  onPeriodChange,
  className = ""
}) => {
  return (
    <div className={`flex items-center gap-2 bg-gray-100 rounded-lg p-1 ${className}`}>
      {[7, 30, 90].map((d) => (
        <button
          key={d}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            period === d 
              ? "bg-white text-blue-600 shadow-sm font-semibold" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
          onClick={() => onPeriodChange(d as 7 | 30 | 90)}
        >
          {d}d
        </button>
      ))}
    </div>
  );
};
