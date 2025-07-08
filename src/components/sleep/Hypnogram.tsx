import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LightweightBarChart } from '@/components/charts/LightweightBarChart';
import { SleepStage } from '@/hooks/useSleep';

interface HypnogramProps {
  stages: SleepStage[];
  className?: string;
}

const stageColors = {
  awake: '#ef4444',    // red
  light: '#3b82f6',    // blue
  deep: '#1d4ed8',     // dark blue
  rem: '#8b5cf6'       // purple
};

const stageLabels = {
  awake: 'Awake',
  light: 'Light',
  deep: 'Deep',
  rem: 'REM'
};

const stageValues = {
  awake: 4,
  light: 2,
  deep: 1,
  rem: 3
};

export const Hypnogram: React.FC<HypnogramProps> = ({
  stages,
  className = ''
}) => {
  // Transform stages data for the chart
  const chartData = stages.map((stage, index) => ({
    x: stage.time,
    y: stageValues[stage.stage],
    value: stageValues[stage.stage],
    label: stage.time,
    stage: stage.stage,
    duration: stage.duration
  }));

  // Calculate stage statistics
  const stageStats = stages.reduce((acc, stage) => {
    acc[stage.stage] = (acc[stage.stage] || 0) + stage.duration;
    return acc;
  }, {} as Record<string, number>);

  const totalMinutes = Object.values(stageStats).reduce((sum, minutes) => sum + minutes, 0);

  const getStagePercentage = (stage: keyof typeof stageStats) => {
    const minutes = stageStats[stage] || 0;
    return Math.round((minutes / totalMinutes) * 100);
  };

  return (
    <Card className={`bg-white/5 border-white/10 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-white">
          Sleep Stages (Hypnogram)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sleep Stages Chart */}
        <div className="relative">
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-white/60 -ml-12">
            <span>Awake</span>
            <span>REM</span>
            <span>Light</span>
            <span>Deep</span>
          </div>
          
          {/* Chart */}
          <div className="ml-4">
            <LightweightBarChart
              data={chartData}
              width={600}
              height={200}
              color="#3b82f6"
              showGrid={false}
              className="text-white/40"
            />
          </div>
          
          {/* Time labels */}
          <div className="flex justify-between text-xs text-white/60 mt-2 ml-4">
            <span>10:30 PM</span>
            <span>2:00 AM</span>
            <span>5:30 AM</span>
            <span>7:00 AM</span>
          </div>
        </div>

        {/* Stage Legend and Stats */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(stageLabels).map(([stage, label]) => {
            const minutes = stageStats[stage as keyof typeof stageStats] || 0;
            const percentage = getStagePercentage(stage as keyof typeof stageStats);
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            
            return (
              <div key={stage} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: stageColors[stage as keyof typeof stageColors] }}
                  />
                  <span className="text-sm text-white/80">{label}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {hours > 0 ? `${hours}h ${remainingMinutes}m` : `${remainingMinutes}m`}
                  </div>
                  <div className="text-xs text-white/60">{percentage}%</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Sleep Quality Indicators */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">Deep Sleep</span>
            <Badge 
              className={`${getStagePercentage('deep') >= 20 ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'} border-0`}
            >
              {getStagePercentage('deep')}% 
              {getStagePercentage('deep') >= 20 ? ' Good' : ' Low'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/70">REM Sleep</span>
            <Badge 
              className={`${getStagePercentage('rem') >= 20 ? 'bg-green-500/20 text-green-300' : 'bg-orange-500/20 text-orange-300'} border-0`}
            >
              {getStagePercentage('rem')}%
              {getStagePercentage('rem') >= 20 ? ' Good' : ' Low'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};