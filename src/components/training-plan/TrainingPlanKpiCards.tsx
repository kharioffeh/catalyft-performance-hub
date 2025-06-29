
import React from 'react';
import { FilePlus, PlayCircle, CalendarClock } from 'lucide-react';
import { KpiCard } from '@/components/ui/KpiCard';
import { useTrainingPlanStats } from '@/hooks/useTrainingPlanStats';

export const TrainingPlanKpiCards: React.FC = () => {
  const { data, isLoading } = useTrainingPlanStats();

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <KpiCard
        title="Templates"
        value={isLoading ? '—' : data?.templates ?? 0}
        icon={FilePlus}
        isLoading={isLoading}
      />
      <KpiCard
        title="Active Programs"
        value={isLoading ? '—' : data?.activePrograms ?? 0}
        icon={PlayCircle}
        isLoading={isLoading}
      />
      <KpiCard
        title="Total Sessions"
        value={isLoading ? '—' : data?.totalSessions ?? 0}
        icon={CalendarClock}
        isLoading={isLoading}
      />
    </section>
  );
};
