
import React from 'react';

interface DataPoint {
  x: number | string;
  y: number;
  date?: string;
  value?: number;
}

interface LightweightLineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  showDots?: boolean;
  showGrid?: boolean;
}

export const LightweightLineChart: React.FC<LightweightLineChartProps> = ({
  data,
  width = 400,
  height = 200,
  color = '#3b82f6',
  strokeWidth = 2,
  className = '',
  showDots = false,
  showGrid = true
}) => {
  if (!data || data.length === 0) return null;

  // Normalize data to work with different formats
  const normalizedData = data.map((point, index) => ({
    x: typeof point.x === 'string' ? index : point.x,
    y: point.y || point.value || 0
  }));

  const minX = Math.min(...normalizedData.map(d => Number(d.x)));
  const maxX = Math.max(...normalizedData.map(d => Number(d.x)));
  const minY = Math.min(...normalizedData.map(d => d.y));
  const maxY = Math.max(...normalizedData.map(d => d.y));

  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Scale functions
  const scaleX = (x: number) => ((x - minX) / (maxX - minX)) * chartWidth + padding;
  const scaleY = (y: number) => height - (((y - minY) / (maxY - minY)) * chartHeight + padding);

  // Generate path
  const pathData = normalizedData.map((point, index) => {
    const x = scaleX(Number(point.x));
    const y = scaleY(point.y);
    return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  // Grid lines
  const gridLines = [];
  if (showGrid) {
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (i * chartHeight / 4);
      gridLines.push(
        <line
          key={`h-${i}`}
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

    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = padding + (i * chartWidth / 4);
      gridLines.push(
        <line
          key={`v-${i}`}
          x1={x}
          y1={padding}
          x2={x}
          y2={height - padding}
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
      
      {/* Line */}
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Dots */}
      {showDots && normalizedData.map((point, index) => (
        <circle
          key={index}
          cx={scaleX(Number(point.x))}
          cy={scaleY(point.y)}
          r={3}
          fill={color}
        />
      ))}
    </svg>
  );
};
