
import React from 'react';
import { animated } from '@react-spring/web';
import { AnalyticsMobilePager } from './AnalyticsMobilePager';
import { MetricDetailSheet } from './MetricDetailSheet';
import { AnalyticsUIProvider } from '@/context/AnalyticsUIContext';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import { cn } from '@/lib/utils';

interface AnalyticsMobileProps {
  readinessContent: React.ReactNode;
  sleepContent: React.ReactNode;
  loadContent: React.ReactNode;
  onRefresh?: () => Promise<void>;
  className?: string;
}

export const AnalyticsMobile: React.FC<AnalyticsMobileProps> = ({
  readinessContent,
  sleepContent,
  loadContent,
  onRefresh,
  className,
}) => {
  const { bind, style } = usePullToRefresh({
    onRefresh: onRefresh || (() => Promise.resolve()),
    enabled: !!onRefresh,
  });

  return (
    <AnalyticsUIProvider onRefresh={onRefresh}>
      <div className={cn('min-h-screen', className)}>
        <animated.div
          {...bind()}
          style={style}
          className="w-full"
        >
          <AnalyticsMobilePager>
            {readinessContent}
            {sleepContent}
            {loadContent}
          </AnalyticsMobilePager>
        </animated.div>
        
        <MetricDetailSheet />
      </div>
    </AnalyticsUIProvider>
  );
};
