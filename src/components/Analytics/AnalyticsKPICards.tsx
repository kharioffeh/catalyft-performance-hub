
import React from 'react';
import { KpiCard } from '@/components/ui/KpiCard';
import { useNavigate } from 'react-router-dom';
import { Activity, Moon, Target, Zap } from 'lucide-react';

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

  const formatDelta = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)} vs 7d`;
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        title="Readiness Score"
        value={readinessData?.latestScore ? `${readinessData.latestScore}%` : '--'}
        icon={Activity}
        delta={readinessData?.delta7d ? {
          value: formatDelta(readinessData.delta7d),
          positive: readinessData.delta7d >= 0
        } : undefined}
        onClick={() => navigate('/analytics/readiness')}
        isLoading={!readinessData}
      />
      <KpiCard
        title="Sleep Duration"
        value={sleepData?.avgHours ? `${sleepData.avgHours}h` : '--'}
        icon={Moon}
        delta={sleepData?.delta7d ? {
          value: formatDelta(sleepData.delta7d),
          positive: sleepData.delta7d >= 0
        } : undefined}
        onClick={() => navigate('/sleep')}
        isLoading={!sleepData}
      />
      <KpiCard
        title="ACWR Ratio"
        value={loadData?.latestAcwr ? loadData.latestAcwr.toFixed(1) : '--'}
        icon={Target}
        delta={loadData?.delta7d ? {
          value: formatDelta(loadData.delta7d),
          positive: loadData.delta7d >= 0
        } : undefined}
        onClick={() => navigate('/analytics/load')}
        isLoading={!loadData}
      />
      <KpiCard
        title="Latest Strain"
        value={latestStrain?.value ? latestStrain.value.toFixed(1) : '--'}
        icon={Zap}
        delta={{
          value: formatDelta(-2.1),
          positive: false
        }}
        onClick={() => navigate('/analytics/load')}
        isLoading={!latestStrain}
      />
    </div>
  );
};
