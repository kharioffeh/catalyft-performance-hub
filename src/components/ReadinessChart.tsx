import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { GlassCard } from '@/components/ui';
import { ReadinessGauge } from '@/components/Dashboard/ReadinessGauge';
import { Button } from '@/components/ui/button';
import { Activity } from 'lucide-react';

interface ReadinessData {
  date: string;
  score: number;
}

interface ReadinessChartProps {
  data: ReadinessData[];
  variant?: 'default' | 'carousel';
  onConnectWearable?: () => void;
}

export const ReadinessChart: React.FC<ReadinessChartProps> = ({ 
  data, 
  variant = 'default',
  onConnectWearable 
}) => {
  const navigate = useNavigate();

  if (!data || data.length === 0) {
    return (
      <GlassCard className="p-6 h-[400px] flex flex-col items-center justify-center text-center">
        <Activity className="w-12 h-12 text-white/40 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">No Readiness Data</h3>
        <p className="text-white/60 text-sm mb-4">
          Connect your wearable to see readiness analysis
        </p>
        {onConnectWearable && (
          <Button onClick={onConnectWearable} variant="outline" size="sm">
            Connect Wearable
          </Button>
        )}
      </GlassCard>
    );
  }

  const currentScore = data[data.length - 1]?.score || 0;
  const previousScore = data[data.length - 2]?.score || 0;
  const trend = currentScore > previousScore ? 'increasing' : currentScore < previousScore ? 'decreasing' : 'stable';

  const getReadinessLevel = (score: number) => {
    if (score >= 85) return 'High';
    if (score >= 70) return 'Moderate';
    return 'Low';
  };

  const handleViewDetails = () => {
    navigate('/analytics/readiness');
  };

  return (
    <GlassCard className={`p-6 ${variant === 'carousel' ? 'h-full' : ''}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Readiness Score</h3>
          <p className="text-white/60 text-sm">Current readiness and recovery status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Readiness Gauge */}
        <div className="flex flex-col items-center justify-center">
          <ReadinessGauge value={currentScore} size="regular" />
          <div className="text-center mt-3">
            <div className="text-white/60 text-sm">Current Score</div>
            <div className={`font-medium ${
              currentScore >= 85 ? 'text-green-400' :
              currentScore >= 70 ? 'text-yellow-400' : 'text-red-400'
            }`}>
              {getReadinessLevel(currentScore)}
            </div>
          </div>
        </div>

        {/* Readiness Trend Chart */}
        <div className="lg:col-span-2 h-80 px-0 pb-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: 15, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
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
                domain={[0, 100]}
                tick={{ fontSize: 8, dx: -2 }}
                axisLine={{ stroke: "rgba(255,255,255,0.3)" }}
                tickLine={false}
                width={20}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(7, 7, 7, 0.95)',
                  border: '1px solid rgba(125, 249, 255, 0.25)',
                  borderRadius: '8px',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '11px',
                  backdropFilter: 'blur(8px)'
                }}
                formatter={(value: any) => [`${value}`, 'Readiness Score']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#7DF9FF"
                strokeWidth={3}
                dot={{ fill: '#7DF9FF', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#7DF9FF', fill: 'rgba(7,7,7,0.9)', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-white/10">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{currentScore}</div>
          <div className="text-white/60 text-xs">Current Score</div>
        </div>
        <div className="text-center">
          <div className={`text-lg font-bold ${
            trend === 'increasing' ? 'text-green-400' : 
            trend === 'decreasing' ? 'text-red-400' : 'text-white'
          }`}>
            {trend === 'increasing' ? '↑' : 
             trend === 'decreasing' ? '↓' : '→'}
          </div>
          <div className="text-white/60 text-xs">Trend</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">
            {Math.round(data.reduce((sum, item) => sum + item.score, 0) / data.length)}
          </div>
          <div className="text-white/60 text-xs">7-Day Average</div>
        </div>
      </div>
    </GlassCard>
  );

};
