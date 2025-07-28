import React from 'react';
import { VictoryChart, VictoryAxis, VictoryBar, VictoryLine, VictoryTheme } from 'victory';

interface VelocityFatigueData {
  date: string;
  avg_velocity: number;
  max_load: number;
}

interface VelocityFatigueCardProps {
  data: VelocityFatigueData[];
}

export const VelocityFatigueCard: React.FC<VelocityFatigueCardProps> = ({ data }) => {
  // Transform data for Victory combo chart
  const chartData = data.map((item, index) => ({
    x: index + 1, // Use index for x-axis
    velocity: item.avg_velocity,
    load: item.max_load,
    date: item.date
  }));

  const maxLoad = Math.max(...data.map(d => d.max_load));
  const maxVelocity = Math.max(...data.map(d => d.avg_velocity));

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full h-[320px] flex flex-col">
      <h3 className="font-display font-semibold text-xl text-slate-50 mb-4">
        Velocity vs Load
      </h3>
      
      <div className="text-sm text-muted-foreground mb-4">
        Blue bars: Load, Orange line: Velocity
      </div>
      
      <div className="flex-1">
        <VictoryChart
          theme={VictoryTheme.material}
          width={350}
          height={200}
          padding={{ left: 60, top: 20, right: 60, bottom: 60 }}
          style={{
            parent: { background: 'transparent' }
          }}
        >
          {/* Left Y-axis for Load (bars) */}
          <VictoryAxis
            dependentAxis
            domain={[0, maxLoad * 1.1]}
            tickFormat={(value) => `${value}kg`}
            style={{
              axis: { stroke: '#64748b' },
              tickLabels: { fontSize: 12, fill: '#3b82f6' },
              grid: { stroke: '#374151', strokeWidth: 0.5 }
            }}
          />
          
          {/* Right Y-axis for Velocity (line) */}
          <VictoryAxis
            dependentAxis
            orientation="right"
            domain={[0, maxVelocity * 1.1]}
            tickFormat={(value) => `${value.toFixed(1)}m/s`}
            style={{
              axis: { stroke: '#64748b' },
              tickLabels: { fontSize: 12, fill: '#f59e0b' }
            }}
          />
          
          {/* X-axis */}
          <VictoryAxis
            tickFormat={(value) => `Day ${value}`}
            style={{
              axis: { stroke: '#64748b' },
              tickLabels: { fontSize: 12, fill: '#94a3b8' }
            }}
          />
          
          {/* Bar chart for Load */}
          <VictoryBar
            data={chartData}
            x="x"
            y={(d) => d.load}
            style={{
              data: { 
                fill: '#3b82f6',
                fillOpacity: 0.7,
                stroke: '#3b82f6',
                strokeWidth: 1
              }
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 }
            }}
          />
          
          {/* Line chart for Velocity */}
          <VictoryLine
            data={chartData}
            x="x"
            y={(d) => (d.velocity / maxVelocity) * maxLoad} // Scale velocity to load range
            style={{
              data: { 
                stroke: '#f59e0b', 
                strokeWidth: 4,
                strokeLinecap: 'round'
              }
            }}
            animate={{
              duration: 1000,
              onLoad: { duration: 500 }
            }}
          />
        </VictoryChart>
      </div>
    </div>
  );
};