
import React from 'react';
import { Zap } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';

interface StrainCardProps {
  strain: number | null;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export const StrainCard: React.FC<StrainCardProps> = ({ strain, trend }) => {
  const getStrainColor = (score: number | null) => {
    if (!score) return 'text-white/60';
    if (score >= 18) return 'text-red-400';
    if (score >= 12) return 'text-yellow-400';
    return 'text-green-400';
  };

  const formatValue = (value: number | null) => {
    if (value === null || value === undefined) return '—';
    return Math.round(value * 10) / 10; // One decimal place
  };

  return (
    <GlassCard className="p-6 bg-red-500/10 border-red-400/30">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-red-400" />
        <h3 className="text-lg font-semibold text-white">Strain</h3>
      </div>
      {strain !== null ? (
        <div>
          <div className={`text-3xl font-bold ${getStrainColor(strain)}`}>
            {formatValue(strain)}
          </div>
          <p className="text-white/60 text-sm mt-1">Current level</p>
          {trend && (
            <div className={`text-sm mt-2 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.value} vs yesterday
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Zap}
          title="No strain data"
          description="Connect your wearable to see strain levels"
        />
      )}
    </GlassCard>
  );
};
