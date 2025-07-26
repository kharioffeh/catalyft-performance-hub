
import React, { Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui';
import { AriaSummary } from '@/components/AriaSummary';
import { InjuryForecastCard } from '@/components/InjuryForecastCard';
import { TodaysSchedule } from '@/components/Dashboard/TodaysSchedule';
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
import { PeriodProvider } from '@/lib/hooks/usePeriod';
import SoloDashboard from '@/pages/solo/Dashboard';
import { Container } from '@/components/layout/Container';

const AthleteTypeLoader: React.FC = () => {
  const { profile } = useAuth();
  const { data: athleteTypeData } = useAthleteType(profile?.id, profile?.role);
  const { currentReadiness, todaySessions, weeklyStats, injuryRisk } = useDashboardData(profile?.id);
  const insights = useDashboardInsights(currentReadiness, todaySessions, weeklyStats);

  // Solo Athlete Dashboard - use the new dedicated solo dashboard
  if (athleteTypeData?.type === 'solo') {
    return <SoloDashboard />;
  }

  // Default Dashboard - for any remaining users (coaches will be converted to solo)
  return (
    <>
      <Container className="py-4 md:py-8 grid-cols-1 lg:grid-cols-[340px_1fr]">
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
      </Container>
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
    <PeriodProvider>
      <SuspenseWrapper 
        fallback={
          <div className="mx-auto w-full max-w-sm sm:max-w-md lg:max-w-7xl px-3 sm:px-4 md:px-8 py-4 md:py-8 space-y-4 sm:space-y-6">
            <SkeletonBox width={200} height={32} className="mb-4 sm:mb-8" />
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-[340px_1fr]">
              <div className="space-y-4 sm:space-y-6">
                <SkeletonCard className="h-60 sm:h-80" />
                <SkeletonCard className="h-32 sm:h-48" />
              </div>
              <div className="space-y-4 sm:space-y-6">
                <SkeletonCard className="h-48 sm:h-64" />
                <SkeletonCard className="h-48 sm:h-64" />
                <SkeletonCard className="h-48 sm:h-64" />
              </div>
            </div>
          </div>
        }
      >
        <AthleteTypeLoader />
      </SuspenseWrapper>
    </PeriodProvider>
  );
};

export default Dashboard;
