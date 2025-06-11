
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ScatterChart as RechartsScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { BaseChartProps } from './types';
import { chartConfig } from './chartConfig';
import { transformDataForChart } from './chartUtils';

export const ScatterChart: React.FC<BaseChartProps> = ({
  data,
  className = ""
}) => {
  const chartData = transformDataForChart(data);

  return (
    <div className={className}>
      <ChartContainer config={chartConfig} className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsScatterChart data={chartData}>
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
          </RechartsScatterChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
