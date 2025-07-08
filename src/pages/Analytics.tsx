
import React, { useState } from 'react';
import { InsightStrip } from '@/components/Analytics/InsightStrip';
import { MetricCarousel } from '@/components/Analytics/MetricCarousel';
import { AriaSpotlight } from '@/components/Analytics/AriaSpotlight';
import { ReadinessChart } from '@/components/ReadinessChart';
import { EnhancedSleepChart } from '@/components/EnhancedSleepChart';
import { EnhancedTrainingLoadChart } from '@/components/EnhancedTrainingLoadChart';
import { StressChart } from '@/components/Analytics/StressChart';
import { PeriodProvider, usePeriod, periodToDays } from '@/lib/hooks/usePeriod';
import { useEnhancedMetricsWithAthlete } from '@/hooks/useEnhancedMetricsWithAthlete';
import { ShareUIProvider } from '@/context/ShareUIContext';
import { ShareSheet } from '@/components/ShareSheet';
import { AnalyticsControls } from '@/components/Analytics/AnalyticsControls';
import { AnalyticsGrid } from '@/components/Analytics/AnalyticsGrid';
import { ARIAInputSection } from '@/components/Analytics/ARIAInputSection';
import { ConnectWearableModal } from '@/components/Analytics/ConnectWearableModal';
import { MuscleAnatomyPanel } from '@/components/Analytics/MuscleAnatomyPanel';

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
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [ariaInput, setAriaInput] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { period } = usePeriod();

  // Convert period to days for existing hooks
  const periodDays = periodToDays(period);

  // Get enhanced metrics for the selected athlete
  const { readinessRolling, sleepDaily, loadACWR, latestStrain } = useEnhancedMetricsWithAthlete(selectedAthleteId);

  // Extract values for InsightStrip
  const latestReadiness = readinessRolling[readinessRolling.length - 1]?.readiness_score ?? null;
  const latestSleepHours = sleepDaily[sleepDaily.length - 1]?.total_sleep_hours ?? null;
  const latestACWR = loadACWR[loadACWR.length - 1]?.acwr_7_28 ?? null;
  const latestStrainValue = latestStrain?.value ?? null;
  
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

  // Mock data for charts - in real app, these would come from hooks
  const mockReadinessData = [
    { date: '2024-01-01', score: 85 },
    { date: '2024-01-02', score: 78 },
    { date: '2024-01-03', score: 92 },
    { date: '2024-01-04', score: 88 },
    { date: '2024-01-05', score: 76 },
    { date: '2024-01-06', score: 84 },
    { date: '2024-01-07', score: 89 },
  ];

  const mockSleepData = [
    {
      athlete_uuid: '1',
      day: '2024-01-01',
      total_sleep_hours: 7.5,
      sleep_efficiency: 85,
      avg_sleep_hr: 65,
      hrv_rmssd: 42
    },
    {
      athlete_uuid: '1',
      day: '2024-01-02',
      total_sleep_hours: 8.2,
      sleep_efficiency: 92,
      avg_sleep_hr: 62,
      hrv_rmssd: 45
    },
    {
      athlete_uuid: '1',
      day: '2024-01-03',
      total_sleep_hours: 6.8,
      sleep_efficiency: 78,
      avg_sleep_hr: 68,
      hrv_rmssd: 38
    },
  ];

  const mockLoadData = [
    {
      athlete_uuid: '1',
      day: '2024-01-01',
      daily_load: 450,
      acute_7d: 420,
      chronic_28d: 380,
      acwr_7_28: 1.1
    },
    {
      athlete_uuid: '1',
      day: '2024-01-02',
      daily_load: 520,
      acute_7d: 435,
      chronic_28d: 385,
      acwr_7_28: 1.13
    },
    {
      athlete_uuid: '1',
      day: '2024-01-03',
      daily_load: 380,
      acute_7d: 425,
      chronic_28d: 390,
      acwr_7_28: 1.09
    },
  ];
  
  return (
    <div className="min-h-screen bg-base">
      {/* Controls */}
      <AnalyticsControls
        selectedAthleteId={selectedAthleteId}
        onAthleteChange={setSelectedAthleteId}
      />

      {/* Sticky Insight Strip */}
      <InsightStrip
        readiness={latestReadiness}
        sleepHours={latestSleepHours}
        stress={45}
        strain={latestStrainValue}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Metric Carousel - Updated to include Stress */}
        <div className="mt-6">
          <MetricCarousel labels={['Readiness', 'Sleep', 'Load', 'Stress']}>
            <ReadinessChart 
              data={mockReadinessData} 
              variant="carousel"
              onConnectWearable={handleConnectWearable}
            />
            <EnhancedSleepChart 
              data={mockSleepData} 
              variant="carousel"
              onConnectWearable={handleConnectWearable}
            />
            <EnhancedTrainingLoadChart 
              data={mockLoadData} 
              variant="carousel"
              onLogWorkout={handleLogWorkout}
            />
            <StressChart
              variant="carousel"
              onConnectWearable={handleConnectWearable}
            />
          </MetricCarousel>
        </div>

        {/* ARIA Spotlight - Contextual coaching overlay */}
        <AriaSpotlight />

        {/* Muscle Anatomy Panel with Training Load & ACWR Gauges */}
        <MuscleAnatomyPanel selectedAthleteId={selectedAthleteId} />

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
