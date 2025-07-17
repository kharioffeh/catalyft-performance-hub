
import React, { useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GlassCard } from '@/components/ui';
import { AriaInsightsCard } from '@/components/cards/AriaInsightsCard';
import { HeatMapCard } from '@/components/cards/HeatMapCard';
import { ConnectWearableModal } from '@/components/ConnectWearableModal';
import { MobileKpiGrid } from '@/components/Dashboard/MobileKpiGrid';
import { RecoveryCard } from '@/components/Dashboard/RecoveryCard';
import { StrainCard } from '@/components/Dashboard/StrainCard';
import { StressCard } from '@/components/Dashboard/StressCard';
import { InsightToastContainer } from '@/components/ui/InsightToastContainer';
import { useMetrics } from '@/hooks/useMetrics';
import { useAriaInsights } from '@/hooks/useAriaInsights';
import { useWearableStatus } from '@/hooks/useWearableStatus';
import { useIsPhone } from '@/hooks/useBreakpoint';
import { SkeletonCard } from '@/components/skeleton/SkeletonCard';
import { SkeletonBox } from '@/components/skeleton/SkeletonBox';
import { SkeletonChart } from '@/components/skeleton/SkeletonChart';
import { SuspenseWrapper } from '@/components/ui/SuspenseWrapper';
import { AnimatedCard } from '@/components/ui/AnimatedCard';
import { LoadingButton } from '@/components/ui/LoadingButton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Activity, Zap, Target, Smartphone } from 'lucide-react';

const SoloDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { data: wearableStatus } = useWearableStatus(profile?.id);
  const { data: insights } = useAriaInsights();
  const { data: metricsData, isLoading: metricsLoading } = useMetrics();
  const isPhone = useIsPhone();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWearableConnected = async () => {
    setIsConnecting(true);
    // Simulate connection process
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsConnecting(false);
    window.location.reload();
  };

  // Mobile KPI data for phones only (≤414px)
  const mobileKpiData = [
    {
      id: 'recovery',
      title: 'Recovery',
      value: metricsData?.recovery ? `${Math.round(metricsData.recovery)}%` : '—',
      icon: Activity,
      color: 'text-green-400',
      trend: metricsData?.recoveryTrend,
      isLoading: metricsLoading
    },
    {
      id: 'strain',
      title: 'Strain',
      value: metricsData?.strain ? (Math.round(metricsData.strain * 10) / 10).toString() : '—',
      icon: Zap,
      color: 'text-red-400',
      trend: metricsData?.strainTrend,
      isLoading: metricsLoading
    },
    {
      id: 'stress',
      title: 'Stress',
      value: '45', // Mock value - this would come from useStress hook
      icon: Target,
      color: 'text-blue-400',
      isLoading: false
    }
  ];

  if (!profile?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SkeletonBox width={200} height={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-charcoal p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <AnimatedCard>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-white/70">Your daily overview</p>
          </div>
        </AnimatedCard>

        {/* Wearable Connection Banner */}
        {!wearableStatus?.wearable_connected && (
          <AnimatedCard delay={0.1}>
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
              <LoadingButton 
                loading={isConnecting}
                loadingText="Connecting..."
                onClick={() => setShowConnectModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Connect Device
              </LoadingButton>
            </GlassCard>
          </AnimatedCard>
        )}

        {/* KPI Section - Phone vs Desktop/Tablet */}
        {isPhone ? (
          <AnimatedCard delay={0.2}>
            <SuspenseWrapper fallback={<SkeletonCard className="h-96" />}>
              <MobileKpiGrid data={mobileKpiData} />
            </SuspenseWrapper>
          </AnimatedCard>
        ) : (
          /* Desktop/Tablet Grid (>414px) */
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 auto-rows-[minmax(120px,auto)] mb-8">
            {/* Recovery Card */}
            <AnimatedCard delay={0.2}>
              <SuspenseWrapper fallback={<SkeletonCard className="bg-green-500/10 border-green-400/30" />}>
                <RecoveryCard 
                  recovery={metricsData?.recovery ?? null}
                  trend={metricsData?.recoveryTrend}
                />
              </SuspenseWrapper>
            </AnimatedCard>

            {/* Strain Card */}
            <AnimatedCard delay={0.3}>
              <SuspenseWrapper fallback={<SkeletonCard className="bg-red-500/10 border-red-400/30" />}>
                <StrainCard 
                  strain={metricsData?.strain ?? null}
                  trend={metricsData?.strainTrend}
                />
              </SuspenseWrapper>
            </AnimatedCard>

            {/* Stress Card - Enhanced with gauge */}
            <AnimatedCard delay={0.4}>
              <SuspenseWrapper fallback={<SkeletonChart className="bg-blue-500/10 border-blue-400/30 h-80" showAxes={false} />}>
                <StressCard />
              </SuspenseWrapper>
            </AnimatedCard>
          </div>
        )}

        {/* Bottom Content Grid */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 auto-rows-[minmax(120px,auto)]">
          {/* ARIA Insights Card */}
          <AnimatedCard delay={0.5}>
            <SuspenseWrapper fallback={<SkeletonCard contentLines={4} />}>
              <AriaInsightsCard data={insights} loading={false} />
            </SuspenseWrapper>
          </AnimatedCard>

          {/* Heat Map Card - spans 2 rows on large screens */}
          <AnimatedCard delay={0.6} className="lg:col-span-1">
            <SuspenseWrapper fallback={<SkeletonChart className="h-64" showAxes={false} />}>
              <HeatMapCard athleteId={profile.id} />
            </SuspenseWrapper>
          </AnimatedCard>
        </div>

        {/* Connect Wearable Modal */}
        <ConnectWearableModal
          open={showConnectModal}
          onClose={() => setShowConnectModal(false)}
          onSuccess={handleWearableConnected}
        />
      </div>

      {/* Insight Toast Container */}
      <InsightToastContainer />
    </div>
  );
};

export default SoloDashboard;
