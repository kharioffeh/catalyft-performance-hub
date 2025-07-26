import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

interface VelocityFatigueData {
  date: string;
  avg_velocity: number;
  max_load: number;
}

interface VelocityFatigueCardProps {
  data: VelocityFatigueData[];
}

export const VelocityFatigueCard: React.FC<VelocityFatigueCardProps> = ({ data }) => {
  // Transform data for scatter plot
  const scatterData = data.map(item => ({
    velocity: item.avg_velocity,
    load: item.max_load,
    date: item.date,
    // Color based on velocity - higher velocity = better performance
    color: item.avg_velocity > 0.8 ? 'hsl(var(--brand-green))' : 
           item.avg_velocity > 0.6 ? 'hsl(var(--brand-orange))' : 
           'hsl(var(--brand-red))'
  }));

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 w-[300px] h-[240px] flex flex-col">
      <h3 className="font-display font-semibold text-lg text-slate-50 mb-2">
        Velocity vs Load
      </h3>
      
      <div className="text-xs text-muted-foreground mb-2">
        Higher velocity = better performance
      </div>
      
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart data={scatterData}>
            <XAxis 
              type="number"
              dataKey="velocity"
              domain={['dataMin - 0.1', 'dataMax + 0.1']}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value.toFixed(1)}m/s`}
            />
            <YAxis 
              type="number"
              dataKey="load"
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
              formatter={(value: number, name: string) => {
                if (name === 'velocity') return [`${value.toFixed(2)}m/s`, 'Velocity'];
                if (name === 'load') return [`${value}kg`, 'Max Load'];
                return [value, name];
              }}
              labelFormatter={(label, payload) => {
                if (payload && payload[0]) {
                  return `Date: ${payload[0].payload.date}`;
                }
                return label;
              }}
            />
            <Scatter dataKey="load" fill="hsl(var(--brand-blue))">
              {scatterData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};