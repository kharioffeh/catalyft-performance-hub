
import React, { useState } from 'react';
import { InsightStrip } from '@/components/Analytics/InsightStrip';
import { MetricCarousel } from '@/components/Analytics/MetricCarousel';
import { AriaSpotlight } from '@/components/Analytics/AriaSpotlight';
import { ReadinessChart } from '@/components/ReadinessChart';
import { EnhancedSleepChart } from '@/components/EnhancedSleepChart';
import { EnhancedTrainingLoadChart } from '@/components/EnhancedTrainingLoadChart';
import { StressChart } from '@/components/Analytics/StressChart';
import { PeriodProvider, usePeriod, periodToDays } from '@/lib/hooks/usePeriod';
import { useEnhancedMetrics } from '@/hooks/useEnhancedMetrics';
import { useSleep } from '@/hooks/useSleep';
import { useStress } from '@/hooks/useStress';
import { useAuth } from '@/contexts/AuthContext';
import { ShareUIProvider } from '@/context/ShareUIContext';
import { ShareSheet } from '@/components/ShareSheet';
import { AnalyticsControls } from '@/components/Analytics/AnalyticsControls';
import { AnalyticsGrid } from '@/components/Analytics/AnalyticsGrid';
import { ARIAInputSection } from '@/components/Analytics/ARIAInputSection';
import { ConnectWearableModal } from '@/components/Analytics/ConnectWearableModal';
import { MuscleAnatomyPanel } from '@/components/Analytics/MuscleAnatomyPanel';
import { TonnageCard, E1RMCard, VelocityFatigueCard, MuscleLoadCard } from '@/components/Analytics/ChartCards';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';

const ARIA_SUGGESTIONS = [
  "How can I improve recovery this week?",
  "Summarise today's readiness drivers.",  
  "Which muscle groups are at highest risk?",
  "Suggest mobility drills before tomorrow's session.",
  "Detect any over-training trends in last 14 days.",
  "What factors are impacting sleep quality?",
  "Recommend training load adjustments.",
  "Analyze performance patterns this month."
] as const;

const SAMPLE_INSIGHTS = [
  "Sleep was slightly reduced last 3 days. Pay attention to recovery.",
  "Load ratio is within optimal range. No overtraining detected.",
  "Readiness increased 4% vs last week."
];

