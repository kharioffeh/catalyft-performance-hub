
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MetricChart } from '@/components/Analytics/MetricChart';
import { ARIAInsight } from '@/components/Analytics/ARIAInsight';
import { DataTable } from '@/components/Analytics/DataTable';
import { useMetricData } from '@/hooks/useMetricData';

export default function ReadinessDetailPage() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const periodParam = Number(searchParams.get("period")) || 30;
  const [period, setPeriod] = useState<7 | 30 | 90>(
    periodParam === 7 ? 7 : periodParam === 90 ? 90 : 30
  );

  // Fetch detailed readiness data
  const { data, isLoading, error } = useMetricData("readiness", period);

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
          <p className="text-gray-500">Unable to load readiness data.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Readiness Analysis</h1>
          <p className="text-gray-600">Detailed readiness trends and contributing factors</p>
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
              { from: 0, to: 33, color: "#ef4444", label: "Low" },
              { from: 33, to: 67, color: "#f59e0b", label: "Moderate" },
              { from: 67, to: 100, color: "#10b981", label: "Optimal" }
            ]}
            xLabel="Date"
            yLabel="Readiness Score"
            className="absolute inset-0"
          />
        </div>
      </section>

      {/* Secondary Chart: HRV & Sleep Quality */}
      {data.secondary && data.secondary.length > 0 && (
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
      )}

      {/* Data Table: Daily Readiness Details */}
      <section className="card overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">Daily Readiness Details</h2>
        <p className="text-sm text-gray-600 mb-4">
          Detailed breakdown of daily readiness scores and contributing metrics
        </p>
        <DataTable
          columns={[
            { header: "Date", accessor: "day", type: "date" },
            { header: "Readiness Score", accessor: "score", type: "number" },
            { header: "7-Day Average", accessor: "avg_7d", type: "number" },
            { header: "30-Day Average", accessor: "avg_30d", type: "number" }
          ]}
          data={data.tableRows || []}
        />
      </section>

      {/* ARIA Insights */}
      <section className="card">
        <h2 className="text-lg font-semibold mb-2">Coach ARIA Readiness Insights</h2>
        <p className="text-sm text-gray-600 mb-4">
          AI-generated insights about your readiness trends
        </p>
        <ARIAInsight metric="readiness" period={period} />
      </section>
    </div>
  );
}
