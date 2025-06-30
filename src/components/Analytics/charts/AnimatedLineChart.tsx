
import React from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AnimatedDot } from '@/components/animations/AnimatedDot';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface AnimatedLineChartProps {
  data: any[];
  dataKey: string;
  color: string;
  xAxisProps?: any;
  yAxisProps?: any;
  referenceLines?: Array<{
    value: number;
    color: string;
    strokeDasharray?: string;
  }>;
  children?: React.ReactNode;
}

export const AnimatedLineChart: React.FC<AnimatedLineChartProps> = ({
  data,
  dataKey,
  color,
  xAxisProps,
  yAxisProps,
  referenceLines = [],
  children
}) => {
  const prefersReducedMotion = useReducedMotion();

  const CustomDot = (props: any) => {
    const { cx, cy, index } = props;
    return (
      <AnimatedDot
        cx={cx}
        cy={cy}
        r={3}
        fill={color}
        index={index}
      />
    );
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        
        {/* Reference lines */}
        {referenceLines.map((line, index) => (
          <ReferenceLine 
            key={index}
            y={line.value}
            stroke={line.color}
            strokeDasharray={line.strokeDasharray}
            strokeOpacity={0.7}
          />
        ))}
        
        {children}
        
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={prefersReducedMotion ? { fill: color, strokeWidth: 2 } : CustomDot}
          connectNulls={false}
          animationDuration={prefersReducedMotion ? 0 : 800}
          animationEasing="ease-out"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
