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
      "w-full h-[600px] rounded-3xl overflow-hidden shadow-lg border border-border/50 bg-card/50 backdrop-blur-sm",
      className
    )}>
      {children}
    </div>
  );
};