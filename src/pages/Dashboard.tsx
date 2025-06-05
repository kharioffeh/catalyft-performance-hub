
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { InsightsPanel } from '@/components/InsightsPanel';
import { AriaSummary } from '@/components/AriaSummary';
import { InjuryForecastCard } from '@/components/InjuryForecastCard';
import { DashboardHeader } from '@/components/Dashboard/DashboardHeader';
import { QuickStatusCards } from '@/components/Dashboard/QuickStatusCards';
import { TodaysSchedule } from '@/components/Dashboard/TodaysSchedule';
import { QuickActions } from '@/components/Dashboard/QuickActions';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useDashboardInsights } from '@/hooks/useDashboardInsights';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { currentReadiness, todaySessions, weeklyStats, injuryRisk } = useDashboardData(profile?.id);
  const insights = useDashboardInsights(currentReadiness, todaySessions, weeklyStats);

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
        {profile?.role === 'coach' ? (
          <>
            <AriaSummary />
            <InjuryForecastCard />
          </>
        ) : (
          <>
            <InsightsPanel insights={insights} />
            <InjuryForecastCard />
          </>
        )}
      </div>

      <QuickActions userRole={profile?.role} />
    </div>
  );
};

export default Dashboard;
