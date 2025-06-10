
import React from 'react';

interface PeriodSelectorProps {
  period: 1 | 7 | 30 | 90;
  onPeriodChange: (period: 1 | 7 | 30 | 90) => void;
  className?: string;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period,
  onPeriodChange,
  className = ""
}) => {
  const periods = [
    { value: 1, label: "24h" },
    { value: 7, label: "7d" },
    { value: 30, label: "30d" },
    { value: 90, label: "90d" }
  ];

  return (
    <div className={`flex items-center gap-2 bg-gray-100 rounded-lg p-1 ${className}`}>
      {periods.map((p) => (
        <button
          key={p.value}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            period === p.value 
              ? "bg-white text-blue-600 shadow-sm font-semibold" 
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          }`}
          onClick={() => onPeriodChange(p.value as 1 | 7 | 30 | 90)}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
};
