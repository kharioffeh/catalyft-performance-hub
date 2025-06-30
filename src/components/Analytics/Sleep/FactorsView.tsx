
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

  if (!data?.scatter) return null;

  return (
    <div className="space-y-6">
      {/* Sleep Consistency Chart */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-2">Sleep Consistency</h2>
        <p className="text-sm text-gray-600 mb-4">
          Bedtime vs wake time consistency pattern
        </p>
        <div className="relative w-full pb-[60%]">
          <MetricChart
            type="scatter"
            data={data.scatter.map(point => ({ x: point.x.toString(), y: point.y }))}
            xLabel="Bedtime"
            yLabel="Wake Time"
            className="absolute inset-0"
          />
        </div>
      </section>
    </div>
  );
};
