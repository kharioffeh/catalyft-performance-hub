
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { BaseChartProps } from './types';
import { chartConfig } from './chartConfig';
import { transformDataForChart, formatXAxis } from './chartUtils';

interface BarChartProps extends BaseChartProps {
  multiSeries?: boolean;
  stacked?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  multiSeries = false,
  stacked = false,
  isHourlyView = false,
  className = ""
}) => {
  const chartData = transformDataForChart(data);

  if (stacked) {
    return (
      <div className={className}>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatXAxis(value, isHourlyView)}
                interval={isHourlyView ? 3 : 'preserveStartEnd'}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="deep" stackId="sleep" fill="var(--color-deep)" name="Deep" />
              <Bar dataKey="light" stackId="sleep" fill="var(--color-light)" name="Light" />
              <Bar dataKey="rem" stackId="sleep" fill="var(--color-rem)" name="REM" />
            </RechartsBarChart>
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
            <RechartsBarChart data={chartData}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(value) => formatXAxis(value, isHourlyView)}
                interval={isHourlyView ? 3 : 'preserveStartEnd'}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="acute" fill="var(--color-acute)" name="Acute" />
              <Bar dataKey="chronic" fill="var(--color-chronic)" name="Chronic" />
            </RechartsBarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    );
  }

  return (
    <div className={className}>
      <ChartContainer config={chartConfig} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={chartData}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => formatXAxis(value, isHourlyView)}
              interval={isHourlyView ? 3 : 'preserveStartEnd'}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" />
          </RechartsBarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
