
import React from 'react';
import { KpiCard } from '@/components/ui/KpiCard';
import { useNavigate } from 'react-router-dom';
import { Activity, Moon, Target, Zap } from 'lucide-react';

interface AnalyticsKPICardsProps {
  readinessData: any;
  sleepData: any;
  stressData: any;
  latestStrain: any;
}

export const AnalyticsKPICards: React.FC<AnalyticsKPICardsProps> = ({
  readinessData,
  sleepData,
  stressData,
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
        title="Stress Level"
        value={stressData?.current ? stressData.current.toString() : '--'}
        icon={Target}
        delta={stressData?.trend ? {
          value: stressData.trend === 'increasing' ? '+High' : stressData.trend === 'decreasing' ? '-Low' : 'Stable',
          positive: stressData.trend === 'decreasing'
        } : undefined}
        onClick={() => navigate('/stress')}
        isLoading={!stressData}
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
