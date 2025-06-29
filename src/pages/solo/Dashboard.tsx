
import React, { useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui';
import { ACWRDial } from '@/components/Analytics/Glass/ACWRDial';
import { AriaInsightsCard } from '@/components/cards/AriaInsightsCard';
import { HeatMapCard } from '@/components/cards/HeatMapCard';
import { ConnectWearableModal } from '@/components/ConnectWearableModal';
import { useLastSessionLoad } from '@/hooks/useLastSessionLoad';
import { useAcwr } from '@/hooks/useAcwr';
import { useAriaInsights } from '@/hooks/useAriaInsights';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useWearableStatus } from '@/hooks/useWearableStatus';
import { SkeletonCard } from '@/components/skeleton/SkeletonCard';
import { SkeletonBox } from '@/components/skeleton/SkeletonBox';
import { SkeletonChart } from '@/components/skeleton/SkeletonChart';
import { SuspenseWrapper } from '@/components/ui/SuspenseWrapper';
import { Activity, Zap, Target, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReadinessCard: React.FC<{ profileId: string }> = ({ profileId }) => {
  const { currentReadiness } = useDashboardData(profileId);

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

  return (
    <GlassCard className="p-6 bg-blue-500/10 border-blue-400/30">
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
  );
};

const LastSessionCard: React.FC = () => {
  const { data: lastSessionLoad } = useLastSessionLoad();

  const formatValue = (value: number | null) => {
    if (value === null || value === undefined) return '—';
    return Math.round(value).toString();
  };

  return (
    <GlassCard className="p-6 bg-purple-500/10 border-purple-400/30">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Last Load</h3>
      </div>
      <div>
        <div className="text-3xl font-bold text-white">
          {formatValue(lastSessionLoad)}
        </div>
        <p className="text-white/60 text-sm mt-1">Most recent session</p>
      </div>
    </GlassCard>
  );
};

const ACWRCard: React.FC = () => {
  const { data: acwrValue } = useAcwr();

  return (
    <GlassCard className="p-6 bg-orange-500/10 border-orange-400/30">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">ACWR</h3>
      </div>
      <div className="flex justify-center">
        <ACWRDial period="7d" mini />
      </div>
    </GlassCard>
  );
};

const SoloDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { data: wearableStatus } = useWearableStatus(profile?.id);
  const { data: insights } = useAriaInsights();
  const [showConnectModal, setShowConnectModal] = useState(false);

  const handleWearableConnected = () => {
    // Refresh the page data after successful connection
    window.location.reload();
  };

  if (!profile?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonBox width={200} height={32} />
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

        {/* Wearable Connection Banner */}
        {!wearableStatus?.wearable_connected && (
          <GlassCard className="flex items-center justify-between p-6 mb-6 bg-indigo-500/10 border-indigo-400/30">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/20 rounded-lg">
                <Smartphone className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">Connect your wearable</h3>
                <p className="text-sm text-white/70">
                  Link Whoop or Apple Health so ARIA can personalise your program.
                </p>
              </div>
            </div>
            <Button 
              onClick={() => setShowConnectModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Connect Device
            </Button>
          </GlassCard>
        )}

        {/* Responsive Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 auto-rows-[minmax(120px,auto)]">
          {/* Readiness Card */}
          <SuspenseWrapper fallback={<SkeletonCard className="bg-blue-500/10 border-blue-400/30" />}>
            <ReadinessCard profileId={profile.id} />
          </SuspenseWrapper>

          {/* Last Session Load Card */}
          <SuspenseWrapper fallback={<SkeletonCard className="bg-purple-500/10 border-purple-400/30" />}>
            <LastSessionCard />
          </SuspenseWrapper>

          {/* ACWR Dial Card */}
          <SuspenseWrapper fallback={<SkeletonChart className="bg-orange-500/10 border-orange-400/30 h-48" showAxes={false} />}>
            <ACWRCard />
          </SuspenseWrapper>

          {/* ARIA Insights Card */}
          <SuspenseWrapper fallback={<SkeletonCard contentLines={4} />}>
            <AriaInsightsCard data={insights} loading={false} />
          </SuspenseWrapper>

          {/* Heat Map Card - spans 2 rows on large screens */}
          <SuspenseWrapper fallback={<SkeletonChart className="lg:col-span-2 h-64" showAxes={false} />}>
            <HeatMapCard athleteId={profile.id} />
          </SuspenseWrapper>
        </div>

        {/* Connect Wearable Modal */}
        <ConnectWearableModal
          open={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          onSuccess={handleWearableConnected}
        />
      </div>
    </div>
  );
};

export default SoloDashboard;
