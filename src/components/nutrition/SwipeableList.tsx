import React from 'react';

interface SwipeableListProps {
  children: React.ReactNode;
  className?: string;
}

export const SwipeableList: React.FC<SwipeableListProps> = ({ 
  children, 
  className = '' 
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {children}
    </div>
  );
};