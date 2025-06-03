
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface RiskBoardTableStatesProps {
  isLoading: boolean;
  hasData: boolean;
  error?: Error | null;
}

export const RiskBoardTableStates: React.FC<RiskBoardTableStatesProps> = ({
  isLoading,
  hasData,
  error,
}) => {
  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">⚠️ Error loading data</div>
        <p className="text-gray-600 text-sm">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          <p className="text-gray-600">Loading risk assessment...</p>
        </div>
        
        {/* Loading skeleton */}
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">👥</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Athletes Found</h3>
        <p className="text-gray-500 mb-4">
          Add athletes to your roster to see their risk assessment data here.
        </p>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
          Add Athletes
        </button>
      </div>
    );
  }

  return null;
};
