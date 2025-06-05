
import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import { Card, CardContent } from '@/components/ui/card';

interface MiniSparkProps {
  data?: Array<{ x: string; y: number }>;
  color: string;
  label: string;
}

export const MiniSpark: React.FC<MiniSparkProps> = ({ data, color, label }) => {
  // Transform data for recharts format
  const chartData = data?.map(point => ({
    value: point.y,
    date: point.x
  })) || [];

  return (
    <Card className="bg-white rounded-xl shadow">
      <CardContent className="p-3">
        <p className="text-xs text-gray-500 mb-2 font-medium">{label}</p>
        <div className="h-16">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  strokeWidth={2}
                  dot={false}
                  fill={color}
                  fillOpacity={0.3}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400 text-xs">
              No data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
