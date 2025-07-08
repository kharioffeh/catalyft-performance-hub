import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniSparklineProps {
  data: Array<{ value: number }>;
  color?: string;
  trend?: 'up' | 'down' | 'stable';
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({ 
  data, 
  color = '#10b981',
  trend = 'stable'
}) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="flex items-center space-x-2">
      <div className="w-16 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke={color}
              strokeWidth={1.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className={`text-xs font-medium ${
        trend === 'up' ? 'text-green-400' : 
        trend === 'down' ? 'text-red-400' : 'text-white/60'
      }`}>
        {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
      </div>
    </div>
  );
};