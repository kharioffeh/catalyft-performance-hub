
import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const RiskBoardEmptyState: React.FC = () => {
  const navigate = useNavigate();

  const handleAddAthlete = () => {
    navigate('/athletes');
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="mb-6">
        <ShieldAlert className="w-20 h-20 text-gray-300 mx-auto mb-4" />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">
        No athletes yet
      </h3>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm">
        Add your first athlete to start monitoring their risk assessment and performance metrics.
      </p>
      
      <Button
        onClick={handleAddAthlete}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
      >
        Add first athlete
      </Button>
    </div>
  );
};
