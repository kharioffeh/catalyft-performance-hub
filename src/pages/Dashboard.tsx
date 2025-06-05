
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AriaSummary } from '@/components/AriaSummary';
import { InjuryForecastCard } from '@/components/InjuryForecastCard';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { QuickStatusCards } from '@/components/Dashboard/QuickStatusCards';
import { TodaysSchedule } from '@/components/Dashboard/TodaysSchedule';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { SoloDashboard } from '@/components/Dashboard/SoloDashboard';
import { CoachedDashboard } from '@/components/Dashboard/CoachedDashboard';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardInsights } from '@/hooks/useDashboardInsights';
import { useAthleteType } from '@/hooks/useAthleteType';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { currentReadiness, todaySessions, weeklyStats, injuryRisk } = useDashboardData(profile?.id);
  const insights = useDashboardInsights(currentReadiness, todaySessions, weeklyStats);
  const { data: athleteTypeData, isLoading: isLoadingAthleteType } = useAthleteType(profile?.id, profile?.role);

  if (isLoadingAthleteType) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Coach Dashboard
  if (profile?.role === 'coach') {
    return (
      <div className="space-y-6">
        <DashboardHeader userRole="coach" />
        
        <QuickStatusCards 
          currentReadiness={currentReadiness}
          todaySessions={todaySessions}
          weeklyStats={weeklyStats}
          injuryRisk={injuryRisk}
        />

        <TodaysSchedule todaySessions={todaySessions} />

        <div className="grid gap-6 lg:grid-cols-2">
          <AriaSummary />
          <InjuryForecastCard />
        </div>

        <QuickActions userRole="coach" />
      </div>
    );
  }

  // Solo Athlete Dashboard
  if (athleteTypeData?.type === 'solo') {
    return (
      <SoloDashboard
        currentReadiness={currentReadiness}
        todaySessions={todaySessions}
        weeklyStats={weeklyStats}
        injuryRisk={injuryRisk}
        insights={insights}
      />
    );
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

  // Default fallback for coach users or when type is not determined
  return (
    <div className="space-y-6">
      <DashboardHeader userRole={profile?.role} />
      
      <QuickStatusCards 
        currentReadiness={currentReadiness}
        todaySessions={todaySessions}
        weeklyStats={weeklyStats}
        injuryRisk={injuryRisk}
      />

      <TodaysSchedule todaySessions={todaySessions} />

      <div className="grid gap-6 lg:grid-cols-2">
        <AriaSummary />
        <InjuryForecastCard />
      </div>

      <QuickActions userRole={profile?.role} />
    </div>
  );
};

export default Dashboard;
