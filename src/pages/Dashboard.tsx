
import React, { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui';
import { AriaSummary } from '@/components/AriaSummary';
import { InjuryForecastCard } from '@/components/InjuryForecastCard';
import { TodaysSchedule } from '@/components/Dashboard/TodaysSchedule';
import { CoachedDashboard } from '@/components/Dashboard/CoachedDashboard';
import { VerticalMetricCards } from '@/components/Dashboard/VerticalMetricCards';
import { QuickActionsCard } from '@/components/Dashboard/QuickActionsCard';
import { InsightToastContainer } from '@/components/ui/InsightToastContainer';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardInsights } from '@/hooks/useDashboardInsights';
import { useAthleteType } from '@/hooks/useAthleteType';
import { SkeletonCard } from '@/components/skeleton/SkeletonCard';
import { SkeletonBox } from '@/components/skeleton/SkeletonBox';
import { SuspenseWrapper } from '@/components/ui/SuspenseWrapper';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { InsightCarousel } from '@/components/Dashboard/InsightCarousel';
import SoloDashboard from '@/pages/solo/Dashboard';

const AthleteTypeLoader: React.FC = () => {
  const { profile } = useAuth();
  const { data: athleteTypeData } = useAthleteType(profile?.id, profile?.role);
  const { currentReadiness, todaySessions, weeklyStats, injuryRisk } = useDashboardData(profile?.id);
  const insights = useDashboardInsights(currentReadiness, todaySessions, weeklyStats);

  // Solo Athlete Dashboard - use the new dedicated solo dashboard
  if (athleteTypeData?.type === 'solo') {
    return <SoloDashboard />;
  }

  // Coached Athlete Dashboard
  if (athleteTypeData?.type === 'coached') {
    return (
      <>
        <CoachedDashboard
          currentReadiness={currentReadiness}
          todaySessions={todaySessions}
          weeklyStats={weeklyStats}
          injuryRisk={injuryRisk}
          insights={insights}
        />
        <InsightToastContainer />
      </>
    );
  }

  // Coach Dashboard - New glass morphism layout with animations
  return (
    <>
      <div className="mx-auto w-full max-w-7xl p-4 md:p-8 grid gap-4 md:gap-6 lg:grid-cols-[340px_1fr]">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Vertical Metric Cards */}
          <AnimatedCard delay={0.1}>
            <SuspenseWrapper fallback={<SkeletonCard className="h-80" contentLines={4} />}>
              <VerticalMetricCards 
                currentReadiness={currentReadiness}
                todaySessions={todaySessions}
                weeklyStats={weeklyStats}
                injuryRisk={injuryRisk}
              />
            </SuspenseWrapper>
          </AnimatedCard>
          
          {/* Quick Actions Card */}
          <AnimatedCard delay={0.2}>
            <SuspenseWrapper fallback={<SkeletonCard className="h-48" />}>
              <QuickActionsCard userRole={profile?.role} />
            </SuspenseWrapper>
          </AnimatedCard>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Today's Schedule */}
          <AnimatedCard delay={0.3}>
            <SuspenseWrapper fallback={<SkeletonCard className="h-64" contentLines={3} />}>
              <TodaysSchedule todaySessions={todaySessions} />
            </SuspenseWrapper>
          </AnimatedCard>

          {/* ARIA Insights */}
          <AnimatedCard delay={0.4}>
            <SuspenseWrapper fallback={<SkeletonCard className="h-64" contentLines={4} />}>
              <AriaSummary />
            </SuspenseWrapper>
          </AnimatedCard>

          {/* Injury Risk Forecast */}
          <AnimatedCard delay={0.5}>
            <SuspenseWrapper fallback={<SkeletonCard className="h-64" contentLines={3} />}>
              <InjuryForecastCard />
            </SuspenseWrapper>
          </AnimatedCard>
        </div>

        {/* Insight Carousel - Full Width */}
        <div className="lg:col-span-2 mt-8">
          <AnimatedCard delay={0.6}>
            <SuspenseWrapper fallback={<SkeletonCard className="h-40" contentLines={2} />}>
              <InsightCarousel />
            </SuspenseWrapper>
          </AnimatedCard>
        </div>
      </div>
      <InsightToastContainer />
    </>
  );
};

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  if (!profile?.id) {
    return (
      <div className="flex items-center justify-center h-64">
        <SkeletonBox width={200} height={32} />
      </div>
    );
  }

  return (
    <SuspenseWrapper 
      fallback={
        <div className="mx-auto w-full max-w-7xl p-4 md:p-8 space-y-6">
          <SkeletonBox width={300} height={40} className="mb-8" />
          <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
            <div className="space-y-6">
              <SkeletonCard className="h-80" />
              <SkeletonCard className="h-48" />
            </div>
            <div className="space-y-6">
              <SkeletonCard className="h-64" />
              <SkeletonCard className="h-64" />
              <SkeletonCard className="h-64" />
            </div>
          </div>
        </div>
      }
    >
      <AthleteTypeLoader />
    </SuspenseWrapper>
  );
};

export default Dashboard;
