import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { Activity, Calendar, BarChart3, AlertTriangle, Zap, Target } from 'lucide-react';
import { KpiCard } from '@/components/ui/KpiCard';
import { KpiDrillModal } from '@/components/analytics/KpiDrillModal';
import { MobileKpiGrid } from './MobileKpiGrid';
import { useIsPhone, useIsMobile } from '@/hooks/useBreakpoint';
import { useMetrics } from '@/hooks/useMetrics';
import { useStress } from '@/hooks/useStress';
import { cn } from '@/lib/utils';

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
  const isPhone = useIsPhone();
  const isMobile = useIsMobile();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [modalMetric, setModalMetric] = useState<'readiness' | 'sleep' | 'load' | 'strain' | null>(null);
  const { data: metricsData, isLoading: metricsLoading } = useMetrics();
  const { data: stressData, isLoading: stressLoading } = useStress();

  const getReadinessValue = () => {
    if (metricsData?.recovery) return `${Math.round(metricsData.recovery)}%`;
    if (currentReadiness) return `${Math.round(currentReadiness.score)}%`;
    return '--';
  };

  const getStrainValue = () => {
    if (metricsData?.strain) return (Math.round(metricsData.strain * 10) / 10).toString();
    return '--';
  };

  const getStressValue = () => {
    if (stressData?.current) return stressData.current.toString();
    return '45'; // Mock fallback
  };

  const getRiskLevel = (probabilities: any) => {
    if (!probabilities) return 'Unknown';
    
    const highRisk = probabilities.high || 0;
    if (highRisk > 0.3) return 'High';
    if (highRisk > 0.15) return 'Moderate';
    return 'Low';
  };

  const getSessionsValue = () => {
    return todaySessions.length;
  };

  // Mobile KPI data for phones only (≤414px)
  const mobileKpiData = [
    {
      id: 'readiness',
      title: 'Readiness',
      value: getReadinessValue(),
      icon: Activity,
      color: 'text-green-600',
      trend: metricsData?.recoveryTrend,
      isLoading: metricsLoading || !metricsData,
      onClick: () => setModalMetric('readiness')
    },
    {
      id: 'strain',
      title: 'Strain',
      value: getStrainValue(),
      icon: Zap,
      color: 'text-red-600',
      trend: metricsData?.strainTrend,
      isLoading: metricsLoading || !metricsData,
      onClick: () => setModalMetric('strain')
    },
    {
      id: 'stress',
      title: 'Stress',
      value: getStressValue(),
      icon: Target,
      color: 'text-blue-600',
      isLoading: stressLoading,
      onClick: () => setModalMetric('load')
    },
    {
      id: 'sessions',
      title: "Today's Sessions",
      value: getSessionsValue(),
      icon: Calendar,
      color: 'text-blue-600'
    },
    {
      id: 'injury-risk',
      title: 'Injury Risk',
      value: injuryRisk ? getRiskLevel(injuryRisk.probabilities) : '--',
      icon: AlertTriangle,
      color: 'text-orange-600',
      isLoading: !injuryRisk
    }
  ];

  // Create desktop cards data
  const desktopCards = [
    {
      title: "Readiness",
      value: getReadinessValue(),
      icon: Activity,
      isLoading: metricsLoading || !metricsData,
      onClick: () => setModalMetric('readiness')
    },
    {
      title: "Strain",
      value: getStrainValue(),
      icon: Zap,
      isLoading: metricsLoading || !metricsData,
      onClick: () => setModalMetric('strain')
    },
    {
      title: "Stress",
      value: getStressValue(),
      icon: Target,
      isLoading: stressLoading,
      onClick: () => setModalMetric('load')
    },
    {
      title: "Today's Sessions",
      value: getSessionsValue(),
      icon: Calendar,
    },
    {
      title: "Injury Risk",
      value: injuryRisk ? getRiskLevel(injuryRisk.probabilities) : '--',
      icon: AlertTriangle,
      isLoading: !injuryRisk,
    }
  ];

  // Swipe handlers for mobile carousel
  const handlers = useSwipeable({
    onSwipedLeft: () => setCurrentSlide(Math.min(currentSlide + 1, desktopCards.length - 1)),
    onSwipedRight: () => setCurrentSlide(Math.max(currentSlide - 1, 0)),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  // Use mobile grid only on phones (≤414px)
  if (isPhone) {
    return (
      <>
        <MobileKpiGrid data={mobileKpiData} className="w-full" />
        {modalMetric && (
          <KpiDrillModal
            metric={modalMetric}
            isOpen={!!modalMetric}
            onClose={() => setModalMetric(null)}
          />
        )}
      </>
    );
  }

  // Mobile carousel layout (between phone and desktop)
  if (isMobile) {
    return (
      <>
        <div className="w-full">
          {/* Carousel container */}
          <div 
            {...handlers}
            className="overflow-hidden"
          >
            <div 
              className="flex transition-transform duration-300 ease-out"
              style={{ transform: `translateX(-${currentSlide * 85}vw)` }}
            >
              {desktopCards.map((card, index) => (
                <div key={index} className="flex-shrink-0 w-[85vw] pr-4">
                  <KpiCard
                    title={card.title}
                    value={card.value}
                    icon={card.icon}
                    isLoading={card.isLoading}
                    layout="vertical"
                    onClick={card.onClick}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Swipe dots indicator */}
          <div className="flex justify-center mt-4 gap-2">
            {desktopCards.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-200",
                  index === currentSlide 
                    ? "bg-primary w-6" 
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
        
        {/* Modal */}
        {modalMetric && (
          <KpiDrillModal
            metric={modalMetric}
            isOpen={!!modalMetric}
            onClose={() => setModalMetric(null)}
          />
        )}
      </>
    );
  }

  // Desktop vertical layout (lg+)
  return (
    <>
      <div className="space-y-4">
        {desktopCards.map((card, index) => (
          <KpiCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            isLoading={card.isLoading}
            layout="vertical"
            onClick={card.onClick}
          />
        ))}
      </div>
      
      {/* Modal */}
      {modalMetric && (
        <KpiDrillModal
          metric={modalMetric}
          isOpen={!!modalMetric}
          onClose={() => setModalMetric(null)}
        />
      )}
    </>
  );
};