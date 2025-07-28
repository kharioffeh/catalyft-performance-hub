import React, { useState } from 'react';
import { useSleep } from '@/hooks/useSleep';
import { SleepScoreCard } from '@/components/sleep/SleepScoreCard';
import { Hypnogram } from '@/components/sleep/Hypnogram';
import { PeriodProvider } from '@/lib/hooks/usePeriod';
import { InsightStrip } from '@/components/Analytics/InsightStrip';
import { AnalyticsHeroSection } from '@/components/Analytics/AnalyticsHeroSection';
import { SegmentedControl } from '@/components/Analytics/SegmentedControl';
import { useEnhancedMetrics } from '@/hooks/useEnhancedMetrics';
import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft, Moon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const SleepContent: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const periodParam = Number(searchParams.get("period")) || 30;
  const segmentParam = searchParams.get("segment") || "overview";
  const [period, setPeriod] = useState<7 | 30 | 90>(
    periodParam === 7 ? 7 : periodParam === 90 ? 90 : 30
  );
  const [activeSegment, setActiveSegment] = useState(segmentParam);

  const { 
    getLastNightSleep, 
    getSleepScore, 
    getAverageSleepHours,
    isLoading 
  } = useSleep();

  const lastNightSleep = getLastNightSleep();
  const sleepScore = getSleepScore();
  const avgSleepHours = getAverageSleepHours();

  // Get enhanced metrics for InsightStrip
  const { readinessRolling, sleepDaily, loadACWR, latestStrain } = useEnhancedMetrics();

  // Extract values for InsightStrip
  const latestReadiness = readinessRolling[readinessRolling.length - 1]?.readiness_score ?? null;
  const latestSleepHours = sleepDaily[sleepDaily.length - 1]?.total_sleep_hours ?? null;
  const latestStress = 45; // Mock stress value for now
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

  // Get current sleep efficiency score
  const currentScore = lastNightSleep?.sleepEfficiency || sleepScore;
  const getScoreColor = (score: number | null) => {
    if (!score) return '#6b7280';
    if (score >= 85) return '#10b981'; // Green - Excellent
    if (score >= 70) return '#f59e0b'; // Yellow - Good
    return '#ef4444'; // Red - Poor
  };

  // Generate 7-day sparkline data from sleep daily data
  const sparklineData = sleepDaily.slice(-7).map(item => ({ 
    value: item.sleep_efficiency || 0 
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-charcoal flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-charcoal">
      {/* Sticky Insight Strip */}
      <InsightStrip
        readiness={latestReadiness}
        sleepHours={latestSleepHours}
        stress={latestStress}
        strain={latestStrainValue}
      />
      
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Page Header with Back Navigation */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/analytics')}
            className="flex items-center space-x-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Analytics</span>
          </button>
        </div>
        
        {/* Hero Section */}
        <AnalyticsHeroSection
          icon={Moon}
          title="Your Sleep Analysis"
          description="Track your sleep quality and understand your nightly patterns"
          currentScore={currentScore}
          scoreUnit="%"
          scoreColor={getScoreColor(currentScore)}
          sparklineData={sparklineData}
          trend={getTrend()}
          period={period}
          onPeriodChange={changePeriod}
        />

        {/* Segmented Control */}
        <SegmentedControl
          segments={['Overview', 'Trends', 'Analysis']}
          activeSegment={activeSegment}
          onSegmentChange={changeSegment}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sleep Score Card */}
          <SleepScoreCard
            score={sleepScore}
            previousScore={lastNightSleep ? 85 : 0} // Mock previous score
            sleepHours={lastNightSleep?.totalSleepHours || avgSleepHours}
            efficiency={lastNightSleep?.sleepEfficiency || 85}
            className="lg:col-span-1"
          />

          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
            {/* Average Sleep */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-2">
                  {avgSleepHours}<span className="text-lg text-white/60">h</span>
                </div>
                <div className="text-sm text-white/70">7-Day Average</div>
                <div className="text-xs text-white/50 mt-1">
                  Target: 7-9 hours
                </div>
              </div>
            </div>

            {/* Sleep Consistency */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {lastNightSleep?.sleepEfficiency || 85}<span className="text-lg text-white/60">%</span>
                </div>
                <div className="text-sm text-white/70">Sleep Efficiency</div>
                <div className="text-xs text-white/50 mt-1">
                  Target: &gt;85%
                </div>
              </div>
            </div>

            {/* Heart Rate */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">
                  {lastNightSleep?.heartRate.avg || 58}<span className="text-lg text-white/60">bpm</span>
                </div>
                <div className="text-sm text-white/70">Avg Heart Rate</div>
                <div className="text-xs text-white/50 mt-1">
                  Range: {lastNightSleep?.heartRate.min || 45}-{lastNightSleep?.heartRate.max || 75} bpm
                </div>
              </div>
            </div>

            {/* Sleep Time */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-2">
                  {lastNightSleep?.bedtime || '22:30'}
                </div>
                <div className="text-sm text-white/70">Bedtime</div>
                <div className="text-xs text-white/50 mt-1">
                  Wake: {lastNightSleep?.wakeTime || '07:00'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hypnogram */}
        {lastNightSleep && (
          <Hypnogram 
            stages={lastNightSleep.stages}
            className="animate-fade-in"
          />
        )}

        {/* No Data State */}
        {!lastNightSleep && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🌙</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Sleep Data</h3>
            <p className="text-white/60">
              Connect a wearable device to start tracking your sleep patterns
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function Sleep() {
  return (
    <PeriodProvider>
      <SleepContent />
    </PeriodProvider>
  );
}