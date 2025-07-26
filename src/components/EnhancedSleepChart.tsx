
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui';
import { SleepGauge } from '@/components/Dashboard/SleepGauge';
import { Button } from '@/components/ui/button';
import { Moon } from 'lucide-react';
import { format } from 'date-fns';

interface SleepData {
  athlete_uuid: string;
  day: string;
  total_sleep_hours: number;
  sleep_efficiency: number;
  avg_sleep_hr: number;
  hrv_rmssd: number;
  light_sleep_hours?: number;
  deep_sleep_hours?: number;
  rem_sleep_hours?: number;
  awake_hours?: number;
}

interface EnhancedSleepChartProps {
  data: SleepData[];
  variant?: 'default' | 'carousel';
  onConnectWearable?: () => void;
}

export const EnhancedSleepChart: React.FC<EnhancedSleepChartProps> = ({ 
  data, 
  variant = 'default',
  onConnectWearable 
}) => {
  const navigate = useNavigate();

  if (!data || data.length === 0) {
    return (
      <GlassCard className="p-6 h-[400px] flex flex-col items-center justify-center text-center">
        <Moon className="w-12 h-12 text-white/40 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Sleep Data</h3>
        <p className="text-white/60 text-sm mb-4">
          Connect your wearable to see your sleep analysis
        </p>
        {onConnectWearable && (
          <Button onClick={onConnectWearable} variant="outline" size="sm">
            Connect Wearable
          </Button>
        )}
      </GlassCard>
    );
  }

  const latestData = data[data.length - 1];
  const currentEfficiency = latestData?.sleep_efficiency || 0;
  const currentDuration = latestData?.total_sleep_hours || 0;
  const currentHRV = latestData?.hrv_rmssd || 0;

  const getSleepQuality = (efficiency: number) => {
    if (efficiency >= 85) return 'Excellent';
    if (efficiency >= 70) return 'Good';
    return 'Poor';
  };

  const handleViewDetails = () => {
    navigate('/analytics');
  };

  // Generate sleep phase data from total sleep hours
  const formattedData = data.map(item => {
    const totalHours = item.total_sleep_hours || 0;
    // Estimate sleep phases if not provided
    const awake = item.awake_hours || totalHours * 0.05; // 5% awake
    const light = item.light_sleep_hours || totalHours * 0.50; // 50% light
    const deep = item.deep_sleep_hours || totalHours * 0.25; // 25% deep
    const rem = item.rem_sleep_hours || totalHours * 0.20; // 20% REM
    
    return {
      date: format(new Date(item.day), 'MMM dd'),
      awake,
      light,
      deep,
      rem,
      total: totalHours
    };
  });

  return (
    <GlassCard className={`p-6 ${variant === 'carousel' ? 'h-full' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Sleep & Recovery</h3>
          <p className="text-white/60 text-sm">Sleep efficiency, duration, and HRV analysis</p>
        </div>
      </div>

      <div className="flex flex-col space-y-6">
        {/* Current Sleep Gauge */}
        <div className="flex flex-col items-center justify-center">
          <SleepGauge value={currentEfficiency} size="regular" />
          <div className="text-center mt-3">
            <div className="text-white/60 text-sm">Sleep Quality</div>
            <div className={`font-medium ${
              currentEfficiency >= 85 ? 'text-green-400' :
              currentEfficiency >= 70 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {getSleepQuality(currentEfficiency)}
            </div>
          </div>
        </div>

        {/* Sleep Phases Bar Chart */}
        <div className="h-80 px-0 pb-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedData} margin={{ top: 10, right: 10, left: 15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={8}
                tick={{ fontSize: 8, dy: 3 }}
                axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                tickLine={false}
                height={15}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={8}
                tick={{ fontSize: 8, dx: -2 }}
                axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                tickLine={false}
                width={20}
                domain={[0, 10]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '11px'
                }}
                formatter={(value: any, name: string) => [`${value.toFixed(1)}h`, name]}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar dataKey="rem" stackId="sleep" fill="hsl(142, 76%, 36%)" name="REM" />
              <Bar dataKey="deep" stackId="sleep" fill="hsl(258, 90%, 66%)" name="Deep (SWS)" />
              <Bar dataKey="light" stackId="sleep" fill="hsl(213, 93%, 68%)" name="Light" />
              <Bar dataKey="awake" stackId="sleep" fill="hsl(0, 84%, 60%)" name="Awake" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{currentEfficiency.toFixed(1)}%</div>
          <div className="text-white/60 text-xs">Sleep Efficiency</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{currentDuration.toFixed(1)}h</div>
          <div className="text-white/60 text-xs">Duration</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">{currentHRV.toFixed(1)}ms</div>
          <div className="text-white/60 text-xs">HRV</div>
        </div>
      </div>
    </GlassCard>
  );
};
