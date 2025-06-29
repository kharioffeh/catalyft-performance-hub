
import React from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBox } from './SkeletonBox';

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  showHeader?: boolean;
  headerHeight?: number;
  contentLines?: number;
  animate?: boolean;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  className,
  showHeader = true,
  headerHeight = 24,
  contentLines = 3,
  animate = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white/5 dark:bg-white/5 backdrop-blur-sm',
        'border border-white/10 dark:border-white/10',
        'rounded-xl p-6',
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading card content"
      {...props}
    >
      {showHeader && (
        <SkeletonBox 
          height={headerHeight} 
          className="mb-4 w-3/4" 
          animate={animate}
        />
      )}
      
      <div className="space-y-3">
        {Array.from({ length: contentLines }).map((_, i) => (
          <SkeletonBox
            key={i}
            height={16}
            className={cn(
              'w-full',
              i === contentLines - 1 && 'w-2/3'
            )}
            animate={animate}
          />
        ))}
      </div>
    </div>
  );
};
