import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui';
import { StressGauge } from '@/components/Dashboard/StressGauge';
import { useStress } from '@/hooks/useStress';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';

interface StressChartProps {
  variant?: 'carousel' | 'standalone';
  onConnectWearable?: () => void;
}

export const StressChart: React.FC<StressChartProps> = ({ 
  variant = 'standalone',
  onConnectWearable 
}) => {
  const navigate = useNavigate();
  const { data: stressData, isLoading } = useStress();

  if (isLoading) {
    return (
      <GlassCard className="p-6 h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </GlassCard>
    );
  }

  if (!stressData) {
    return (
      <GlassCard className="p-6 h-[400px] flex flex-col items-center justify-center text-center">
        <Activity className="w-12 h-12 text-white/40 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Stress Data</h3>
        <p className="text-white/60 text-sm mb-4">
          Connect your wearable to see stress analysis
        </p>
        {onConnectWearable && (
          <Button onClick={onConnectWearable} variant="outline" size="sm">
            Connect Wearable
          </Button>
        )}
      </GlassCard>
    );
  }

  const getStressColor = (value: number) => {
    if (value <= 30) return '#22c55e'; // Green
    if (value <= 60) return '#eab308'; // Yellow  
    return '#ef4444'; // Red
  };

  const handleViewDetails = () => {
    navigate('/analytics');
  };

  return (
    <GlassCard className={`p-6 ${variant === 'carousel' ? 'h-full' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Daily Stress</h3>
          <p className="text-white/60 text-sm">Current stress level and trends</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Stress Gauge */}
        <div className="flex flex-col items-center justify-center">
          <StressGauge value={stressData.current} size="regular" />
          <div className="text-center mt-3">
            <div className="text-white/60 text-sm">Current Level</div>
            <div className={`font-medium ${
              stressData.level === 'low' ? 'text-green-400' :
              stressData.level === 'moderate' ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {stressData.level.charAt(0).toUpperCase() + stressData.level.slice(1)}
            </div>
          </div>
        </div>

        {/* Stress Trend Chart */}
        <div className="lg:col-span-2 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stressData.dailyReadings}>
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
                formatter={(value: any) => [`${value}`, 'Stress Level']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{stressData.average7d}</div>
          <div className="text-white/60 text-xs">7-Day Average</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${
            stressData.trend === 'decreasing' ? 'text-green-400' : 
            stressData.trend === 'increasing' ? 'text-red-400' : 'text-white'
          }`}>
            {stressData.trend === 'decreasing' ? '↓' : 
             stressData.trend === 'increasing' ? '↑' : '→'}
          </div>
          <div className="text-white/60 text-xs">Trend</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">
            {Math.max(...stressData.dailyReadings.map(r => r.value))}
          </div>
          <div className="text-white/60 text-xs">7-Day Peak</div>
        </div>
      </div>
    </GlassCard>
  );
};