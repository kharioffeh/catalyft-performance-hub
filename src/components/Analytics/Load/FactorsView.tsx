
import React from 'react';
import { MetricChart } from '@/components/Analytics/MetricChart';

interface FactorsViewProps {
  data: any;
  period: number;
  isLoading: boolean;
}

export const FactorsView: React.FC<FactorsViewProps> = ({ data, period, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!data?.secondary) return null;

  return (
    <div className="space-y-6">
      {/* Secondary Chart: Acute vs Chronic Load */}
      <section className="card">
        <h2 className="text-lg font-display font-semibold mb-2">Acute vs Chronic Load</h2>
        <p className="text-sm text-gray-600 mb-4">
          Comparison of 7-day acute load vs 28-day chronic load
        </p>
        <div className="relative w-full pb-[60%]">
          <MetricChart
            type="bar"
            data={data.secondary.map(point => ({ 
              x: point.x, 
              y: 0, 
              acute: point.acute, 
              chronic: point.chronic 
            }))}
            multiSeries={true}
            xLabel="Date"
            yLabel="Load"
            className="absolute inset-0"
          />
        </div>
      </section>
    </div>
  );
};
