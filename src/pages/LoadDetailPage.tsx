import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { MetricChart } from '@/components/Analytics/MetricChart';
import { ARIAInsight } from '@/components/Analytics/ARIAInsight';
import { DataTable } from '@/components/Analytics/DataTable';
import { InsightStrip } from '@/components/Analytics/InsightStrip';
import { useMetricData } from '@/hooks/useMetricData';
import { useEnhancedMetricsWithAthlete } from '@/hooks/useEnhancedMetricsWithAthlete';

export default function LoadDetailPage() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const periodParam = Number(searchParams.get("period")) || 30;
  const [period, setPeriod] = useState<7 | 30 | 90>(
    periodParam === 7 ? 7 : periodParam === 90 ? 90 : 30
  );

  // Fetch detailed load data
  const { data, isLoading, error } = useMetricData("load", period);

  // Get enhanced metrics for InsightStrip
  const { readinessRolling, sleepDaily, loadACWR, latestStrain } = useEnhancedMetricsWithAthlete(profile?.id);

  // Extract values for InsightStrip
  const latestReadiness = readinessRolling[readinessRolling.length - 1]?.readiness_score ?? null;
  const latestSleepHours = sleepDaily[sleepDaily.length - 1]?.total_sleep_hours ?? null;
  const latestACWR = loadACWR[loadACWR.length - 1]?.acwr_7_28 ?? null;
  const latestStrainValue = latestStrain?.value ?? null;

  // Handler to change period and update URL
  const changePeriod = (p: 7 | 30 | 90) => {
    setPeriod(p);
    setSearchParams({ period: String(p) });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <InsightStrip
          readiness={latestReadiness}
          sleepHours={latestSleepHours}
          acwr={latestACWR}
          strain={latestStrainValue}
        />
        <div className="p-6 max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-48 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <InsightStrip
          readiness={latestReadiness}
          sleepHours={latestSleepHours}
          acwr={latestACWR}
          strain={latestStrainValue}
        />
        <div className="p-6 max-w-5xl mx-auto">
          <div className="text-center">
            <p className="text-gray-500">Unable to load training load data.</p>
            <p className="text-sm text-gray-400 mt-2">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sticky Insight Strip */}
      <InsightStrip
        readiness={latestReadiness}
        sleepHours={latestSleepHours}
        acwr={latestACWR}
        strain={latestStrainValue}
      />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training Load Analysis</h1>
            <p className="text-gray-600">Detailed training load trends and ACWR monitoring</p>
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

        {/* Secondary Chart: Acute vs Chronic Load */}
        {data.secondary && data.secondary.length > 0 && (
          <section className="card">
            <h2 className="text-lg font-semibold mb-2">Acute vs Chronic Load</h2>
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
        )}

        {/* Data Table: Daily Load Details */}
        <section className="card overflow-x-auto">
          <h2 className="text-lg font-semibold mb-2">Daily Load Details</h2>
          <p className="text-sm text-gray-600 mb-4">
            Detailed breakdown of daily training load and calculated metrics
          </p>
          <DataTable
            columns={[
              { header: "Date", accessor: "day", type: "date" },
              { header: "Daily Load", accessor: "daily_load", type: "number" },
              { header: "Acute (7d)", accessor: "acute_7d", type: "number" },
              { header: "Chronic (28d)", accessor: "chronic_28d", type: "number" },
              { header: "ACWR", accessor: "acwr_7_28", type: "number" }
            ]}
            data={data.tableRows || []}
          />
        </section>

        {/* ARIA Insights */}
        <section className="card">
          <h2 className="text-lg font-semibold mb-2">Coach ARIA Load Insights</h2>
          <p className="text-sm text-gray-600 mb-4">
            AI-generated insights about your training load and injury risk
          </p>
          <ARIAInsight metric="load" period={period} />
        </section>
      </div>
    </div>
  );
}
