
import React from 'react';

interface RiskBoardTableStatesProps {
  isLoading: boolean;
  hasData: boolean;
}

export const RiskBoardTableStates: React.FC<RiskBoardTableStatesProps> = ({
  isLoading,
  hasData,
}) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading risk assessment...</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="text-center py-8 text-gray-500">
        No athletes found. Add athletes to see their risk assessment.
      </div>
    );
  }

  return null;
};
