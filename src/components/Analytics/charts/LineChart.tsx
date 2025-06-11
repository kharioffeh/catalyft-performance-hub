
import React from 'react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { BaseChartProps, Zone } from './types';
import { chartConfig } from './chartConfig';
import { transformDataForChart, formatXAxis } from './chartUtils';

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

  return (
    <div className={className}>
      <ChartContainer config={chartConfig} className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart data={chartData}>
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => formatXAxis(value, isHourlyView)}
              interval={isHourlyView ? 3 : 'preserveStartEnd'}
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
          </RechartsLineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};
