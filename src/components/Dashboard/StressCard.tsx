import React from 'react';
import { Activity } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { StressGauge } from './StressGauge';
import { useStress } from '@/hooks/useStress';
import { EmptyState } from '@/components/ui/EmptyState';

export const StressCard: React.FC = () => {
  const { data: stressData, isLoading } = useStress();

  const getStressStatus = (level: string) => {
    switch (level) {
      case 'low':
        return { status: 'Relaxed', color: 'text-green-400' };
      case 'moderate':
        return { status: 'Balanced', color: 'text-yellow-400' };
      case 'high':
        return { status: 'Elevated', color: 'text-red-400' };
      default:
        return { status: 'Unknown', color: 'text-white/60' };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '↗';
      case 'decreasing':
        return '↘';
      default:
        return '→';
    }
  };

  if (isLoading) {
    return (
      <GlassCard className="p-6 bg-blue-500/10 border-blue-400/30">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Daily Stress</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-white/10 rounded"></div>
          <div className="h-16 bg-white/10 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  if (!stressData) {
    return (
      <GlassCard className="p-6 bg-blue-500/10 border-blue-400/30">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Daily Stress</h3>
        </div>
        <EmptyState
          icon={Activity}
          title="No stress data"
          description="Connect your wearable to see stress analysis"
        />
      </GlassCard>
    );
  }

  const stressStatus = getStressStatus(stressData.level);

  return (
    <GlassCard className="p-6 bg-blue-500/10 border-blue-400/30">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Daily Stress</h3>
      </div>
      
      {/* Stress Gauge Section */}
      <div className="mb-6">
        <div className="flex justify-center mb-2">
          <StressGauge value={stressData.current} size="regular" />
        </div>
        
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold text-white">
            {stressData.current}
          </div>
          <div className={`text-sm font-medium ${stressStatus.color}`}>
            {stressStatus.status}
          </div>
          <div className="text-xs text-white/60">
            Current stress level
          </div>
        </div>
      </div>

      {/* Stress Metrics */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">7-Day Average</h4>
          <div className="flex items-center gap-2 text-xs">
            <div className="text-white">{stressData.average7d}</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">Trend</h4>
          <div className="flex items-center gap-1 text-xs">
            <span className="text-white/70 capitalize">{stressData.trend}</span>
            <span className="text-blue-400">{getTrendIcon(stressData.trend)}</span>
          </div>
        </div>
      </div>

      {/* Stress Level Indicator */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-white/60 text-center">
          Target: Keep below 60 for optimal wellbeing
        </div>
      </div>
    </GlassCard>
  );
};