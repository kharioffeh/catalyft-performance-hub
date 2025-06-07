
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, ScatterChart, Scatter } from 'recharts';

interface Zone {
  from: number;
  to: number;
  color: string;
  label: string;
}

interface MetricChartProps {
  type: "line" | "bar" | "scatter";
  data: Array<{ x: string; y: number; [key: string]: any }>;
  zones?: Zone[];
  xLabel?: string;
  yLabel?: string;
  multiSeries?: boolean;
  stacked?: boolean;
  className?: string;
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
  deep: {
    label: "Deep",
    color: "#1e40af",
  },
  light: {
    label: "Light",
    color: "#3b82f6",
  },
  rem: {
    label: "REM",
    color: "#60a5fa",
  },
  acute: {
    label: "Acute",
    color: "hsl(var(--chart-2))",
  },
  chronic: {
    label: "Chronic",
    color: "hsl(var(--chart-3))",
  },
};

export const MetricChart: React.FC<MetricChartProps> = ({
  type,
  data,
  zones,
  xLabel,
  yLabel,
  multiSeries = false,
  stacked = false,
  className = ""
}) => {
  // Transform data for recharts format
  const chartData = data.map(point => ({
    date: point.x,
    value: point.y,
    hrv: point.hrv || 0,
    sleep: point.sleep || 0,
    deep: point.deep || 0,
    light: point.light || 0,
    rem: point.rem || 0,
    acute: point.acute || 0,
    chronic: point.chronic || 0,
    ...point
  }));

  if (type === "scatter") {
    return (
      <div className={className}>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={chartData}>
              <XAxis 
                dataKey="x" 
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              />
              <YAxis 
                dataKey="y"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => new Date(value).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Scatter dataKey="y" fill="var(--color-value)" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  }

  if (type === "line") {
    return (
      <div className={className}>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis domain={zones ? [0, Math.max(...zones.map(z => z.to))] : ['auto', 'auto']} />
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
      </div>
    );
  }

  if (type === "bar") {
    if (stacked) {
      return (
        <div className={className}>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="deep" stackId="sleep" fill="var(--color-deep)" name="Deep" />
                <Bar dataKey="light" stackId="sleep" fill="var(--color-light)" name="Light" />
                <Bar dataKey="rem" stackId="sleep" fill="var(--color-rem)" name="REM" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      );
    }

    if (multiSeries) {
      return (
        <div className={className}>
          <ChartContainer config={chartConfig} className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="acute" fill="var(--color-acute)" name="Acute" />
                <Bar dataKey="chronic" fill="var(--color-chronic)" name="Chronic" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      );
    }

    return (
      <div className={className}>
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
      </div>
    );
  }

  return null;
};
