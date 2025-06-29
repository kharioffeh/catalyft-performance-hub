
import React from 'react';
import { GlassCard } from '@/components/ui';
import { BodyHeatMap } from '@/components/BodyHeatMap';
import { Activity } from 'lucide-react';

interface HeatMapCardProps {
  athleteId: string;
  loading?: boolean;
}

export const HeatMapCard: React.FC<HeatMapCardProps> = ({ athleteId, loading }) => {
  if (loading) {
    return (
      <GlassCard className="p-6 lg:row-span-2">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">Muscle Load</h3>
        </div>
        <div className="animate-pulse flex justify-center">
          <div className="w-32 h-64 bg-white/20 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 lg:row-span-2">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Muscle Load</h3>
      </div>
      <div className="flex justify-center">
        <BodyHeatMap athleteId={athleteId} window_days={7} />
      </div>
    </GlassCard>
  );
};
