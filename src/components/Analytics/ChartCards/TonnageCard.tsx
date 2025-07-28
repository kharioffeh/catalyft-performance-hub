import React from 'react';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryTooltip, VictoryTheme } from 'victory';

interface TonnageData {
  date: string;
  tonnage: number;
}

interface TonnageCardProps {
  data: TonnageData[];
}

export const TonnageCard: React.FC<TonnageCardProps> = ({ data }) => {
  // Transform data for Victory
  const chartData = data.map(item => ({
    x: new Date(item.date),
    y: item.tonnage,
    label: `${item.tonnage}kg`
  }));

  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 w-full h-[320px] flex flex-col">
      <h3 className="font-display font-semibold text-xl text-slate-50 mb-6">
        Training Tonnage
      </h3>
      
      <div className="flex-1">
        <VictoryChart
          theme={VictoryTheme.material}
          width={350}
          height={220}
          padding={{ left: 60, top: 20, right: 40, bottom: 60 }}
          style={{
            parent: { background: 'transparent' }
          }}
        >
          <VictoryAxis
            dependentAxis
            tickFormat={(value) => `${value}kg`}
            style={{
              axis: { stroke: '#64748b' },
              tickLabels: { fontSize: 12, fill: '#94a3b8' },
              grid: { stroke: '#374151', strokeWidth: 0.5 }
            }}
          />
          <VictoryAxis
            tickFormat={(date) => {
              const d = new Date(date);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            }}
            style={{
              axis: { stroke: '#64748b' },
              tickLabels: { fontSize: 12, fill: '#94a3b8' }
            }}
          />
          <VictoryLine
            data={chartData}
            style={{
              data: { stroke: '#3b82f6', strokeWidth: 3 }
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