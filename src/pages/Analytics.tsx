
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Dumbbell, Heart, Apple, Target, Zap, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Chart Card Component for Analytics Tabs
const AnalyticsChartCard: React.FC<{
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, icon, children, className }) => (
  <Card className={cn(
    "bg-white/5 backdrop-blur-md border-white/10 rounded-2xl hover:border-indigo-500/30 transition-all duration-300",
    "hover:shadow-xl hover:scale-[1.02]",
    className
  )}>
    <CardHeader className="pb-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-xl">
          {icon}
        </div>
        <div>
          <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>
          <p className="text-sm text-white/60">{subtitle}</p>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      {children}
    </CardContent>
  </Card>
);

// Mock Chart Components (replace with real chart libraries)
const BarChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-medium text-white/80">{title}</h4>
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <span className="text-xs text-white/60 w-12">{item.label}</span>
          <div className="flex-1 bg-white/10 rounded-full h-2">
            <div 
              className="h-2 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
              style={{ width: `${item.value}%` }}
            />
          </div>
          <span className="text-xs text-white/80 w-8">{item.value}%</span>
        </div>
      ))}
    </div>
  </div>
);

const LineChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-medium text-white/80">{title}</h4>
    <div className="h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl p-4 flex items-end justify-between">
      {data.map((item, index) => (
        <div key={index} className="flex flex-col items-center gap-1">
          <div 
            className="w-1 bg-gradient-to-t from-indigo-400 to-purple-400 rounded-full transition-all duration-500"
            style={{ height: `${item.value}%` }}
          />
          <span className="text-xs text-white/60">{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

const RingChart: React.FC<{ data: any[]; title: string }> = ({ data, title }) => (
  <div className="space-y-3">
    <h4 className="text-sm font-medium text-white/80">{title}</h4>
    <div className="flex justify-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {data.map((item, index) => {
            const radius = 35;
            const circumference = 2 * Math.PI * radius;
            const strokeDasharray = circumference;
            const strokeDashoffset = circumference - (item.value / 100) * circumference;
            const angle = (index * 360) / data.length;
            const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180);
            const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180);
            
            return (
              <g key={index}>
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="none"
                  stroke={item.color}
                  strokeWidth="8"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  transform={`rotate(${angle} 50 50)`}
                  className="transition-all duration-1000"
                />
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{data.reduce((sum, item) => sum + item.value, 0)}%</div>
            <div className="text-xs text-white/60">Total</div>
          </div>
        </div>
      </div>
    </div>
    <div className="space-y-2">
      {data.map((item, index) => (
        <div key={index} className="flex items-center gap-2 text-xs">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-white/80">{item.label}</span>
          <span className="text-white/60 ml-auto">{item.value}%</span>
        </div>
      ))}
    </div>
  </div>
);

const AnalyticsPageContent: React.FC = () => {
  const [ariaInput, setAriaInput] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [activeTab, setActiveTab] = useState('strength');
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

  // Mock data for analytics tabs
  const strengthData = {
    maxWeight: [
      { label: 'Bench', value: 85 },
      { label: 'Squat', value: 92 },
      { label: 'Deadlift', value: 78 },
      { label: 'OHP', value: 65 }
    ],
    volume: [
      { label: 'Mon', value: 75 },
      { label: 'Tue', value: 60 },
      { label: 'Wed', value: 85 },
      { label: 'Thu', value: 70 },
      { label: 'Fri', value: 90 }
    ],
    muscleGroups: [
      { label: 'Chest', value: 30, color: '#EF4444' },
      { label: 'Back', value: 25, color: '#3B82F6' },
      { label: 'Legs', value: 35, color: '#10B981' },
      { label: 'Shoulders', value: 10, color: '#F59E0B' }
    ]
  };

  const bodyData = {
    readiness: [
      { label: 'Mon', value: 85 },
      { label: 'Tue', value: 78 },
      { label: 'Wed', value: 92 },
      { label: 'Thu', value: 88 },
      { label: 'Fri', value: 76 }
    ],
    sleep: [
      { label: 'Mon', value: 80 },
      { label: 'Tue', value: 75 },
      { label: 'Wed', value: 90 },
      { label: 'Thu', value: 85 },
      { label: 'Fri', value: 70 }
    ],
    recovery: [
      { label: 'HRV', value: 40, color: '#10B981' },
      { label: 'Sleep', value: 35, color: '#3B82F6' },
      { label: 'Fatigue', value: 25, color: '#F59E0B' }
    ]
  };

  const nutritionData = {
    macros: [
      { label: 'Protein', value: 35, color: '#EF4444' },
      { label: 'Carbs', value: 45, color: '#10B981' },
      { label: 'Fat', value: 20, color: '#F59E0B' }
    ],
    calories: [
      { label: 'Mon', value: 85 },
      { label: 'Tue', value: 92 },
      { label: 'Wed', value: 78 },
      { label: 'Thu', value: 88 },
      { label: 'Fri', value: 95 }
    ],
    hydration: [
      { label: 'Water', value: 70, color: '#3B82F6' },
      { label: 'Electrolytes', value: 20, color: '#8B5CF6' },
      { label: 'Other', value: 10, color: '#06B6D4' }
    ]
  };
  
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

        {/* Analytics Tabs */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Detailed Analytics</h2>
            <p className="text-white/70">Dive deeper into your training and recovery data</p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-1 grid w-full grid-cols-3 mb-6">
              <TabsTrigger 
                value="strength" 
                className="text-white/70 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 data-[state=active]:rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Strength</span>
              </TabsTrigger>
              <TabsTrigger 
                value="body" 
                className="text-white/70 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 data-[state=active]:rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                <span>Body</span>
              </TabsTrigger>
              <TabsTrigger 
                value="nutrition" 
                className="text-white/70 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-200 data-[state=active]:rounded-xl transition-all duration-200 flex items-center gap-2"
              >
                <Apple className="w-4 h-4" />
                <span>Nutrition</span>
              </TabsTrigger>
            </TabsList>

            {/* Strength Tab */}
            <TabsContent value="strength" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AnalyticsChartCard
                  title="Max Weight Progress"
                  subtitle="1RM improvements over time"
                  icon={<Target className="w-5 h-5 text-red-400" />}
                >
                  <BarChart data={strengthData.maxWeight} title="Current Maxes" />
                </AnalyticsChartCard>

                <AnalyticsChartCard
                  title="Weekly Volume"
                  subtitle="Training volume distribution"
                  icon={<Activity className="w-5 h-5 text-blue-400" />}
                >
                  <LineChart data={strengthData.volume} title="Volume %" />
                </AnalyticsChartCard>

                <AnalyticsChartCard
                  title="Muscle Group Focus"
                  subtitle="Training emphasis distribution"
                  icon={<Zap className="w-5 h-5 text-purple-400" />}
                >
                  <RingChart data={strengthData.muscleGroups} title="Focus %" />
                </AnalyticsChartCard>
              </div>
            </TabsContent>

            {/* Body Tab */}
            <TabsContent value="body" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AnalyticsChartCard
                  title="Readiness Trend"
                  subtitle="Daily readiness scores"
                  icon={<TrendingUp className="w-5 h-5 text-green-400" />}
                >
                  <LineChart data={bodyData.readiness} title="Readiness %" />
                </AnalyticsChartCard>

                <AnalyticsChartCard
                  title="Sleep Quality"
                  subtitle="Sleep efficiency tracking"
                  icon={<Heart className="w-5 h-5 text-blue-400" />}
                >
                  <LineChart data={bodyData.sleep} title="Sleep %" />
                </AnalyticsChartCard>

                <AnalyticsChartCard
                  title="Recovery Factors"
                  subtitle="Recovery component breakdown"
                  icon={<Activity className="w-5 h-5 text-indigo-400" />}
                >
                  <RingChart data={bodyData.recovery} title="Recovery %" />
                </AnalyticsChartCard>
              </div>
            </TabsContent>

            {/* Nutrition Tab */}
            <TabsContent value="nutrition" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AnalyticsChartCard
                  title="Macro Split"
                  subtitle="Daily macro distribution"
                  icon={<Apple className="w-5 h-5 text-green-400" />}
                >
                  <RingChart data={nutritionData.macros} title="Macros %" />
                </AnalyticsChartCard>

                <AnalyticsChartCard
                  title="Calorie Intake"
                  subtitle="Daily calorie targets"
                  icon={<Target className="w-5 h-5 text-orange-400" />}
                >
                  <LineChart data={nutritionData.calories} title="Target %" />
                </AnalyticsChartCard>

                <AnalyticsChartCard
                  title="Hydration"
                  subtitle="Fluid intake breakdown"
                  icon={<Zap className="w-5 h-5 text-cyan-400" />}
                >
                  <RingChart data={nutritionData.hydration} title="Hydration %" />
                </AnalyticsChartCard>
              </div>
            </TabsContent>
          </Tabs>
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
