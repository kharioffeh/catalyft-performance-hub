
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Zone {
  from: number;
  to: number;
  color: string;
  label: string;
}

interface MetricChartProps {
  type: "line" | "bar";
  data: Array<{ x: string; y: number; [key: string]: any }>;
  zones?: Zone[];
  xLabel?: string;
  yLabel?: string;
  multiSeries?: boolean;
}

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--chart-1))",
  },
  hrv: {
    label: "HRV",
    color: "hsl(var(--chart-2))",
  },
  sleep: {
    label: "Sleep Quality",
    color: "hsl(var(--chart-3))",
  },
};

export const MetricChart: React.FC<MetricChartProps> = ({
  type,
  data,
  zones,
  xLabel,
  yLabel,
  multiSeries = false
}) => {
  // Transform data for recharts format
  const chartData = data.map(point => ({
    date: point.x,
    value: point.y,
    hrv: point.hrv || 0,
    sleep: point.sleep || 0,
    ...point
  }));

  if (type === "line") {
    return (
      <ChartContainer config={chartConfig} className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis domain={[0, 100]} />
            <ChartTooltip content={<ChartTooltipContent />} />
            
            {/* Zone reference lines */}
            {zones?.map((zone, index) => (
              <ReferenceLine 
                key={index}
                y={zone.from} 
                stroke={zone.color} 
                strokeDasharray="5 5" 
                strokeOpacity={0.5}
              />
            ))}
            
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="var(--color-value)" 
              strokeWidth={3}
              dot={{ fill: "var(--color-value)", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }

  if (type === "bar" && multiSeries) {
    return (
      <ChartContainer config={chartConfig} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="hrv" fill="var(--color-hrv)" name="HRV" />
            <Bar dataKey="sleep" fill="var(--color-sleep)" name="Sleep Quality" />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <XAxis 
            dataKey="date" 
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          />
          <YAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" fill="var(--color-value)" />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};
