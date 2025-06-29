
import React from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBox } from './SkeletonBox';

interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
  animate?: boolean;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
  className,
  rows = 5,
  columns = 4,
  showHeader = true,
  animate = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-black/5 dark:bg-white/5',
        'border border-black/10 dark:border-white/10',
        'rounded-xl overflow-hidden',
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading table"
      {...props}
    >
      {showHeader && (
        <div className="border-b border-black/10 dark:border-white/10 p-4">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, i) => (
              <SkeletonBox key={i} height={20} animate={animate} />
            ))}
          </div>
        </div>
      )}

      <div className="p-4 space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div 
            key={rowIndex} 
            className="grid gap-4" 
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <SkeletonBox 
                key={colIndex} 
                height={16} 
                className={cn(
                  colIndex === 0 && 'w-3/4',
                  colIndex === columns - 1 && 'w-1/2'
                )}
                animate={animate}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
