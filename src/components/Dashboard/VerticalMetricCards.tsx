
import React from 'react';
import { Activity, Calendar, BarChart3, AlertTriangle } from 'lucide-react';
import { GlassCard } from '@/components/ui';

interface VerticalMetricCardsProps {
  currentReadiness: any;
  todaySessions: any[];
  weeklyStats: any;
  injuryRisk: any;
}

export const VerticalMetricCards: React.FC<VerticalMetricCardsProps> = ({
  currentReadiness,
  todaySessions,
  weeklyStats,
  injuryRisk
}) => {
  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getReadinessStatus = (score: number) => {
    if (score >= 80) return 'Optimal';
    if (score >= 60) return 'Moderate';
    return 'Low';
  };

  const getRiskLevel = (probabilities: any) => {
    if (!probabilities) return { level: 'Unknown', color: 'text-gray-400' };
    
    const highRisk = probabilities.high || 0;
    if (highRisk > 0.3) return { level: 'High', color: 'text-red-400' };
    if (highRisk > 0.15) return { level: 'Moderate', color: 'text-yellow-400' };
    return { level: 'Low', color: 'text-green-400' };
  };

  return (
    <div className="space-y-4">
      {/* Readiness Card */}
      <GlassCard className="px-6 py-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/70">Readiness</p>
          <Activity className="h-4 w-4 text-white/50" />
        </div>
        {currentReadiness ? (
          <div>
            <div className={`text-2xl font-bold ${getReadinessColor(currentReadiness.score)}`}>
              {Math.round(currentReadiness.score)}%
            </div>
            <p className="text-xs text-white/60">
              {getReadinessStatus(currentReadiness.score)} • Today
            </p>
          </div>
        ) : (
          <div className="text-2xl font-bold text-white/40">--</div>
        )}
      </GlassCard>

      {/* Today's Sessions Card */}
      <GlassCard className="px-6 py-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/70">Today's Sessions</p>
          <Calendar className="h-4 w-4 text-white/50" />
        </div>
        <div className="text-2xl font-bold text-white">{todaySessions.length}</div>
        <p className="text-xs text-white/60">
          {todaySessions.length === 0 ? 'Rest day' : 
           todaySessions.length === 1 ? 'session planned' : 
           'sessions planned'}
        </p>
      </GlassCard>

      {/* This Week Card */}
      <GlassCard className="px-6 py-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/70">This Week</p>
          <BarChart3 className="h-4 w-4 text-white/50" />
        </div>
        <div className="text-2xl font-bold text-white">
          {weeklyStats?.completed || 0}/{weeklyStats?.planned || 0}
        </div>
        <p className="text-xs text-white/60">
          sessions completed
        </p>
      </GlassCard>

      {/* Injury Risk Card */}
      <GlassCard className="px-6 py-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-white/70">Injury Risk</p>
          <AlertTriangle className="h-4 w-4 text-white/50" />
        </div>
        {injuryRisk ? (
          <div>
            <div className={`text-2xl font-bold ${getRiskLevel(injuryRisk.probabilities).color}`}>
              {getRiskLevel(injuryRisk.probabilities).level}
            </div>
            <p className="text-xs text-white/60">
              Current forecast
            </p>
          </div>
        ) : (
          <div className="text-2xl font-bold text-white/40">--</div>
        )}
      </GlassCard>
    </div>
  );
};
