import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
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

      <div className="flex flex-col space-y-6">
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

        {/* Stress Area Chart - Whoop Style */}
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stressData.dailyReadings}>
              <defs>
                <linearGradient id="stressGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              
              {/* Stress zone reference lines */}
              <ReferenceLine y={30} stroke="hsl(142, 76%, 36%)" strokeDasharray="2 2" strokeOpacity={0.6} />
              <ReferenceLine y={60} stroke="hsl(48, 96%, 53%)" strokeDasharray="2 2" strokeOpacity={0.6} />
              
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={10}
                tick={{ fontSize: 10 }}
                axisLine={false}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={10}
                domain={[0, 100]}
                tick={{ fontSize: 10 }}
                axisLine={false}
                label={{ value: 'Stress', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: 'rgba(255,255,255,0.6)' } }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [`${value}`, 'Stress Level']}
                labelFormatter={(label) => `${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(0, 84%, 60%)"
                strokeWidth={2}
                fill="url(#stressGradient)"
                dot={false}
                activeDot={{ r: 4, stroke: 'hsl(0, 84%, 60%)', strokeWidth: 2, fill: 'white' }}
              />
            </AreaChart>
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