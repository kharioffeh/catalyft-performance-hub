
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { chartTheme, makeLine, makeYAxis, makeXAxis, referenceLines, formatWithUnit } from '@/lib/chartTheme';

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
    color: chartTheme.colors.accent,
  },
};

export const ReadinessChart: React.FC<ReadinessChartProps> = ({ data }) => {
  const yAxisProps = makeYAxis([0, 100], 'Score (%)');
  const xAxisProps = makeXAxis({
    tickFormatter: (value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  });
  const lineProps = makeLine(chartTheme.colors.accent);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness Trend</CardTitle>
        <CardDescription>7-day readiness score trend with performance zones</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
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
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
