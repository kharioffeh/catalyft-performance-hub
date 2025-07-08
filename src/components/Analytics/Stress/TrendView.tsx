import React from 'react';
import { StressGauge } from '@/components/Dashboard/StressGauge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui';
import { StressData } from '@/hooks/useStress';

interface TrendViewProps {
  data: StressData | undefined;
  period: number;
  isLoading: boolean;
}

export const TrendView: React.FC<TrendViewProps> = ({ data, period, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-64 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getStressColor = (value: number) => {
    if (value <= 30) return '#22c55e'; // Green
    if (value <= 60) return '#eab308'; // Yellow
    return '#ef4444'; // Red
  };

  const getStressLevel = (value: number) => {
    if (value <= 30) return 'Low';
    if (value <= 60) return 'Moderate';
    return 'High';
  };

  return (
    <div className="space-y-6">
      {/* Current Stress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 text-center">
          <h3 className="text-lg font-semibold text-white mb-4">Current Stress</h3>
          <StressGauge value={data.current} size="large" />
          <p className="text-white/70 mt-2">
            {getStressLevel(data.current)} - {data.current}/100
          </p>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">7-Day Average</h3>
          <div className="text-center">
            <div className="text-3xl font-bold text-white">{data.average7d}</div>
            <p className="text-white/60 text-sm mt-1">Average stress level</p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex justify-between items-center">
              <span className="text-white/70 text-sm">Trend</span>
              <span className={`text-sm font-medium ${
                data.trend === 'decreasing' ? 'text-green-400' : 
                data.trend === 'increasing' ? 'text-red-400' : 'text-white/70'
              }`}>
                {data.trend === 'decreasing' ? '↓ Improving' : 
                 data.trend === 'increasing' ? '↑ Increasing' : '→ Stable'}
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Stress Level</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white/70">Classification</span>
              <span className={`font-medium ${
                data.level === 'low' ? 'text-green-400' :
                data.level === 'moderate' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {data.level.charAt(0).toUpperCase() + data.level.slice(1)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Target Zone</span>
              <span className="text-white">0-60</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Recovery Priority</span>
              <span className={`font-medium ${
                data.current > 70 ? 'text-red-400' : 
                data.current > 50 ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {data.current > 70 ? 'High' : data.current > 50 ? 'Medium' : 'Low'}
              </span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Stress Trend Chart */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Stress Trend ({period} days)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.dailyReadings}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.6)"
                fontSize={12}
                domain={[0, 100]}
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
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>

      {/* Stress Management Tips */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Stress Management Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-white">When Stress is High (60+)</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Focus on breathing exercises</li>
              <li>• Reduce training intensity</li>
              <li>• Prioritize sleep quality</li>
              <li>• Consider meditation or yoga</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-white">When Stress is Optimal (30-60)</h4>
            <ul className="text-white/70 text-sm space-y-1">
              <li>• Maintain current routine</li>
              <li>• Regular moderate exercise</li>
              <li>• Balanced nutrition</li>
              <li>• Consistent sleep schedule</li>
            </ul>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};