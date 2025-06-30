
import React from 'react';
import { MetricChart } from '@/components/Analytics/MetricChart';
import { KpiCard } from '@/components/ui/KpiCard';
import { Activity, TrendingUp, Calendar } from 'lucide-react';

interface TrendViewProps {
  data: any;
  period: number;
  isLoading: boolean;
}

export const TrendView: React.FC<TrendViewProps> = ({ data, period, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!data) return null;

  const latestScore = data.tableRows?.[0]?.score || 0;
  const avgScore = data.tableRows?.reduce((sum, row) => sum + (row.score || 0), 0) / (data.tableRows?.length || 1);

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Latest Score"
          value={`${Math.round(latestScore)}%`}
          icon={Activity}
          isLoading={isLoading}
        />
        <KpiCard
          title={`${period}d Average`}
          value={`${Math.round(avgScore)}%`}
          icon={TrendingUp}
          isLoading={isLoading}
        />
        <KpiCard
          title="Data Points"
          value={data.tableRows?.length || 0}
          icon={Calendar}
          isLoading={isLoading}
        />
      </div>

      {/* Hero Chart: Readiness Over Time */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-2">Readiness Score Trend</h2>
        <p className="text-sm text-gray-600 mb-4">
          Track your readiness score over the last {period} days with performance zones
        </p>
        <div className="relative w-full pb-[60%]">
          <MetricChart
            type="line"
            data={data.series || []}
            zones={[
              {
                from: 0,
                to: 33,
                color: "#ef4444",
                label: "Low"
              },
              {
                from: 33,
                to: 67,
                color: "#f59e0b",
                label: "Moderate"
              },
              {
                from: 67,
                to: 100,
                color: "#10b981",
                label: "Optimal"
              }
            ]}
            xLabel="Date"
            yLabel="Readiness Score"
            className="absolute inset-0"
          />
        </div>
      </section>
    </div>
  );
};
