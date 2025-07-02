
import React from 'react';

interface DataPoint {
  x: number | string;
  y: number;
  date?: string;
  value?: number;
  label?: string;
}

interface LightweightBarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
  showGrid?: boolean;
}

export const LightweightBarChart: React.FC<LightweightBarChartProps> = ({
  data,
  width = 400,
  height = 200,
  color = '#3b82f6',
  className = '',
  showGrid = true
}) => {
  if (!data || data.length === 0) return null;

  const normalizedData = data.map((point, index) => ({
    x: index,
    y: point.y || point.value || 0,
    label: point.label || point.date || point.x
  }));

  const maxY = Math.max(...normalizedData.map(d => d.y));
  const minY = Math.min(0, Math.min(...normalizedData.map(d => d.y)));

  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;
  const barWidth = chartWidth / normalizedData.length * 0.8;
  const barSpacing = chartWidth / normalizedData.length;

  const scaleY = (y: number) => ((y - minY) / (maxY - minY)) * chartHeight;

  const gridLines = [];
  if (showGrid) {
    for (let i = 0; i <= 4; i++) {
      const y = height - padding - (i * chartHeight / 4);
      gridLines.push(
        <line
          key={`grid-${i}`}
          x1={padding}
          y1={y}
          x2={width - padding}
          y2={y}
          stroke="currentColor"
          strokeOpacity={0.1}
          strokeWidth={1}
        />
      );
    }
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
    >
      {/* Grid */}
      {gridLines}
      
      {/* Bars */}
      {normalizedData.map((point, index) => {
        const barHeight = scaleY(point.y);
        const x = padding + index * barSpacing + (barSpacing - barWidth) / 2;
        const y = height - padding - barHeight;
        
        return (
          <rect
            key={index}
            x={x}
            y={y}
            width={barWidth}
            height={barHeight}
            fill={color}
            rx={2}
          />
        );
      })}
    </svg>
  );
};
