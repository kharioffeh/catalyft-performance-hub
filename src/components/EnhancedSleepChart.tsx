import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { chartTheme, makeLine, makeYAxis, makeXAxis, referenceLines, createTooltipFormatter } from '@/lib/chartTheme';
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

const chartConfig = {
  sleep_efficiency: {
    label: "Sleep Efficiency (%)",
    color: '#6366F1', // sleep color
  },
  total_sleep_hours: {
    label: "Sleep Duration (hrs)",
    color: '#818CF8', // sleep ring color
  },
  hrv_rmssd: {
    label: "HRV (ms)",
    color: '#A5B4FC', // lighter sleep variant
  },
};

export const EnhancedSleepChart: React.FC<EnhancedSleepChartProps> = ({ 
  data, 
  variant = 'default',
  onConnectWearable 
}) => {
  const [chartRef, isInView] = useInView({ threshold: 0.2, triggerOnce: true });
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
  const showLegend = variant !== 'carousel';

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
    ...item,
    date: format(new Date(item.day), 'MMM dd'),
    efficiency: item.sleep_efficiency || 0,
    duration: item.total_sleep_hours || 0,
    hrv: item.hrv_rmssd || 0
  }));

  const tooltipFormatter = createTooltipFormatter({
    efficiency: '%',
    duration: 'h',
    hrv: 'ms'
  });

  const xAxisProps = makeXAxis();
  const leftYAxisProps = makeYAxis([0, 100], '%');
  const rightYAxisProps = makeYAxis(undefined, 'hrs/ms');

  const chartContent = (
    <div ref={chartRef}>
      <ChartContainer config={chartConfig} className={chartHeight}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={formattedData}>
            <XAxis 
              dataKey="date" 
              {...xAxisProps}
            />
            <YAxis 
              yAxisId="left"
              {...leftYAxisProps}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              {...rightYAxisProps}
            />

            {/* Reference lines for optimal sleep duration */}
            {referenceLines.sleep.map((line, index) => (
              <ReferenceLine 
                key={index}
                yAxisId="right"
                y={line.value}
                stroke={line.color}
                strokeDasharray={line.strokeDasharray}
                strokeOpacity={0.5}
              />
            ))}
            
            <ChartTooltip 
              content={<ChartTooltipContent formatter={tooltipFormatter} />} 
            />
            {showLegend && <Legend />}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="efficiency"
              {...makeLine(chartConfig.sleep_efficiency.color)}
              name="Sleep Efficiency (%)"
              strokeDasharray={!animationComplete && !prefersReducedMotion ? "5 5" : "0"}
              style={{
                strokeDashoffset: !animationComplete && !prefersReducedMotion ? "1000" : "0",
                transition: "stroke-dashoffset 1.2s ease-in-out"
              }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="duration"
              {...makeLine(chartConfig.total_sleep_hours.color)}
              name="Duration (hrs)"
              strokeDasharray={!animationComplete && !prefersReducedMotion ? "5 5" : "0"}
              style={{
                strokeDashoffset: !animationComplete && !prefersReducedMotion ? "800" : "0",
                transition: "stroke-dashoffset 1.4s ease-in-out 0.2s"
              }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="hrv"
              {...makeLine(chartConfig.hrv_rmssd.color)}
              name="HRV (ms)"
              strokeDasharray={!animationComplete && !prefersReducedMotion ? "5 5" : "0"}
              style={{
                strokeDashoffset: !animationComplete && !prefersReducedMotion ? "600" : "0",
                transition: "stroke-dashoffset 1.6s ease-in-out 0.4s"
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
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
