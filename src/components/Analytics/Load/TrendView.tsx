
import React from 'react';
import { MetricChart } from '@/components/Analytics/MetricChart';

interface TrendViewProps {
  data: any;
  period: number;
  isLoading: boolean;
}

export const TrendView: React.FC<TrendViewProps> = ({ data, period, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Hero Chart: ACWR Over Time */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-2">ACWR (Acute:Chronic Workload Ratio)</h2>
        <p className="text-sm text-gray-600 mb-4">
          Track your training load ratio over the last {period} days with risk zones
        </p>
        <div className="relative w-full pb-[60%]">
          <MetricChart
            type="line"
            data={data.series || []}
            zones={data.zones}
            xLabel="Date"
            yLabel="ACWR"
            className="absolute inset-0"
          />
        </div>
      </section>
    </div>
  );
};
