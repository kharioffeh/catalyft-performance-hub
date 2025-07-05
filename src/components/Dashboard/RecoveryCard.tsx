
import React from 'react';
import { Activity } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui/EmptyState';

interface RecoveryCardProps {
  recovery: number | null;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export const RecoveryCard: React.FC<RecoveryCardProps> = ({ recovery, trend }) => {
  const getRecoveryColor = (score: number | null) => {
    if (!score) return 'text-white/60';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const formatValue = (value: number | null) => {
    if (value === null || value === undefined) return '—';
    return `${Math.round(value)}%`;
  };

  return (
    <GlassCard className="p-6 bg-green-500/10 border-green-400/30">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Recovery</h3>
      </div>
      {recovery !== null ? (
        <div>
          <div className={`text-3xl font-bold ${getRecoveryColor(recovery)}`}>
            {formatValue(recovery)}
          </div>
          <p className="text-white/60 text-sm mt-1">Today's score</p>
          {trend && (
            <div className={`text-sm mt-2 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.value} vs yesterday
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={Activity}
          title="No recovery data"
          description="Connect your wearable to see recovery scores"
        />
      )}
    </GlassCard>
  );
};
