
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui';
import { AriaSummary } from '@/components/AriaSummary';
import { InjuryForecastCard } from '@/components/InjuryForecastCard';
import { TodaysSchedule } from '@/components/Dashboard/TodaysSchedule';
import { CoachedDashboard } from '@/components/Dashboard/CoachedDashboard';
import { VerticalMetricCards } from '@/components/Dashboard/VerticalMetricCards';
import { QuickActionsCard } from '@/components/Dashboard/QuickActionsCard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardInsights } from '@/hooks/useDashboardInsights';
import { useAthleteType } from '@/hooks/useAthleteType';
import SoloDashboard from '@/pages/solo/Dashboard';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { currentReadiness, todaySessions, weeklyStats, injuryRisk } = useDashboardData(profile?.id);
  const insights = useDashboardInsights(currentReadiness, todaySessions, weeklyStats);
  const { data: athleteTypeData, isLoading: isLoadingAthleteType } = useAthleteType(profile?.id, profile?.role);

  if (isLoadingAthleteType) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white/50"></div>
      </div>
    );
  }

  // Solo Athlete Dashboard - use the new dedicated solo dashboard
  if (athleteTypeData?.type === 'solo') {
    return <SoloDashboard />;
  }

  // Coached Athlete Dashboard
  if (athleteTypeData?.type === 'coached') {
    return (
      <CoachedDashboard
        currentReadiness={currentReadiness}
        todaySessions={todaySessions}
        weeklyStats={weeklyStats}
        injuryRisk={injuryRisk}
        insights={insights}
      />
    );
  }

  // Coach Dashboard - New glass morphism layout
  return (
    <div className="mx-auto w-full max-w-7xl p-4 md:p-8 grid gap-4 md:gap-6 lg:grid-cols-[340px_1fr]">
      {/* Left Column */}
      <div className="space-y-6">
        {/* Vertical Metric Cards */}
        <VerticalMetricCards 
          currentReadiness={currentReadiness}
          todaySessions={todaySessions}
          weeklyStats={weeklyStats}
          injuryRisk={injuryRisk}
        />
        
        {/* Quick Actions Card */}
        <QuickActionsCard userRole={profile?.role} />
      </div>

      {/* Right Column */}
      <div className="space-y-6">
        {/* Today's Schedule */}
        <TodaysSchedule todaySessions={todaySessions} />

        {/* ARIA Insights */}
        <AriaSummary />

        {/* Injury Risk Forecast */}
        <InjuryForecastCard />
      </div>
    </div>
  );
};

export default Dashboard;
