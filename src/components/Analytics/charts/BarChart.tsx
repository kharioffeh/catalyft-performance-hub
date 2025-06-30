
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { BaseChartProps } from './types';
import { chartConfig } from './chartConfig';
import { transformDataForChart, formatXAxis } from './chartUtils';
import { chartTheme, makeYAxis, makeXAxis } from '@/lib/chartTheme';

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
  const yAxisProps = makeYAxis();
  const xAxisProps = makeXAxis({
    tickFormatter: (value) => formatXAxis(value, isHourlyView),
    interval: isHourlyView ? 3 : 'preserveStartEnd'
  });

  if (stacked) {
    return (
      <div className={className}>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart data={chartData}>
              <XAxis 
                dataKey="date" 
                {...xAxisProps}
              />
              <YAxis {...yAxisProps} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="deep" stackId="sleep" fill={chartTheme.colors.info} name="Deep" />
              <Bar dataKey="light" stackId="sleep" fill={chartTheme.colors.accent} name="Light" />
              <Bar dataKey="rem" stackId="sleep" fill={chartTheme.colors.positive} name="REM" />
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
                {...xAxisProps}
              />
              <YAxis {...yAxisProps} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="acute" fill={chartTheme.colors.warning} name="Acute" />
              <Bar dataKey="chronic" fill={chartTheme.colors.info} name="Chronic" />
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
              {...xAxisProps}
            />
            <YAxis {...yAxisProps} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill={chartTheme.colors.accent} />
          </RechartsBarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
