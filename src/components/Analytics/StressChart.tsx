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

        {/* Intraday Stress Chart - Whoop Style */}
        <div className="h-64 px-2 pb-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stressData.intradayReadings} margin={{ top: 10, right: 20, left: 35, bottom: 30 }}>
              <defs>
                <linearGradient id="stressWhoopGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(48, 96%, 53%)" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.6}/>
                  <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3}/>
                </linearGradient>
              </defs>
              
              {/* Stress zone reference lines */}
              <ReferenceLine y={1.0} stroke="hsl(142, 76%, 36%)" strokeDasharray="2 2" strokeOpacity={0.5} />
              <ReferenceLine y={2.0} stroke="hsl(48, 96%, 53%)" strokeDasharray="2 2" strokeOpacity={0.5} />
              
              <XAxis 
                dataKey="time" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={8}
                tick={{ fontSize: 8, dy: 5 }}
                axisLine={false}
                tickLine={false}
                interval={3} // Show every 4th hour (6AM, 12PM, 6PM, etc.)
                height={20}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={8}
                domain={[0, 3.0]}
                tick={{ fontSize: 8, dx: -5 }}
                axisLine={false}
                tickLine={false}
                width={35}
                tickFormatter={(value) => value.toFixed(1)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '11px',
                  padding: '8px'
                }}
                formatter={(value: any) => [`${value.toFixed(1)}`, 'Stress Level']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(217, 91%, 60%)"
                strokeWidth={1.5}
                fill="url(#stressWhoopGradient)"
                dot={false}
                activeDot={{ r: 3, stroke: 'hsl(217, 91%, 60%)', strokeWidth: 2, fill: 'white' }}
              />
            </AreaChart>
          </ResponsiveContainer>
          
          {/* Stress Zone Labels */}
          <div className="flex justify-between text-xs text-white/60 mt-2 px-2">
            <span>Low (0.0-1.0)</span>
            <span>Moderate (1.0-2.0)</span>
            <span>High (2.0+)</span>
          </div>
        </div>
        
        {/* Stress Insights */}
        <div className="bg-white/5 rounded-lg p-3 mt-4">
          <h4 className="text-sm font-medium text-white mb-2">Today's Stress Summary</h4>
          <div className="text-xs text-white/70 space-y-1">
            <div>• {stressData.stressZones.low}h in low stress (0.0-1.0)</div>
            <div>• {stressData.stressZones.moderate}h in moderate stress (1.0-2.0)</div>
            <div>• {stressData.stressZones.high}h in high stress (2.0+)</div>
            <div className="pt-1 border-t border-white/10 mt-2">
              <span className="capitalize font-medium">{stressData.stressZones.dominant}</span> stress was dominant today
            </div>
          </div>
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