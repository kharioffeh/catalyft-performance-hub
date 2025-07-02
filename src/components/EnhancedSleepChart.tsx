
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LightweightLineChart } from '@/components/charts';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SleepData {
  athlete_uuid: string;
  day: string;
  total_sleep_hours: number;
  sleep_efficiency: number;
  avg_sleep_hr: number;
  hrv_rmssd: number;
}

interface EnhancedSleepChartProps {
  data: SleepData[];
  variant?: 'default' | 'carousel';
  onConnectWearable?: () => void;
}

export const EnhancedSleepChart: React.FC<EnhancedSleepChartProps> = ({ 
  data, 
  variant = 'default',
  onConnectWearable 
}) => {
  const [chartRef, isInView] = useInView<HTMLDivElement>({ threshold: 0.2, triggerOnce: true });
  const [animationComplete, setAnimationComplete] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isInView && !prefersReducedMotion) {
      const timer = setTimeout(() => setAnimationComplete(true), 500);
      return () => clearTimeout(timer);
    } else if (prefersReducedMotion) {
      setAnimationComplete(true);
    }
  }, [isInView, prefersReducedMotion]);

  const chartHeight = variant === 'carousel' ? 'h-[200px] md:h-[260px]' : 'h-[300px]';

  // Show empty state if no data
  if (!data || data.length === 0) {
    const emptyStateContent = (
      <EmptyState
        type="sleep"
        metric="sleep"
        onAction={onConnectWearable}
        className="h-[200px] md:h-[260px]"
      />
    );

    if (variant === 'carousel') {
      return (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Sleep & Recovery</h3>
            <p className="text-sm text-white/70">Sleep efficiency, duration, and HRV trends</p>
          </div>
          {emptyStateContent}
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Sleep & Recovery Metrics</CardTitle>
          <CardDescription>Sleep efficiency, duration, and HRV trends with optimal zones</CardDescription>
        </CardHeader>
        <CardContent>
          {emptyStateContent}
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map(item => ({
    x: format(new Date(item.day), 'MMM dd'),
    y: item.sleep_efficiency || 0,
    efficiency: item.sleep_efficiency || 0,
    duration: item.total_sleep_hours || 0,
    hrv: item.hrv_rmssd || 0
  }));

  const chartContent = (
    <div ref={chartRef} className={chartHeight}>
      <LightweightLineChart
        data={formattedData}
        width={400}
        height={variant === 'carousel' ? 200 : 300}
        color="#6366F1"
        showDots={true}
        className="w-full h-full"
      />
    </div>
  );

  const statsContent = (
    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
      <div className="text-center">
        <div className="font-medium">Sleep Efficiency</div>
        <div className="text-lg font-bold text-sleep">
          {formattedData[formattedData.length - 1]?.efficiency?.toFixed(1) || 0}%
        </div>
      </div>
      <div className="text-center">
        <div className="font-medium">Duration</div>
        <div className="text-lg font-bold text-sleep">
          {formattedData[formattedData.length - 1]?.duration?.toFixed(1) || 0}h
        </div>
      </div>
      <div className="text-center">
        <div className="font-medium">HRV</div>
        <div className="text-lg font-bold text-sleep">
          {formattedData[formattedData.length - 1]?.hrv?.toFixed(1) || 0}ms
        </div>
      </div>
    </div>
  );

  if (variant === 'carousel') {
    return (
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Sleep & Recovery</h3>
          <p className="text-sm text-white/70">Sleep efficiency, duration, and HRV trends</p>
        </div>
        {chartContent}
        {statsContent}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep & Recovery Metrics</CardTitle>
        <CardDescription>Sleep efficiency, duration, and HRV trends with optimal zones</CardDescription>
      </CardHeader>
      <CardContent>
        {chartContent}
        {statsContent}
      </CardContent>
    </Card>
  );
};
