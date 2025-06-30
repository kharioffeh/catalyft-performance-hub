
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
      {/* Secondary Chart: HRV & Sleep Quality */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-2">Contributing Factors</h2>
        <p className="text-sm text-gray-600 mb-4">
          HRV and sleep quality metrics that influence readiness
        </p>
        <div className="relative w-full pb-[60%]">
          <MetricChart
            type="bar"
            data={data.secondary.map(point => ({
              x: point.x,
              y: 0,
              hrv: point.hrv,
              sleep: point.sleep
            }))}
            xLabel="Date"
            yLabel="Value"
            multiSeries={true}
            className="absolute inset-0"
          />
        </div>
      </section>
    </div>
  );
};
