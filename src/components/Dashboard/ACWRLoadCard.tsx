
import React from 'react';
import { Target } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { ACWRDial } from '@/components/Analytics/Glass/ACWRDial';
import { ACWRLoadChart } from './ACWRLoadChart';
import { useAcwr } from '@/hooks/useAcwr';
import { useLoadData } from '@/hooks/analytics/useLoadData';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/ui/EmptyState';

export const ACWRLoadCard: React.FC = () => {
  const { profile } = useAuth();
  const { data: acwrValue } = useAcwr();
  const { data: loadData, isLoading } = useLoadData(profile?.id, 28);

  const getACWRStatus = (value: number | null) => {
    if (!value) return { status: 'unknown', color: 'text-white/60' };
    
    if (value < 0.8) return { status: 'Low Risk', color: 'text-blue-400' };
    if (value <= 1.3) return { status: 'Optimal', color: 'text-green-400' };
    if (value <= 2.0) return { status: 'Moderate Risk', color: 'text-yellow-400' };
    return { status: 'High Risk', color: 'text-red-400' };
  };

  const acwrStatus = getACWRStatus(acwrValue);
  const currentValue = acwrValue || loadData?.latestAcwr || 0;

  if (isLoading) {
    return (
      <GlassCard className="p-6 bg-orange-500/10 border-orange-400/30">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">ACWR & Load</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-white/10 rounded"></div>
          <div className="h-32 bg-white/10 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  if (!loadData?.series || loadData.series.length === 0) {
    return (
      <GlassCard className="p-6 bg-orange-500/10 border-orange-400/30">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">ACWR & Load</h3>
        </div>
        <EmptyState
          icon={Target}
          title="No load data"
          description="Connect your wearable to see training load analysis"
        />
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6 bg-orange-500/10 border-orange-400/30">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">ACWR & Load</h3>
      </div>
      
      {/* ACWR Gauge Section */}
      <div className="mb-6">
        <div className="flex justify-center mb-2">
          <ACWRDial period="7d" />
        </div>
        
        <div className="text-center space-y-1">
          <div className="text-2xl font-bold text-white">
            {currentValue.toFixed(1)}
          </div>
          <div className={`text-sm font-medium ${acwrStatus.color}`}>
            {acwrStatus.status}
          </div>
          <div className="text-xs text-white/60">
            Acute:Chronic Workload Ratio
          </div>
        </div>
      </div>

      {/* Load Comparison Chart */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-white">Load Comparison</h4>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
              <span className="text-white/70">7-day</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              <span className="text-white/70">28-day</span>
            </div>
          </div>
        </div>
        
        <ACWRLoadChart 
          data={loadData.tableRows}
          isHourlyView={loadData.isHourlyView}
        />
      </div>

      {/* Safety Indicator */}
      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="text-xs text-white/60 text-center">
          Optimal range: 0.8 - 1.3 • Current trend: {loadData.delta7d >= 0 ? '↗' : '↘'} {Math.abs(loadData.delta7d).toFixed(2)}
        </div>
      </div>
    </GlassCard>
  );
};
