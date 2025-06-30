
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { chartTheme, makeLine, makeYAxis, makeXAxis, referenceLines, createTooltipFormatter } from '@/lib/chartTheme';

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
}

const chartConfig = {
  sleep_efficiency: {
    label: "Sleep Efficiency (%)",
    color: chartTheme.colors.positive,
  },
  total_sleep_hours: {
    label: "Sleep Duration (hrs)",
    color: chartTheme.colors.accent,
  },
  hrv_rmssd: {
    label: "HRV (ms)",
    color: chartTheme.colors.info,
  },
};

export const EnhancedSleepChart: React.FC<EnhancedSleepChartProps> = ({ data }) => {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep & Recovery Metrics</CardTitle>
        <CardDescription>Sleep efficiency, duration, and HRV trends with optimal zones</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
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
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="efficiency"
                {...makeLine(chartConfig.sleep_efficiency.color)}
                name="Sleep Efficiency (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="duration"
                {...makeLine(chartConfig.total_sleep_hours.color)}
                name="Duration (hrs)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="hrv"
                {...makeLine(chartConfig.hrv_rmssd.color)}
                name="HRV (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Sleep Efficiency</div>
            <div className="text-lg font-bold" style={{ color: chartTheme.colors.positive }}>
              {formattedData[formattedData.length - 1]?.efficiency?.toFixed(1) || 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Duration</div>
            <div className="text-lg font-bold" style={{ color: chartTheme.colors.accent }}>
              {formattedData[formattedData.length - 1]?.duration?.toFixed(1) || 0}h
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">HRV</div>
            <div className="text-lg font-bold" style={{ color: chartTheme.colors.info }}>
              {formattedData[formattedData.length - 1]?.hrv?.toFixed(1) || 0}ms
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
