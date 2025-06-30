
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { chartTheme, makeLine, makeYAxis, makeXAxis, referenceLines, formatWithUnit } from '@/lib/chartTheme';
import { EmptyState } from '@/components/ui/EmptyState';
import { useInView } from '@/hooks/useInView';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ReadinessData {
  date: string;
  score: number;
}

interface ReadinessChartProps {
  data: ReadinessData[];
  variant?: 'default' | 'carousel';
  onConnectWearable?: () => void;
}

const chartConfig = {
  score: {
    label: "Readiness Score",
    color: '#10B981', // readiness color
  },
};

export const ReadinessChart: React.FC<ReadinessChartProps> = ({ 
  data, 
  variant = 'default',
  onConnectWearable 
}) => {
  const [chartRef, isInView] = useInView({ threshold: 0.2, triggerOnce: true });
  const [animationComplete, setAnimationComplete] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isInView && !prefersReducedMotion) {
      const timer = setTimeout(() => setAnimationComplete(true), 300);
      return () => clearTimeout(timer);
    } else if (prefersReducedMotion) {
      setAnimationComplete(true);
    }
  }, [isInView, prefersReducedMotion]);

  const yAxisProps = makeYAxis([0, 100], 'Score (%)');
  const xAxisProps = makeXAxis({
    tickFormatter: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  });
  const lineProps = makeLine('#10B981'); // readiness color

  const chartHeight = variant === 'carousel' ? 'h-[200px] md:h-[260px]' : 'h-[200px]';

  // Show empty state if no data
  if (!data || data.length === 0) {
    const emptyStateContent = (
      <EmptyState
        type="readiness"
        metric="readiness"
        onAction={onConnectWearable}
        className="h-[200px] md:h-[260px]"
      />
    );

    if (variant === 'carousel') {
      return (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Readiness Trend</h3>
            <p className="text-sm text-white/70">7-day readiness score trend with performance zones</p>
          </div>
          {emptyStateContent}
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Readiness Trend</CardTitle>
          <CardDescription>7-day readiness score trend with performance zones</CardDescription>
        </CardHeader>
        <CardContent>
          {emptyStateContent}
        </CardContent>
      </Card>
    );
  }

  const chartContent = (
    <div ref={chartRef}>
      <ChartContainer config={chartConfig} className={chartHeight}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              {...xAxisProps}
            />
            <YAxis 
              {...yAxisProps}
            />
            
            {/* Reference lines for readiness zones */}
            {referenceLines.readiness.map((line, index) => (
              <ReferenceLine 
                key={index}
                y={line.value}
                stroke={line.color}
                strokeDasharray={line.strokeDasharray}
                strokeOpacity={0.7}
              />
            ))}
            
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => [formatWithUnit(Number(value), '%'), name]}
              />} 
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              {...lineProps}
              strokeDasharray={!animationComplete && !prefersReducedMotion ? "5 5" : "0"}
              strokeDashoffset={!animationComplete && !prefersReducedMotion ? "1000" : "0"}
              style={{
                strokeDashoffset: !animationComplete && !prefersReducedMotion ? "1000" : "0",
                transition: "stroke-dashoffset 1.5s ease-in-out"
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );

  if (variant === 'carousel') {
    return (
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Readiness Trend</h3>
          <p className="text-sm text-white/70">7-day readiness score trend with performance zones</p>
        </div>
        {chartContent}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness Trend</CardTitle>
        <CardDescription>7-day readiness score trend with performance zones</CardDescription>
      </CardHeader>
      <CardContent>
        {chartContent}
      </CardContent>
    </Card>
  );
};
