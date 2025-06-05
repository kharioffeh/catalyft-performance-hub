
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

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
    color: "hsl(var(--chart-1))",
  },
  total_sleep_hours: {
    label: "Sleep Duration (hrs)",
    color: "hsl(var(--chart-2))",
  },
  hrv_rmssd: {
    label: "HRV (ms)",
    color: "hsl(var(--chart-3))",
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sleep & Recovery Metrics</CardTitle>
        <CardDescription>Sleep efficiency, duration, and HRV trends</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <XAxis 
                dataKey="date" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="left"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                label={{ value: '%', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: 'hrs/ms', angle: 90, position: 'insideRight' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="efficiency"
                stroke={chartConfig.sleep_efficiency.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.sleep_efficiency.color, strokeWidth: 2 }}
                name="Sleep Efficiency (%)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="duration"
                stroke={chartConfig.total_sleep_hours.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.total_sleep_hours.color, strokeWidth: 2 }}
                name="Duration (hrs)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="hrv"
                stroke={chartConfig.hrv_rmssd.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.hrv_rmssd.color, strokeWidth: 2 }}
                name="HRV (ms)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Sleep Efficiency</div>
            <div className="text-lg font-bold text-blue-600">
              {formattedData[formattedData.length - 1]?.efficiency?.toFixed(1) || 0}%
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Duration</div>
            <div className="text-lg font-bold text-green-600">
              {formattedData[formattedData.length - 1]?.duration?.toFixed(1) || 0}h
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">HRV</div>
            <div className="text-lg font-bold text-purple-600">
              {formattedData[formattedData.length - 1]?.hrv?.toFixed(1) || 0}ms
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
