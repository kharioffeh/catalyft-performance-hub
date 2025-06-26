
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/Glass/GlassCard';
import { ACWRDial } from '@/components/Analytics/Glass/ACWRDial';
import { AriaInsightsCard } from '@/components/cards/AriaInsightsCard';
import { HeatMapCard } from '@/components/cards/HeatMapCard';
import { useLastSessionLoad } from '@/hooks/useLastSessionLoad';
import { useAcwr } from '@/hooks/useAcwr';
import { useAriaInsights } from '@/hooks/useAriaInsights';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Activity, Zap, Target } from 'lucide-react';

const SoloDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { currentReadiness } = useDashboardData(profile?.id);
  const { data: lastSessionLoad, isLoading: loadingLastSession } = useLastSessionLoad();
  const { data: acwrValue, isLoading: loadingAcwr } = useAcwr();
  const { data: insights, isLoading: loadingInsights } = useAriaInsights();

  const formatValue = (value: number | null, suffix = '') => {
    if (value === null || value === undefined) return '—';
    return `${Math.round(value)}${suffix}`;
  };

  const getReadinessColor = (score: number | null) => {
    if (!score) return 'text-white/60';
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (!profile?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-white/70">Your daily overview</p>
        </div>

        {/* Responsive Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 auto-rows-[minmax(120px,auto)]">
          {/* Readiness Card */}
          <GlassCard className="p-6" accent="primary">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Readiness</h3>
            </div>
            {currentReadiness ? (
              <div>
                <div className={`text-3xl font-bold ${getReadinessColor(currentReadiness.score)}`}>
                  {formatValue(currentReadiness.score, '%')}
                </div>
                <p className="text-white/60 text-sm mt-1">Today's score</p>
              </div>
            ) : (
              <div className="text-3xl font-bold text-white/40">—</div>
            )}
          </GlassCard>

          {/* Last Session Load Card */}
          <GlassCard className="p-6" accent="load">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-semibold text-white">Last Load</h3>
            </div>
            {loadingLastSession ? (
              <div className="animate-pulse">
                <div className="h-8 bg-white/20 rounded w-16 mb-2"></div>
                <div className="h-4 bg-white/20 rounded w-24"></div>
              </div>
            ) : (
              <div>
                <div className="text-3xl font-bold text-white">
                  {formatValue(lastSessionLoad)}
                </div>
                <p className="text-white/60 text-sm mt-1">Most recent session</p>
              </div>
            )}
          </GlassCard>

          {/* ACWR Dial Card */}
          <GlassCard className="p-6" accent="strain">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-semibold text-white">ACWR</h3>
            </div>
            {loadingAcwr ? (
              <div className="animate-pulse flex justify-center">
                <div className="w-24 h-24 bg-white/20 rounded-full"></div>
              </div>
            ) : (
              <div className="flex justify-center">
                <ACWRDial period="7d" mini />
              </div>
            )}
          </GlassCard>

          {/* ARIA Insights Card */}
          <AriaInsightsCard data={insights} loading={loadingInsights} />

          {/* Heat Map Card - spans 2 rows on large screens */}
          <HeatMapCard athleteId={profile.id} />
        </div>
      </div>
    </div>
  );
};

export default SoloDashboard;
