
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format } from 'date-fns';

interface ACWRLoadChartProps {
  data: any[];
  isHourlyView?: boolean;
  className?: string;
}

export const ACWRLoadChart: React.FC<ACWRLoadChartProps> = ({ 
  data, 
  isHourlyView = false,
  className = "" 
}) => {
  const formatXAxisLabel = (tickItem: string) => {
    try {
      const date = new Date(tickItem);
      return isHourlyView ? format(date, 'HH:mm') : format(date, 'MM/dd');
    } catch {
      return tickItem;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const date = new Date(label);
      const formattedDate = isHourlyView ? 
        format(date, 'MMM dd, HH:mm') : 
        format(date, 'MMM dd, yyyy');

      return (
        <div className="bg-black/80 border border-white/10 rounded-lg p-3 text-white text-sm">
          <p className="font-medium mb-2">{formattedDate}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value?.toFixed(1)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`w-full h-40 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          
          <XAxis 
            dataKey="day"
            tickFormatter={formatXAxisLabel}
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
            interval="preserveStartEnd"
          />
          
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
            tickCount={4}
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          {/* Reference lines for optimal zones */}
          <ReferenceLine 
            y={300} 
            stroke="rgba(34, 197, 94, 0.5)" 
            strokeDasharray="2 2" 
            label={{ value: "Optimal", position: "topRight", fill: "rgba(34, 197, 94, 0.7)" }}
          />
          
          <Line
            type="monotone"
            dataKey="acute_7d"
            stroke="#f97316"
            strokeWidth={2}
            name="7-day Load"
            dot={{ fill: '#f97316', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, fill: '#f97316' }}
          />
          
          <Line
            type="monotone"
            dataKey="chronic_28d"
            stroke="#3b82f6"
            strokeWidth={2}
            name="28-day Load"
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, fill: '#3b82f6' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
