
import React from 'react';
import { KpiCard } from '@/components/ui/KpiCard';
import { Activity, Moon, Target, Zap } from 'lucide-react';
import { getMetricColor } from '@/lib/metricTokens';
import { useDisclosure } from '@/lib/hooks/useDisclosure';
import { KpiDrillModal } from '../analytics/KpiDrillModal';

interface InsightStripProps {
  readiness: number | null;
  sleepHours: number | null;
  acwr: number | null;
  strain: number | null;
  className?: string;
}

export const InsightStrip: React.FC<InsightStripProps> = ({
  readiness,
  sleepHours,
  acwr,
  strain,
  className = ""
}) => {
  const readinessModal = useDisclosure();
  const sleepModal = useDisclosure();
  const loadModal = useDisclosure();
  const strainModal = useDisclosure();

  const formatValue = (value: number | null, unit: string = '', decimals: number = 0) => {
    if (value === null) return '--';
    return `${value.toFixed(decimals)}${unit}`;
  };

  const getTrendDelta = (current: number | null, previous: number | null) => {
    if (!current || !previous) return undefined;
    const diff = current - previous;
    return {
      value: `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}`,
      positive: diff >= 0
    };
  };

  return (
    <>
      <div className={`insight-strip sticky top-16 z-30 backdrop-blur-lg bg-slate-900/60 border-b border-white/10 ${className}`}>
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory md:grid md:grid-cols-4 md:overflow-visible">
            {/* Readiness Pill */}
            <div className="flex-shrink-0 min-w-[140px] snap-start">
              <KpiCard
                title="Readiness"
                value={formatValue(readiness, '%')}
                icon={Activity}
                delta={getTrendDelta(readiness, readiness ? readiness - 2 : null)}
                layout="horizontal"
                onClick={readinessModal.open}
                className="h-16 border-l-2 hover:bg-white/10 transition-colors cursor-pointer"
                style={{ 
                  borderLeftColor: getMetricColor('readiness', 'primary'),
                  backgroundColor: getMetricColor('readiness', 'bg')
                }}
              />
            </div>

            {/* Sleep Pill */}
            <div className="flex-shrink-0 min-w-[140px] snap-start">
              <KpiCard
                title="Sleep"
                value={formatValue(sleepHours, 'h', 1)}
                icon={Moon}
                delta={getTrendDelta(sleepHours, sleepHours ? sleepHours - 0.1 : null)}
                layout="horizontal"
                onClick={sleepModal.open}
                className="h-16 border-l-2 hover:bg-white/10 transition-colors cursor-pointer"
                style={{ 
                  borderLeftColor: getMetricColor('sleep', 'primary'),
                  backgroundColor: getMetricColor('sleep', 'bg')
                }}
              />
            </div>

            {/* ACWR Pill */}
            <div className="flex-shrink-0 min-w-[140px] snap-start">
              <KpiCard
                title="ACWR"
                value={formatValue(acwr, '', 1)}
                icon={Target}
                delta={getTrendDelta(acwr, acwr ? acwr + 0.1 : null)}
                layout="horizontal"
                onClick={loadModal.open}
                className="h-16 border-l-2 hover:bg-white/10 transition-colors cursor-pointer"
                style={{ 
                  borderLeftColor: getMetricColor('load', 'primary'),
                  backgroundColor: getMetricColor('load', 'bg')
                }}
              />
            </div>

            {/* Strain Pill */}
            <div className="flex-shrink-0 min-w-[140px] snap-start">
              <KpiCard
                title="Strain"
                value={formatValue(strain, '', 1)}
                icon={Zap}
                delta={getTrendDelta(strain, strain ? strain + 1.2 : null)}
                layout="horizontal"
                onClick={strainModal.open}
                className="h-16 border-l-2 hover:bg-white/10 transition-colors cursor-pointer"
                style={{ 
                  borderLeftColor: getMetricColor('strain', 'primary'),
                  backgroundColor: getMetricColor('strain', 'bg')
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Drill-down Modals */}
      <KpiDrillModal
        metric="readiness"
        isOpen={readinessModal.isOpen}
        onClose={readinessModal.close}
      />
      <KpiDrillModal
        metric="sleep"
        isOpen={sleepModal.isOpen}
        onClose={sleepModal.close}
      />
      <KpiDrillModal
        metric="load"
        isOpen={loadModal.isOpen}
        onClose={loadModal.close}
      />
      <KpiDrillModal
        metric="strain"
        isOpen={strainModal.isOpen}
        onClose={strainModal.close}
      />
    </>
  );
};
