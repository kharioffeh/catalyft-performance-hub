
import React from 'react';
import { MetricCard } from './MetricCard';
import { useNavigate } from 'react-router-dom';

interface AnalyticsKPICardsProps {
  readinessData: any;
  sleepData: any;
  loadData: any;
  latestStrain: any;
}

export const AnalyticsKPICards: React.FC<AnalyticsKPICardsProps> = ({
  readinessData,
  sleepData,
  loadData,
  latestStrain
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Readiness Score"
        latest={readinessData?.latestScore}
        delta={readinessData?.delta7d}
        unit="%"
        target={85}
        onClick={() => navigate('/analytics/readiness')}
      />
      <MetricCard
        title="Sleep Duration"
        latest={sleepData?.avgHours}
        delta={sleepData?.delta7d}
        unit="h"
        target={8}
        onClick={() => navigate('/analytics/sleep')}
      />
      <MetricCard
        title="ACWR Ratio"
        latest={loadData?.latestAcwr}
        delta={loadData?.delta7d}
        target={1.3}
        onClick={() => navigate('/analytics/load')}
      />
      <MetricCard
        title="Latest Strain"
        latest={latestStrain?.value}
        delta={-2.1}
        target={15}
        onClick={() => navigate('/analytics/load')}
      />
    </div>
  );
};
