
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface ReadinessData {
  date: string;
  score: number;
}

interface ReadinessChartProps {
  data: ReadinessData[];
}

const chartConfig = {
  score: {
    label: "Readiness Score",
    color: "hsl(var(--chart-1))",
  },
};

export const ReadinessChart: React.FC<ReadinessChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness Trend</CardTitle>
        <CardDescription>7-day readiness score trend</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={[0, 100]} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="var(--color-score)" 
                strokeWidth={2}
                dot={{ fill: "var(--color-score)", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
