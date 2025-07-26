import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface TonnageData {
  date: string;
  tonnage: number;
}

interface TonnageCardProps {
  data: TonnageData[];
}

export const TonnageCard: React.FC<TonnageCardProps> = ({ data }) => {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-[300px] h-[240px] flex flex-col">
      <h3 className="font-display font-semibold text-lg text-slate-50 mb-4">
        Training Tonnage
      </h3>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getMonth() + 1}/${date.getDate()}`;
              }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}kg`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--popover-foreground))'
              }}
              labelFormatter={(value) => `Date: ${value}`}
              formatter={(value: number) => [`${value}kg`, 'Tonnage']}
            />
            <Line 
              type="monotone" 
              dataKey="tonnage" 
              stroke="hsl(var(--brand-blue))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--brand-blue))', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};