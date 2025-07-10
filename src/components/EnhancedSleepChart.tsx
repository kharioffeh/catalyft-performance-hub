
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
          Connect your wearable to see sleep analysis
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

  const formattedData = data.map(item => ({
    date: format(new Date(item.day), 'MMM dd'),
    efficiency: item.sleep_efficiency || 0,
    duration: item.total_sleep_hours || 0,
    hrv: item.hrv_rmssd || 0
  }));

  return (
    <GlassCard className={`p-6 ${variant === 'carousel' ? 'h-[400px]' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Sleep & Recovery</h3>
          <p className="text-white/60 text-sm">Sleep efficiency, duration, and HRV analysis</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

        {/* Sleep Trend Chart */}
        <div className="lg:col-span-2 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={10}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={10}
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white'
                }}
                formatter={(value: any) => [`${value}%`, 'Sleep Efficiency']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="efficiency" 
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
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
