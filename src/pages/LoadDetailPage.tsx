
import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { InsightStrip } from '@/components/Analytics/InsightStrip';
import { SegmentedControl } from '@/components/Analytics/SegmentedControl';
import { AnalyticsHeroSection } from '@/components/Analytics/AnalyticsHeroSection';
import { useMetricData } from '@/hooks/useMetricData';
import { useEnhancedMetricsWithAthlete } from '@/hooks/useEnhancedMetricsWithAthlete';
import { Dumbbell } from 'lucide-react';

// Lazy load segment components
const TrendView = React.lazy(() => import('@/components/Analytics/Load/TrendView').then(module => ({ default: module.TrendView })));
const FactorsView = React.lazy(() => import('@/components/Analytics/Load/FactorsView').then(module => ({ default: module.FactorsView })));
const TableView = React.lazy(() => import('@/components/Analytics/Load/TableView').then(module => ({ default: module.TableView })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function LoadDetailPage() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const periodParam = Number(searchParams.get("period")) || 30;
  const segmentParam = searchParams.get("segment") || "trend";
  const [period, setPeriod] = useState<7 | 30 | 90>(
    periodParam === 7 ? 7 : periodParam === 90 ? 90 : 30
  );
  const [activeSegment, setActiveSegment] = useState(segmentParam);

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
    setSearchParams({ period: String(p), segment: activeSegment });
  };

  // Get current load and ACWR score
  const currentLoad = loadACWR[loadACWR.length - 1]?.acwr_7_28 || null;
  const getScoreColor = (acwr: number | null) => {
    if (!acwr) return '#6b7280';
    if (acwr >= 0.8 && acwr <= 1.3) return '#10b981'; // Green - Optimal
    if (acwr <= 1.5) return '#f59e0b'; // Yellow - Caution
    return '#ef4444'; // Red - High risk
  };

  // Generate 7-day sparkline data for ACWR
  const sparklineData = loadACWR.slice(-7).map(item => ({ 
    value: item.acwr_7_28 || 0 
  }));

  // Calculate trend
  const getTrend = () => {
    if (sparklineData.length < 2) return 'stable';
    const first = sparklineData[0].value;
    const last = sparklineData[sparklineData.length - 1].value;
    if (last > first) return 'up';
    if (last < first) return 'down';
    return 'stable';
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
        stress={45}
        strain={latestStrainValue}
      />

      <div className="px-3 py-4 sm:px-6 sm:py-6 max-w-sm sm:max-w-md lg:max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <AnalyticsHeroSection
          icon={Dumbbell}
          title="Training Load Analysis"
          description="Detailed training load trends and ACWR monitoring"
          currentScore={currentLoad}
          scoreUnit=""
          scoreColor={getScoreColor(currentLoad)}
          sparklineData={sparklineData}
          trend={getTrend()}
          period={period}
          onPeriodChange={changePeriod}
        />

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
