
import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { InsightStrip } from '@/components/Analytics/InsightStrip';
import { SegmentedControl } from '@/components/Analytics/SegmentedControl';
import { useMetricData } from '@/hooks/useMetricData';
import { useEnhancedMetricsWithAthlete } from '@/hooks/useEnhancedMetricsWithAthlete';

// Lazy load segment components
const TrendView = React.lazy(() => import('@/components/Analytics/Readiness/TrendView').then(module => ({ default: module.TrendView })));
const FactorsView = React.lazy(() => import('@/components/Analytics/Readiness/FactorsView').then(module => ({ default: module.FactorsView })));
const TableView = React.lazy(() => import('@/components/Analytics/Readiness/TableView').then(module => ({ default: module.TableView })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function ReadinessDetailPage() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const periodParam = Number(searchParams.get("period")) || 30;
  const segmentParam = searchParams.get("segment") || "trend";
  const [period, setPeriod] = useState<7 | 30 | 90>(
    periodParam === 7 ? 7 : periodParam === 90 ? 90 : 30
  );
  const [activeSegment, setActiveSegment] = useState(segmentParam);

  // Fetch data only for active segment
  const { data, isLoading, error } = useMetricData("readiness", period);

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
    setSearchParams({ period: String(p), segment: activeSegment });
  };

  // Handler to change segment
  const changeSegment = (segment: string) => {
    setActiveSegment(segment);
    setSearchParams({ period: String(period), segment });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <InsightStrip
          readiness={latestReadiness}
          sleepHours={latestSleepHours}
          stress={45}
          strain={latestStrainValue}
        />
        <div className="p-6 max-w-5xl mx-auto">
          <div className="text-center">
            <p className="text-gray-500">Unable to load readiness data.</p>
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
        stress={45}
        strain={latestStrainValue}
      />

      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50">Readiness Analysis</h1>
            <p className="text-slate-50">Detailed readiness trends and contributing factors</p>
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

        {/* Segmented Control */}
        <SegmentedControl
          segments={['Trend', 'Factors', 'Table']}
          activeSegment={activeSegment}
          onSegmentChange={changeSegment}
        />

        {/* Segment Content */}
        <Suspense fallback={<LoadingFallback />}>
          {activeSegment === 'trend' && (
            <TrendView data={data} period={period} isLoading={isLoading} />
          )}
          {activeSegment === 'factors' && (
            <FactorsView data={data} period={period} isLoading={isLoading} />
          )}
          {activeSegment === 'table' && (
            <TableView data={data} period={period} isLoading={isLoading} />
          )}
        </Suspense>
      </div>
    </div>
  );
}
