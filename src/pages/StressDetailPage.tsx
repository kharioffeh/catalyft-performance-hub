import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { InsightStrip } from '@/components/Analytics/InsightStrip';
import { SegmentedControl } from '@/components/Analytics/SegmentedControl';
import { AnalyticsHeroSection } from '@/components/Analytics/AnalyticsHeroSection';
import { useStress } from '@/hooks/useStress';
import { useEnhancedMetrics } from '@/hooks/useEnhancedMetrics';
import { Brain } from 'lucide-react';

// Lazy load segment components for stress analysis
const StressTrendView = React.lazy(() => import('@/components/Analytics/Stress/TrendView').then(module => ({ default: module.TrendView })));
const StressFactorsView = React.lazy(() => import('@/components/Analytics/Stress/FactorsView').then(module => ({ default: module.FactorsView })));
const StressTableView = React.lazy(() => import('@/components/Analytics/Stress/TableView').then(module => ({ default: module.TableView })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

export default function StressDetailPage() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const periodParam = Number(searchParams.get("period")) || 30;
  const segmentParam = searchParams.get("segment") || "trend";
  const [period, setPeriod] = useState<7 | 30 | 90>(
    periodParam === 7 ? 7 : periodParam === 90 ? 90 : 30
  );
  const [activeSegment, setActiveSegment] = useState(segmentParam);

  // Fetch stress data
  const { data: stressData, isLoading, error } = useStress();

  // Get enhanced metrics for InsightStrip
  const { readinessRolling, sleepDaily, loadACWR, latestStrain } = useEnhancedMetrics();

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

  // Get current stress score and color
  const currentScore = stressData?.current || null;
  const getScoreColor = (score: number | null) => {
    if (!score) return '#6b7280';
    if (score <= 30) return '#10b981'; // Green - Low stress
    if (score <= 60) return '#f59e0b'; // Yellow - Moderate stress
    return '#ef4444'; // Red - High stress
  };

  // Generate 7-day sparkline data (mock for now - replace with actual data)
  const sparklineData = Array.from({ length: 7 }, (_, i) => ({ 
    value: Math.random() * 100 
  }));

  // Calculate trend (mock for now)
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

  if (error || !stressData) {
    return (
      <div className="min-h-screen bg-brand-charcoal">
        <InsightStrip
          readiness={latestReadiness}
          sleepHours={latestSleepHours}
          stress={stressData?.current || 45}
          strain={latestStrainValue}
        />
        <div className="p-6 max-w-5xl mx-auto">
          <div className="text-center">
            <p className="text-gray-500">Unable to load stress data.</p>
            <p className="text-sm text-gray-400 mt-2">Please try refreshing the page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-charcoal">
      {/* Sticky Insight Strip */}
      <InsightStrip
        readiness={latestReadiness}
        sleepHours={latestSleepHours}
        stress={stressData.current}
        strain={latestStrainValue}
      />

      <div className="px-3 py-4 sm:px-6 sm:py-6 max-w-sm sm:max-w-md lg:max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <AnalyticsHeroSection
          icon={Brain}
          title="Stress Analysis" 
          description="Monitor daily stress patterns and recovery insights"
          currentScore={currentScore}
          scoreColor={getScoreColor(currentScore)}
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
            <StressTrendView data={stressData} period={period} isLoading={isLoading} />
          )}
          {activeSegment === 'factors' && (
            <StressFactorsView data={stressData} period={period} isLoading={isLoading} />
          )}
          {activeSegment === 'table' && (
            <StressTableView data={stressData} period={period} isLoading={isLoading} />
          )}
        </Suspense>
      </div>
    </div>
  );
}