
import React from 'react';
import { Button } from '@/components/ui/button';
import { PeriodSelector } from './PeriodSelector';
import { AthleteSelector } from './AthleteSelector';
import { Download, Filter, TrendingUp } from 'lucide-react';

interface AnalyticsHeaderProps {
  displayName: string;
  isHourlyView: boolean;
  period: 1 | 7 | 30 | 90;
  onPeriodChange: (period: 1 | 7 | 30 | 90) => void;
  selectedAthleteId: string;
  onAthleteChange: (athleteId: string) => void;
  isCoach: boolean;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({
  displayName,
  isHourlyView,
  period,
  onPeriodChange,
  selectedAthleteId,
  onAthleteChange,
  isCoach
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-100 rounded-lg">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
        </div>
        <p className="text-gray-600">
          {isCoach ? `Analyzing ${displayName}'s performance metrics` : 'Comprehensive performance insights and data trends'}
          {isHourlyView && " - 24 Hour View"}
        </p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <PeriodSelector period={period} onPeriodChange={onPeriodChange} />
        
        <AthleteSelector
          selectedAthleteId={selectedAthleteId}
          onAthleteChange={onAthleteChange}
        />
        
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};
