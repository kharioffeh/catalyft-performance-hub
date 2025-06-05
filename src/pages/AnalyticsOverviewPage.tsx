
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MetricCard } from '@/components/Analytics/MetricCard';
import { MiniSpark } from '@/components/Analytics/MiniSpark';
import { ARIAInsight } from '@/components/Analytics/ARIAInsight';
import { useMetricData } from '@/hooks/useMetricData';

export default function AnalyticsOverviewPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<7 | 30 | 90>(7);

  // Fetch aggregated data for overview KPIs and sparks
  const { data: readiness } = useMetricData("readiness", period);
  const { data: sleep } = useMetricData("sleep", period);
  const { data: load } = useMetricData("load", period);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
          <p className="text-gray-600">Key performance indicators and insights</p>
        </div>
        
        {/* Period selector */}
        <div className="flex space-x-2">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              className={`px-3 py-1 rounded ${
                period === d ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
              }`}
              onClick={() => setPeriod(d as 7 | 30 | 90)}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {/* Row 1: KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Readiness"
          latest={readiness?.latestScore}
          delta={readiness?.delta7d}
          onClick={() => navigate('/analytics/readiness')}
        />
        <MetricCard
          title="Sleep Hours"
          latest={sleep?.avgHours}
          delta={sleep?.delta7d}
          onClick={() => navigate('/analytics/detailed')}
        />
        <MetricCard
          title="ACWR"
          latest={load?.latestAcwr}
          delta={load?.delta7d}
          onClick={() => navigate('/analytics/detailed')}
        />
      </div>

      {/* Row 2: Mini sparklines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MiniSpark data={readiness?.series} color="#10B981" label="Readiness Trend" />
        <MiniSpark data={sleep?.series} color="#3B82F6" label="Sleep Trend" />
        <MiniSpark data={load?.series} color="#8B5CF6" label="Load Trend" />
      </div>

      {/* Row 3: ARIA summary */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Coach ARIA Insights</h2>
        <ARIAInsight metric="overview" period={period} />
      </div>
    </div>
  );
}
