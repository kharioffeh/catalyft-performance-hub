
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
        'bg-black/5 dark:bg-white/5',
        'border border-black/5 dark:border-white/5',
        'rounded-lg relative overflow-hidden',
        animate && 'animate-[skeleton-fade_2s_ease-in-out_infinite]',
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
