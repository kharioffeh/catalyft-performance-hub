
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MetricChart } from '@/components/Analytics/MetricChart';
import { ARIAInsight } from '@/components/Analytics/ARIAInsight';
import { DataTable } from '@/components/Analytics/DataTable';
import { useMetricData } from '@/hooks/useMetricData';

export default function SleepDetailPage() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const periodParam = Number(searchParams.get("period")) || 30;
  const [period, setPeriod] = useState<7 | 30 | 90>(
    periodParam === 7 ? 7 : periodParam === 90 ? 90 : 30
  );

  // Fetch detailed sleep data
  const { data, isLoading, error } = useMetricData("sleep", period);

  // Handler to change period and update URL
  const changePeriod = (p: 7 | 30 | 90) => {
    setPeriod(p);
    setSearchParams({ period: String(p) });
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="text-center">
          <p className="text-gray-500">Unable to load sleep data.</p>
          <p className="text-sm text-gray-400 mt-2">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sleep Analysis</h1>
          <p className="text-gray-600">Detailed sleep patterns and quality metrics</p>
        </div>
        
        {/* Period selector */}
        <div className="flex space-x-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              className={`px-3 py-1 rounded ${
                period === d ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => changePeriod(d as 7 | 30 | 90)}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Hero Chart: Sleep Stages Over Time */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-2">Sleep Stages Over Time</h2>
        <p className="text-sm text-gray-600 mb-4">
          Breakdown of sleep stages over the last {period} days
        </p>
        <div className="relative w-full pb-[60%]">
          <MetricChart
            type="bar"
            data={data.series || []}
            stacked={true}
            xLabel="Date"
            yLabel="Hours"
            className="absolute inset-0"
          />
        </div>
      </section>

      {/* Sleep Consistency Chart */}
      {data.scatter && data.scatter.length > 0 && (
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
      )}

      {/* Data Table: Daily Sleep Details */}
      <section className="card overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Daily Sleep Details</h2>
        <p className="text-sm text-gray-600 mb-4">
          Detailed breakdown of daily sleep metrics and stages
        </p>
        <DataTable
          columns={[
            { header: "Date", accessor: "day", type: "date" },
            { header: "Total Hours", accessor: "total_sleep_hours", type: "number" },
            { header: "Avg HR", accessor: "avg_hr", type: "number" },
            { header: "Deep (min)", accessor: "deep_minutes", type: "number" },
            { header: "Light (min)", accessor: "light_minutes", type: "number" },
            { header: "REM (min)", accessor: "rem_minutes", type: "number" }
          ]}
          data={data.tableRows || []}
        />
      </section>

      {/* ARIA Insights */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-2">Coach ARIA Sleep Insights</h2>
        <p className="text-sm text-gray-600 mb-4">
          AI-generated insights about your sleep patterns and quality
        </p>
        <ARIAInsight metric="sleep" period={period} />
      </section>
    </div>
  );
}
