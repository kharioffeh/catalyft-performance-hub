
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

interface AthleteChartProps {
  athleteId: string;
  isVisible: boolean;
}

interface ChartData {
  date: string;
  readiness: number | null;
  acute_load: number | null;
}

const chartConfig = {
  readiness: {
    label: 'Readiness',
    color: '#3b82f6',
  },
  acute_load: {
    label: 'Acute Load',
    color: '#ef4444',
  },
};

export const AthleteChart: React.FC<AthleteChartProps> = ({
  athleteId,
  isVisible,
}) => {
  const { data: chartData, isLoading } = useQuery({
    queryKey: ['athleteChart', athleteId],
    queryFn: async () => {
      // Get readiness data for the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: readinessData } = await supabase
        .from('readiness_scores')
        .select('score, ts')
        .eq('athlete_uuid', athleteId)
        .gte('ts', sevenDaysAgo.toISOString())
        .order('ts', { ascending: true });

      // Get load data
      const { data: loadData } = await supabase
        .from('wearable_raw')
        .select('value, ts')
        .eq('athlete_uuid', athleteId)
        .eq('metric', 'external_load')
        .gte('ts', sevenDaysAgo.toISOString())
        .order('ts', { ascending: true });

      // Combine data by date
      const dateMap = new Map<string, ChartData>();

      // Initialize with the last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        dateMap.set(dateStr, {
          date: dateStr,
          readiness: null,
          acute_load: null,
        });
      }

      // Add readiness data
      readinessData?.forEach((item) => {
        const dateStr = format(new Date(item.ts), 'yyyy-MM-dd');
        const existing = dateMap.get(dateStr);
        if (existing) {
          existing.readiness = item.score;
        }
      });

      // Calculate daily load and add to chart data
      const dailyLoads = new Map<string, number>();
      loadData?.forEach((item) => {
        const dateStr = format(new Date(item.ts), 'yyyy-MM-dd');
        const existing = dailyLoads.get(dateStr) || 0;
        dailyLoads.set(dateStr, existing + item.value);
      });

      dailyLoads.forEach((load, dateStr) => {
        const existing = dateMap.get(dateStr);
        if (existing) {
          existing.acute_load = load;
        }
      });

      return Array.from(dateMap.values()).map(item => ({
        ...item,
        displayDate: format(new Date(item.date), 'MMM dd'),
      }));
    },
    enabled: !!athleteId && isVisible,
  });

  if (!isVisible) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No trend data available for this athlete
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="displayDate" 
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
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="readiness"
            stroke={chartConfig.readiness.color}
            strokeWidth={2}
            dot={{ fill: chartConfig.readiness.color, strokeWidth: 2 }}
            connectNulls={false}
            name="Readiness (%)"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="acute_load"
            stroke={chartConfig.acute_load.color}
            strokeWidth={2}
            dot={{ fill: chartConfig.acute_load.color, strokeWidth: 2 }}
            connectNulls={false}
            name="Daily Load"
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
