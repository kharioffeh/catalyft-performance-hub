
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LightweightLineChart } from '@/components/charts';
import { format } from 'date-fns';
import { EmptyState } from '@/components/ui/EmptyState';

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
  variant?: 'default' | 'carousel';
  onLogWorkout?: () => void;
}

export const EnhancedTrainingLoadChart: React.FC<EnhancedTrainingLoadChartProps> = ({ 
  data, 
  variant = 'default',
  onLogWorkout 
}) => {
  const chartHeight = variant === 'carousel' ? 'h-[200px] md:h-[260px]' : 'h-[300px]';

  // Show empty state if no data
  if (!data || data.length === 0) {
    const emptyStateContent = (
      <EmptyState
        type="load"
        metric="load"
        onAction={onLogWorkout}
        className="h-[200px] md:h-[260px]"
      />
    );

    if (variant === 'carousel') {
      return (
        <div>
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white">Training Load & ACWR</h3>
            <p className="text-sm text-white/70">Daily load with Acute:Chronic Workload Ratio and risk zones</p>
          </div>
          {emptyStateContent}
        </div>
      );
    }

    return (
      <Card>
        <CardHeader>
          <CardTitle>Training Load & ACWR</CardTitle>
          <CardDescription>Daily training load with Acute:Chronic Workload Ratio and risk zones</CardDescription>
        </CardHeader>
        <CardContent>
          {emptyStateContent}
        </CardContent>
      </Card>
    );
  }

  const formattedData = data.map(item => ({
    x: format(new Date(item.day), 'MMM dd'),
    y: item.daily_load,
    acwr_display: item.acwr_7_28 ? Number(item.acwr_7_28.toFixed(2)) : 0
  }));

  const chartContent = (
    <div className={chartHeight}>
      <LightweightLineChart
        data={formattedData}
        width={400}
        height={variant === 'carousel' ? 200 : 300}
        color="#F59E0B"
        showDots={true}
        className="w-full h-full"
      />
    </div>
  );

  const statsContent = (
    <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
      <div className="text-center">
        <div className="font-medium text-white/70">Current Load</div>
        <div className="text-lg font-bold text-load">
          {formattedData[formattedData.length - 1]?.y?.toFixed(0) || 0}
        </div>
      </div>
      <div className="text-center">
        <div className="font-medium text-white/70">ACWR</div>
        <div className={`text-lg font-bold`} style={{ 
          color: formattedData[formattedData.length - 1]?.acwr_display > 1.5 ? '#F43F5E' :
                 formattedData[formattedData.length - 1]?.acwr_display > 1.3 ? '#F59E0B' : 
                 '#10B981'
        }}>
          {formattedData[formattedData.length - 1]?.acwr_display?.toFixed(2) || '0.00'}
        </div>
      </div>
      <div className="text-center">
        <div className="font-medium text-white/70">Acute Load</div>
        <div className="text-lg font-bold text-load">
          {data[data.length - 1]?.acute_7d?.toFixed(0) || 0}
        </div>
      </div>
    </div>
  );

  if (variant === 'carousel') {
    return (
      <div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">Training Load & ACWR</h3>
          <p className="text-sm text-white/70">Daily load with Acute:Chronic Workload Ratio and risk zones</p>
        </div>
        {chartContent}
        {statsContent}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Load & ACWR</CardTitle>
        <CardDescription>Daily training load with Acute:Chronic Workload Ratio and risk zones</CardDescription>
      </CardHeader>
      <CardContent>
        {chartContent}
        {statsContent}
      </CardContent>
    </Card>
  );
};
