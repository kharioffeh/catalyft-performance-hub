import React from 'react';
import { cn } from '@/lib/utils';

interface ChartViewProps {
  children: React.ReactNode;
  className?: string;
}

export const ChartView: React.FC<ChartViewProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      "w-full h-[240px] rounded-2xl overflow-hidden mb-6",
      className
    )}>
      {children}
    </div>
  );
};