
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
        'bg-white/5 dark:bg-white/10',
        'border border-white/5 dark:border-white/10',
        'rounded-lg relative overflow-hidden',
        animate && 'animate-pulse',
        className
      )}
      style={combinedStyle}
      role="status"
      aria-busy="true"
      aria-label="Loading content"
      {...props}
    >
      {animate && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 dark:via-white/10 to-transparent" />
      )}
    </div>
  );
};
