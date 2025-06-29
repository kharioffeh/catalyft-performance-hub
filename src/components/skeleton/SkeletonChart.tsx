
import React from 'react';
import { cn } from '@/lib/utils';
import { SkeletonBox } from './SkeletonBox';

interface SkeletonChartProps extends React.HTMLAttributes<HTMLDivElement> {
  showAxes?: boolean;
  showLegend?: boolean;
  animate?: boolean;
}

export const SkeletonChart: React.FC<SkeletonChartProps> = ({
  className,
  showAxes = true,
  showLegend = false,
  animate = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-black/5 dark:bg-white/5',
        'border border-black/10 dark:border-white/10',
        'rounded-xl p-6 h-64',
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Loading chart"
      {...props}
    >
      {showLegend && (
        <div className="flex justify-center mb-4 space-x-4">
          <SkeletonBox width={80} height={16} animate={animate} />
          <SkeletonBox width={80} height={16} animate={animate} />
          <SkeletonBox width={80} height={16} animate={animate} />
        </div>
      )}

      <div className="relative h-full">
        {/* Chart area */}
        <div className="h-full flex items-end justify-between space-x-2 pb-6 pr-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <SkeletonBox
              key={i}
              width={24}
              height={Math.random() * 80 + 40}
              animate={animate}
            />
          ))}
        </div>

        {/* Y-axis */}
        {showAxes && (
          <>
            <div className="absolute left-0 top-0 bottom-6 w-6 flex flex-col justify-between">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBox key={i} width={20} height={12} animate={animate} />
              ))}
            </div>

            {/* X-axis */}
            <div className="absolute bottom-0 left-6 right-0 h-6 flex justify-between">
              {Array.from({ length: 7 }).map((_, i) => (
                <SkeletonBox key={i} width={20} height={12} animate={animate} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
