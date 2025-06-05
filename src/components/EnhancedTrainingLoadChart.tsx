
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';

interface LoadData {
  athlete_uuid: string;
  day: string;
  daily_load: number;
  acute_7d: number;
  chronic_28d: number;
  acwr_7_28: number;
}

interface EnhancedTrainingLoadChartProps {
  data: LoadData[];
}

const chartConfig = {
  daily_load: {
    label: "Daily Load",
    color: "hsl(var(--chart-1))",
  },
  acwr_7_28: {
    label: "ACWR (7:28)",
    color: "hsl(var(--chart-2))",
  },
  acute_7d: {
    label: "Acute Load (7d)",
    color: "hsl(var(--chart-3))",
  },
};

export const EnhancedTrainingLoadChart: React.FC<EnhancedTrainingLoadChartProps> = ({ data }) => {
  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.day), 'MMM dd'),
    acwr_display: item.acwr_7_28 ? Number(item.acwr_7_28.toFixed(2)) : 0
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Load & ACWR</CardTitle>
        <CardDescription>Daily training load with Acute:Chronic Workload Ratio</CardDescription>
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
                label={{ value: 'Load', angle: -90, position: 'insideLeft' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 2]}
                label={{ value: 'ACWR', angle: 90, position: 'insideRight' }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="daily_load"
                stroke={chartConfig.daily_load.color}
                strokeWidth={2}
                dot={{ fill: chartConfig.daily_load.color, strokeWidth: 2 }}
                name="Daily Load"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="acute_7d"
                stroke={chartConfig.acute_7d.color}
                strokeWidth={1}
                strokeDasharray="5 5"
                dot={false}
                name="Acute Load (7d)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="acwr_display"
                stroke={chartConfig.acwr_7_28.color}
                strokeWidth={3}
                dot={{ fill: chartConfig.acwr_7_28.color, strokeWidth: 2 }}
                name="ACWR (7:28)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Current Load</div>
            <div className="text-lg font-bold text-blue-600">
              {formattedData[formattedData.length - 1]?.daily_load?.toFixed(0) || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">ACWR</div>
            <div className={`text-lg font-bold ${
              formattedData[formattedData.length - 1]?.acwr_display > 1.5 ? 'text-red-600' :
              formattedData[formattedData.length - 1]?.acwr_display > 1.3 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {formattedData[formattedData.length - 1]?.acwr_display?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Acute Load</div>
            <div className="text-lg font-bold text-purple-600">
              {formattedData[formattedData.length - 1]?.acute_7d?.toFixed(0) || 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
