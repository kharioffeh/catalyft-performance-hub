
import React from 'react';
import { Activity, Calendar, BarChart3, AlertTriangle, Zap, Target } from 'lucide-react';
import { KpiCard } from '@/components/ui/KpiCard';
import { MobileKpiGrid } from './MobileKpiGrid';
import { useIsPhone } from '@/hooks/useBreakpoint';
import { useMetrics } from '@/hooks/useMetrics';
import { useAcwr } from '@/hooks/useAcwr';

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
  const isPhone = useIsPhone();
  const { data: metricsData, isLoading: metricsLoading } = useMetrics();
  const { data: acwrValue, isLoading: acwrLoading } = useAcwr();

  const getRecoveryValue = () => {
    if (metricsData?.recovery) return `${Math.round(metricsData.recovery)}%`;
    if (currentReadiness) return `${Math.round(currentReadiness.score)}%`;
    return '--';
  };

  const getStrainValue = () => {
    if (metricsData?.strain) return (Math.round(metricsData.strain * 10) / 10).toString();
    return '--';
  };

  const getACWRValue = () => {
    if (acwrValue) return acwrValue.toFixed(1);
    return '1.2'; // Mock fallback
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

  // Mobile KPI data for phones only (≤414px)
  const mobileKpiData = [
    {
      id: 'recovery',
      title: 'Recovery',
      value: getRecoveryValue(),
      icon: Activity,
      color: 'text-green-600',
      trend: metricsData?.recoveryTrend,
      isLoading: metricsLoading || !metricsData
    },
    {
      id: 'strain',
      title: 'Strain',
      value: getStrainValue(),
      icon: Zap,
      color: 'text-red-600',
      trend: metricsData?.strainTrend,
      isLoading: metricsLoading || !metricsData
    },
    {
      id: 'acwr',
      title: 'ACWR',
      value: getACWRValue(),
      icon: Target,
      color: 'text-orange-600',
      isLoading: acwrLoading
    },
    {
      id: 'sessions',
      title: "Today's Sessions",
      value: getSessionsValue(),
      icon: Calendar,
      color: 'text-blue-600'
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

  // Use mobile grid only on phones (≤414px)
  if (isPhone) {
    return <MobileKpiGrid data={mobileKpiData} />;
  }

  // Desktop vertical layout
  return (
    <div className="space-y-4">
      {/* Recovery Card */}
      <KpiCard
        title="Recovery"
        value={getRecoveryValue()}
        icon={Activity}
        isLoading={metricsLoading || !metricsData}
        layout="vertical"
      />

      {/* Strain Card */}
      <KpiCard
        title="Strain"
        value={getStrainValue()}
        icon={Zap}
        isLoading={metricsLoading || !metricsData}
        layout="vertical"
      />

      {/* ACWR Card */}
      <KpiCard
        title="ACWR"
        value={getACWRValue()}
        icon={Target}
        isLoading={acwrLoading}
        layout="vertical"
      />

      {/* Today's Sessions Card */}
      <KpiCard
        title="Today's Sessions"
        value={getSessionsValue()}
        icon={Calendar}
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
