import React from 'react';
import { Activity, Calendar, BarChart3, AlertTriangle } from 'lucide-react';
import { KpiCard } from '@/components/ui/KpiCard';
import { MobileKpiGrid } from './MobileKpiGrid';
import { useIsMobile } from '@/hooks/useBreakpoint';

interface VerticalMetricCardsProps {
  currentReadiness: any;
  todaySessions: any[];
  weeklyStats: any;
  injuryRisk: any;
}

export const VerticalMetricCards: React.FC<VerticalMetricCardsProps> = ({
  currentReadiness,
  todaySessions,
  weeklyStats,
  injuryRisk
}) => {
  const isMobile = useIsMobile();

  const getReadinessValue = () => {
    if (!currentReadiness) return '--';
    return `${Math.round(currentReadiness.score)}%`;
  };

  const getReadinessStatus = (score: number) => {
    if (score >= 80) return 'Optimal';
    if (score >= 60) return 'Moderate';
    return 'Low';
  };

  const getRiskLevel = (probabilities: any) => {
    if (!probabilities) return 'Unknown';
    
    const highRisk = probabilities.high || 0;
    if (highRisk > 0.3) return 'High';
    if (highRisk > 0.15) return 'Moderate';
    return 'Low';
  };

  const getSessionsValue = () => {
    return todaySessions.length;
  };

  const getSessionsSubtext = () => {
    if (todaySessions.length === 0) return 'Rest day';
    if (todaySessions.length === 1) return 'session planned';
    return 'sessions planned';
  };

  const getWeeklyValue = () => {
    return `${weeklyStats?.completed || 0}/${weeklyStats?.planned || 0}`;
  };

  // Mobile KPI data
  const mobileKpiData = [
    {
      id: 'readiness',
      title: 'Readiness',
      value: getReadinessValue(),
      icon: Activity,
      color: 'text-blue-600',
      isLoading: !currentReadiness
    },
    {
      id: 'sessions',
      title: "Today's Sessions",
      value: getSessionsValue(),
      icon: Calendar,
      color: 'text-green-600'
    },
    {
      id: 'weekly',
      title: 'This Week',
      value: getWeeklyValue(),
      icon: BarChart3,
      color: 'text-purple-600'
    },
    {
      id: 'injury-risk',
      title: 'Injury Risk',
      value: injuryRisk ? getRiskLevel(injuryRisk.probabilities) : '--',
      icon: AlertTriangle,
      color: 'text-orange-600',
      isLoading: !injuryRisk
    }
  ];

  // Use mobile grid on small screens
  if (isMobile) {
    return <MobileKpiGrid data={mobileKpiData} />;
  }

  // Desktop vertical layout (unchanged)
  return (
    <div className="space-y-4">
      {/* Readiness Card */}
      <KpiCard
        title="Readiness"
        value={getReadinessValue()}
        icon={Activity}
        isLoading={!currentReadiness}
        layout="vertical"
      />

      {/* Today's Sessions Card */}
      <KpiCard
        title="Today's Sessions"
        value={getSessionsValue()}
        icon={Calendar}
        layout="vertical"
      />

      {/* This Week Card */}
      <KpiCard
        title="This Week"
        value={getWeeklyValue()}
        icon={BarChart3}
        layout="vertical"
      />

      {/* Injury Risk Card */}
      <KpiCard
        title="Injury Risk"
        value={injuryRisk ? getRiskLevel(injuryRisk.probabilities) : '--'}
        icon={AlertTriangle}
        isLoading={!injuryRisk}
        layout="vertical"
      />
    </div>
  );
};
