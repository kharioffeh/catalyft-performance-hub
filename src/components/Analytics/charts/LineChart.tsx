
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BaseChartProps, Zone } from './types';
import { chartConfig } from './chartConfig';
import { transformDataForChart, formatXAxis } from './chartUtils';
import { chartTheme, makeLine, makeYAxis, makeXAxis } from '@/lib/chartTheme';

interface LineChartProps extends BaseChartProps {
  zones?: Zone[];
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  zones,
  isHourlyView = false,
  className = ""
}) => {
  const chartData = transformDataForChart(data);
  const yAxisProps = makeYAxis(zones ? [0, Math.max(...zones.map(z => z.to))] : undefined);
  const xAxisProps = makeXAxis({
    tickFormatter: (value) => formatXAxis(value, isHourlyView),
    interval: isHourlyView ? 3 : 'preserveStartEnd'
  });
  const lineProps = makeLine(chartTheme.colors.accent, { strokeWidth: 3 });

  return (
    <div className={className}>
      <ChartContainer config={chartConfig} className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              {...xAxisProps}
            />
            <YAxis 
              {...yAxisProps}
            />
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
              {...lineProps}
            />
          </RechartsLineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
