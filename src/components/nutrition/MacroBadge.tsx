import React from 'react';

interface MacroBadgeProps {
  type: 'P' | 'C' | 'F';
  value: number;
  size?: 'sm' | 'md';
}

export const MacroBadge: React.FC<MacroBadgeProps> = ({ 
  type, 
  value, 
  size = 'md' 
}) => {
  const getColor = () => {
    switch (type) {
      case 'P': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'C': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'F': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getLabel = () => {
    switch (type) {
      case 'P': return 'Protein';
      case 'C': return 'Carbs';
      case 'F': return 'Fat';
      default: return '';
    }
  };

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-1 text-xs' 
    : 'px-3 py-1.5 text-sm';

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border ${getColor()} ${sizeClasses}`}>
      <span className="font-medium">{type}</span>
      <span className="font-bold">{value}g</span>
    </div>
  );
};