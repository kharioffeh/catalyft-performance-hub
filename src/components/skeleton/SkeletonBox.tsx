
import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: number | string;
  height?: number | string;
  animate?: boolean;
}

export const SkeletonBox: React.FC<SkeletonBoxProps> = ({
  className,
  width,
  height,
  animate = true,
  style,
  ...props
}) => {
  const combinedStyle = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    ...style,
  };

  return (
    <div
      className={cn(
        'bg-gray-200/30 dark:bg-gray-700/30',
        'border border-gray-200/50 dark:border-gray-600/50',
        'rounded-lg relative overflow-hidden',
        animate && 'animate-skeleton-fade',
        className
      )}
      style={combinedStyle}
      role="status"
      aria-busy="true"
      aria-label="Loading content"
      {...props}
    />
  );
};
