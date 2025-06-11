
import React from 'react';
import { MiniSpark } from './MiniSpark';
import { Activity, Moon, Dumbbell } from 'lucide-react';

interface AnalyticsMiniSparksProps {
  readinessData: any;
  sleepData: any;
  loadData: any;
  isHourlyView: boolean;
}

export const AnalyticsMiniSparks: React.FC<AnalyticsMiniSparksProps> = ({
  readinessData,
  sleepData,
  loadData,
  isHourlyView
}) => {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="relative">
        <div className="absolute top-3 left-3 z-10 p-1.5 bg-green-100 rounded-lg">
          <Activity className="w-4 h-4 text-green-600" />
        </div>
        <MiniSpark 
          data={readinessData?.series} 
          color="#10b981" 
          label={`Readiness Trend ${isHourlyView ? '(24h)' : ''}`} 
        />
      </div>
      <div className="relative">
        <div className="absolute top-3 left-3 z-10 p-1.5 bg-blue-100 rounded-lg">
          <Moon className="w-4 h-4 text-blue-600" />
        </div>
        <MiniSpark 
          data={sleepData?.series} 
          color="#3b82f6" 
          label={`Sleep Hours Trend ${isHourlyView ? '(24h)' : ''}`} 
        />
      </div>
      <div className="relative">
        <div className="absolute top-3 left-3 z-10 p-1.5 bg-purple-100 rounded-lg">
          <Dumbbell className="w-4 h-4 text-purple-600" />
        </div>
        <MiniSpark 
          data={loadData?.series} 
          color="#8b5cf6" 
          label={`Training Load Trend ${isHourlyView ? '(24h)' : ''}`} 
        />
      </div>
    </div>
  );
};