const AnalyticsPageContent: React.FC = () => {
  const [ariaInput, setAriaInput] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { period } = usePeriod();
  const { profile } = useAuth();

  // Convert period to days for existing hooks
  const periodDays = periodToDays(period);

  // Reuse readiness, sleep, load, stress hooks as specified
  const { readinessRolling, sleepDaily, loadACWR, latestStrain } = useEnhancedMetrics();
  const { 
    sessions: sleepSessions, 
    getSleepScore, 
    getAverageSleepHours 
  } = useSleep();
  const { data: stressData } = useStress();
  
  // Get analytics data for the new chart cards
  const { data: analyticsData, isLoading: analyticsLoading } = useAnalyticsData();
  
  console.log('Analytics: Data loaded -', { 
    readinessCount: readinessRolling.length, 
    sleepCount: sleepDaily.length, 
    loadCount: loadACWR.length,
    hasStrain: !!latestStrain,
    sleepSessionsCount: sleepSessions.length,
    stressLevel: stressData?.level
  });

  // Extract values for InsightStrip using the hooks
  const latestReadiness = readinessRolling[readinessRolling.length - 1]?.readiness_score ?? null;
  const latestSleepHours = getAverageSleepHours(1); // Get last night's sleep
  const latestACWR = loadACWR[loadACWR.length - 1]?.acwr_7_28 ?? null;
  const latestStrainValue = latestStrain?.value ?? null;
  const currentStress = stressData?.current ?? 45;
  
  const handleAriaPrompt = (suggestion: string) => {
    setAriaInput(suggestion);
    // Focus the textarea after state update
    setTimeout(() => {
      document.getElementById('aria-input')?.focus();
    }, 0);
  };
  
  // Placeholder send handler (integrate with POST /api/aria/insights logic)
  const sendInsight = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: POST to /api/aria/insights
    setAriaInput('');
  };

  // New handlers for empty state CTAs
  const handleConnectWearable = () => {
    setShowConnectModal(true);
  };

  const handleLogWorkout = () => {
    // TODO: Open workout logging dialog
    console.log('Log workout clicked');
  };

  // Use real data with fallback to mock data
  const readinessData = readinessRolling.length > 0 ? 
    readinessRolling.map(item => ({ date: item.day, score: item.readiness_score })) :
    [
      { date: '2024-01-01', score: 85 },
      { date: '2024-01-02', score: 78 },
      { date: '2024-01-03', score: 92 },
      { date: '2024-01-04', score: 88 },
      { date: '2024-01-05', score: 76 },
      { date: '2024-01-06', score: 84 },
      { date: '2024-01-07', score: 89 },
    ];

  const sleepData = sleepDaily.length > 0 ? sleepDaily : [
    {
      athlete_uuid: profile?.id || 'demo-user',
      day: '2024-01-01',
      total_sleep_hours: 7.5,
      sleep_efficiency: 85,
      avg_sleep_hr: 65,
      hrv_rmssd: 42
    },
    {
      athlete_uuid: profile?.id || 'demo-user',
      day: '2024-01-02',
      total_sleep_hours: 8.2,
      sleep_efficiency: 92,
      avg_sleep_hr: 62,
      hrv_rmssd: 45
    },
    {
      athlete_uuid: profile?.id || 'demo-user',
      day: '2024-01-03',
      total_sleep_hours: 6.8,
      sleep_efficiency: 78,
      avg_sleep_hr: 68,
      hrv_rmssd: 38
    },
  ];

  const loadData = loadACWR.length > 0 ? loadACWR : [
    {
      athlete_uuid: profile?.id || 'demo-user',
      day: '2024-01-01',
      daily_load: 450,
      acute_7d: 420,
      chronic_28d: 380,
      acwr_7_28: 1.1
    },
    {
      athlete_uuid: profile?.id || 'demo-user',
      day: '2024-01-02',
      daily_load: 520,
      acute_7d: 435,
      chronic_28d: 385,
      acwr_7_28: 1.13
    },
    {
      athlete_uuid: profile?.id || 'demo-user',
      day: '2024-01-03',
      daily_load: 380,
      acute_7d: 425,
      chronic_28d: 390,
      acwr_7_28: 1.09
    },
  ];
  
  return (
    <div className="min-h-screen bg-brand-charcoal">
      {/* Controls */}
      <AnalyticsControls />

      {/* Sticky Insight Strip */}
      <InsightStrip
        readiness={latestReadiness}
        sleepHours={latestSleepHours}
        stress={currentStress}
        strain={latestStrainValue}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Metric Carousel - Updated to include Stress */}
        <div className="mt-6">
          <MetricCarousel labels={['Readiness', 'Sleep', 'Load', 'Stress']}>
            <ReadinessChart 
              data={readinessData} 
              variant="carousel"
              onConnectWearable={handleConnectWearable}
            />
            <EnhancedSleepChart 
              data={sleepData} 
              variant="carousel"
              onConnectWearable={handleConnectWearable}
            />
            <EnhancedTrainingLoadChart 
              data={loadData} 
              variant="carousel"
              onLogWorkout={handleLogWorkout}
            />
            <StressChart
              variant="carousel"
              onConnectWearable={handleConnectWearable}
            />
          </MetricCarousel>
        </div>

        {/* Personal Training Analytics Chart Cards - Horizontal ScrollView */}
        <div className="space-y-4">
          <h2 className="text-xl font-display font-semibold text-slate-50">
            Personal Training Analytics
          </h2>
          
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex space-x-6 pb-4 min-w-max">
              <div className="w-96 flex-shrink-0">
                <TonnageCard data={analyticsData.tonnage} />
              </div>
              <div className="w-96 flex-shrink-0">
                <E1RMCard data={analyticsData.e1rmCurve} />
              </div>
              <div className="w-96 flex-shrink-0">
                <VelocityFatigueCard data={analyticsData.velocityFatigue} />
              </div>
              <div className="w-96 flex-shrink-0">
                <MuscleLoadCard 
                  data={analyticsData.muscleLoad} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* ARIA Spotlight - Contextual coaching overlay */}
        <AriaSpotlight />

        {/* Muscle Anatomy Panel with Training Load & ACWR Gauges */}
        <MuscleAnatomyPanel />

        {/* ARIA Input Section - Full width */}
        <ARIAInputSection
          ariaInput={ariaInput}
          onInputChange={setAriaInput}
          onSubmit={sendInsight}
        />
      </div>

      {/* Connect Wearable Modal */}
      <ConnectWearableModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
      />

      {/* ShareSheet for handling share functionality */}
      <ShareSheet />
    </div>
  );
};

const AnalyticsPage: React.FC = () => {
  return (
    <PeriodProvider>
      <ShareUIProvider>
        <AnalyticsPageContent />
      </ShareUIProvider>
    </PeriodProvider>
  );
};

export default AnalyticsPage;
