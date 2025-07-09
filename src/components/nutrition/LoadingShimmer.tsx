import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingShimmerProps {
  className?: string;
}

export const LoadingShimmer: React.FC<LoadingShimmerProps> = ({ className }) => {
  return (
    <div className={cn("animate-pulse space-y-4", className)}>
      {/* Header shimmer */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
        <div className="w-32 h-6 bg-white/10 rounded"></div>
        <div className="ml-auto w-20 h-5 bg-white/10 rounded"></div>
      </div>

      {/* Food items shimmer */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <div className="w-40 h-5 bg-white/10 rounded mb-2"></div>
                <div className="w-24 h-4 bg-white/10 rounded"></div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-8 bg-white/10 rounded"></div>
                <div className="w-8 h-8 bg-white/10 rounded"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-white/10 rounded"></div>
                <div className="w-12 h-6 bg-white/10 rounded"></div>
                <div className="w-8 h-8 bg-white/10 rounded"></div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-4 bg-white/10 rounded"></div>
                <div className="w-12 h-4 bg-white/10 rounded"></div>
                <div className="w-12 h-4 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totals card shimmer */}
      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="w-24 h-6 bg-white/10 rounded mb-3"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="text-center">
              <div className="w-16 h-8 bg-white/10 rounded mx-auto mb-2"></div>
              <div className="w-12 h-4 bg-white/10 rounded mx-auto"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Button shimmer */}
      <div className="w-full h-12 bg-white/10 rounded-lg"></div>
    </div>
  );
};