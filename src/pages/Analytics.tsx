
import React, { useState } from 'react';
import GlassCard from '@/components/ui/GlassCard';
import { KpiCard } from '@/components/ui/KpiCard';
import { HeatMapBody } from '@/components/Analytics/Glass/HeatMapBody';
import { ACWRDial } from '@/components/Analytics/Glass/ACWRDial';
import { AthleteSelector } from '@/components/Analytics/AthleteSelector';
import { InsightPanel } from '@/components/aria/InsightPanel';
import { InsightStrip } from '@/components/Analytics/InsightStrip';
import { MetricCarousel } from '@/components/Analytics/MetricCarousel';
import { AriaSpotlight } from '@/components/Analytics/AriaSpotlight';
import { ReadinessChart } from '@/components/ReadinessChart';
import { EnhancedSleepChart } from '@/components/EnhancedSleepChart';
import { EnhancedTrainingLoadChart } from '@/components/EnhancedTrainingLoadChart';
import { useEnhancedMetricsWithAthlete } from '@/hooks/useEnhancedMetricsWithAthlete';
import { Download, Sparkles, Activity, Moon, Zap, Target } from 'lucide-react';

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

const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "90d">("30d");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');
  const [ariaInput, setAriaInput] = useState('');

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Controls */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-wrap items-center justify-between mb-6 gap-3">
          <AthleteSelector 
            selectedAthleteId={selectedAthleteId}
            onAthleteChange={setSelectedAthleteId}
          />
          <button className="flex items-center gap-2 text-xs px-3 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition text-white">
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>

        {/* Period Selector */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-white/10 backdrop-blur rounded-xl p-1">
            {(["24h", "7d", "30d", "90d"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Insight Strip */}
      <InsightStrip
        readiness={latestReadiness}
        sleepHours={latestSleepHours}
        acwr={latestACWR}
        strain={latestStrainValue}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Metric Carousel - Replaces the stacked charts */}
        <div className="mt-6">
          <MetricCarousel labels={['Readiness', 'Sleep', 'Load']}>
            <ReadinessChart data={mockReadinessData} variant="carousel" />
            <EnhancedSleepChart data={mockSleepData} variant="carousel" />
            <EnhancedTrainingLoadChart data={mockLoadData} variant="carousel" />
          </MetricCarousel>
        </div>

        {/* ARIA Spotlight - Contextual coaching overlay */}
        <AriaSpotlight />

        {/* Responsive 12-Column Grid Layout for remaining components */}
        <div className="grid grid-cols-12 gap-6 auto-rows-min">
          {/* Muscle HeatMap - 58% width on desktop, full width on mobile */}
          <div className="col-span-12 lg:col-span-7">
            <div className="aspect-video md:aspect-auto">
              <HeatMapBody 
                className="w-full h-full min-h-[380px] md:h-[420px]" 
                period={period} 
                athleteId={selectedAthleteId} 
              />
            </div>
          </div>
          
          {/* ACWR Dial - 42% width on desktop, full width on mobile */}
          <div className="col-span-12 lg:col-span-5">
            <div className="aspect-video md:aspect-auto flex items-center justify-center">
              <div className="w-full max-w-[280px]">
                <ACWRDial large period={period} />
              </div>
            </div>
          </div>

          {/* ARIA Insights - Full width */}
          <div className="col-span-12">
            <InsightPanel
              insights={SAMPLE_INSIGHTS}
              suggestions={ARIA_SUGGESTIONS}
              onPrompt={handleAriaPrompt}
            />
          </div>

          {/* ARIA Input Section - Full width */}
          <div className="col-span-12">
            <GlassCard accent="secondary" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Ask ARIA
                </h3>
              </div>

              {/* Enhanced Input - Textarea */}
              <form className="flex flex-col gap-3" onSubmit={sendInsight}>
                <textarea
                  id="aria-input"
                  rows={3}
                  className="w-full resize-none rounded-lg bg-black/20 p-3 text-sm placeholder:text-white/40 border border-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-white"
                  placeholder="Ask ARIA… e.g. 'How can I improve recovery this week?'"
                  value={ariaInput}
                  onChange={(e) => setAriaInput(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    className="bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-lg px-4 py-2 text-sm font-medium text-white flex items-center gap-2"
                    type="submit"
                    disabled={!ariaInput.trim()}
                  >
                    <Sparkles className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
