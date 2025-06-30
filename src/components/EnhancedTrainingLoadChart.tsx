
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { format } from 'date-fns';
import { chartTheme, makeLine, makeYAxis, makeXAxis, referenceLines, createTooltipFormatter } from '@/lib/chartTheme';

interface LoadData {
  athlete_uuid: string;
  day: string;
  daily_load: number;
  acute_7d: number;
  chronic_28d: number;
  acwr_7_28: number;
}

interface EnhancedTrainingLoadChartProps {
  data: LoadData[];
}

const chartConfig = {
  daily_load: {
    label: "Daily Load",
    color: chartTheme.colors.accent,
  },
  acwr_7_28: {
    label: "ACWR (7:28)",
    color: chartTheme.colors.info,
  },
  acute_7d: {
    label: "Acute Load (7d)",
    color: chartTheme.colors.warning,
  },
};

export const EnhancedTrainingLoadChart: React.FC<EnhancedTrainingLoadChartProps> = ({ data }) => {
  const formattedData = data.map(item => ({
    ...item,
    date: format(new Date(item.day), 'MMM dd'),
    acwr_display: item.acwr_7_28 ? Number(item.acwr_7_28.toFixed(2)) : 0
  }));

  const tooltipFormatter = createTooltipFormatter({
    daily_load: '',
    acute_7d: '',
    acwr_display: ''
  });

  const xAxisProps = makeXAxis();
  const leftYAxisProps = makeYAxis(undefined, 'Load');
  const rightYAxisProps = makeYAxis([0, 2], 'ACWR');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Load & ACWR</CardTitle>
        <CardDescription>Daily training load with Acute:Chronic Workload Ratio and risk zones</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <XAxis 
                dataKey="date" 
                {...xAxisProps}
              />
              <YAxis 
                yAxisId="left"
                {...leftYAxisProps}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                {...rightYAxisProps}
              />

              {/* ACWR reference lines */}
              {referenceLines.acwr.map((line, index) => (
                <ReferenceLine 
                  key={index}
                  yAxisId="right"
                  y={line.value}
                  stroke={line.color}
                  strokeDasharray={line.strokeDasharray}
                  strokeOpacity={0.7}
                />
              ))}
              
              <ChartTooltip 
                content={<ChartTooltipContent formatter={tooltipFormatter} />} 
              />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="daily_load"
                {...makeLine(chartConfig.daily_load.color)}
                name="Daily Load"
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="acute_7d"
                {...makeLine(chartConfig.acute_7d.color, { strokeDasharray: "5 5", dot: false })}
                name="Acute Load (7d)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="acwr_display"
                {...makeLine(chartConfig.acwr_7_28.color, { strokeWidth: 3 })}
                name="ACWR (7:28)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium">Current Load</div>
            <div className="text-lg font-bold" style={{ color: chartTheme.colors.accent }}>
              {formattedData[formattedData.length - 1]?.daily_load?.toFixed(0) || 0}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">ACWR</div>
            <div className={`text-lg font-bold`} style={{ 
              color: formattedData[formattedData.length - 1]?.acwr_display > 1.5 ? chartTheme.colors.negative :
                     formattedData[formattedData.length - 1]?.acwr_display > 1.3 ? chartTheme.colors.warning : 
                     chartTheme.colors.positive
            }}>
              {formattedData[formattedData.length - 1]?.acwr_display?.toFixed(2) || '0.00'}
            </div>
          </div>
          <div className="text-center">
            <div className="font-medium">Acute Load</div>
            <div className="text-lg font-bold" style={{ color: chartTheme.colors.warning }}>
              {formattedData[formattedData.length - 1]?.acute_7d?.toFixed(0) || 0}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
