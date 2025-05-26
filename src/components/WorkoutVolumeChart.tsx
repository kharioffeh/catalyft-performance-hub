
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface VolumeData {
  week: string;
  volume: number;
  sessions: number;
}

interface WorkoutVolumeChartProps {
  data: VolumeData[];
}

const chartConfig = {
  volume: {
    label: "Training Volume (hours)",
    color: "hsl(var(--chart-2))",
  },
  sessions: {
    label: "Sessions",
    color: "hsl(var(--chart-3))",
  },
};

export const WorkoutVolumeChart: React.FC<WorkoutVolumeChartProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Volume</CardTitle>
        <CardDescription>Weekly training volume and session count</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="week" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
