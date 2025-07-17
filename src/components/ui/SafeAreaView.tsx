import React from 'react';
import { cn } from '@/lib/utils';

interface SafeAreaViewProps {
  children: React.ReactNode;
  className?: string;
}

export const SafeAreaView: React.FC<SafeAreaViewProps> = ({ 
  children, 
  className 
}) => {
  return (
    <div className={cn(
      "flex-1 bg-brand-charcoal px-4 safe-area-pt safe-area-pb",
      className
    )}>
      {children}
    </div>
  );
};