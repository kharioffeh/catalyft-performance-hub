
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassSkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animate?: boolean;
}

export const GlassSkeleton: React.FC<GlassSkeletonProps> = ({
  className,
  rounded = 'md',
  animate = true,
  ...props
}) => {
  const roundedClass = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={cn(
        'bg-white/5 backdrop-blur-sm border border-white/10',
        roundedClass,
        animate && 'animate-pulse',
        'relative overflow-hidden',
        className
      )}
      {...props}
    >
      {animate && (
        <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      )}
    </div>
  );
};

// Preset skeleton components for common use cases
export const GlassSkeletonCard: React.FC<{ className?: string }> = ({ className }) => (
  <GlassSkeleton className={cn('h-32 w-full', className)} rounded="xl" />
);

export const GlassSkeletonText: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <GlassSkeleton
        key={i}
        className={cn(
          'h-4',
          i === lines - 1 ? 'w-3/4' : 'w-full'
        )}
        rounded="sm"
      />
    ))}
  </div>
);

export const GlassSkeletonAvatar: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ 
  size = 'md', 
  className 
}) => {
  const sizeClass = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  }[size];

  return (
    <GlassSkeleton className={cn(sizeClass, className)} rounded="full" />
  );
};
