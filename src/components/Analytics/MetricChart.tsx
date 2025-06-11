
import React from 'react';
import { MetricChartProps } from './charts/types';
import { LineChart } from './charts/LineChart';
import { BarChart } from './charts/BarChart';
import { ScatterChart } from './charts/ScatterChart';

export const MetricChart: React.FC<MetricChartProps> = ({
  type,
  data,
  zones,
  xLabel,
  yLabel,
  multiSeries = false,
  stacked = false,
  isHourlyView = false,
  className = ""
}) => {
  if (type === "scatter") {
    return (
      <ScatterChart
        data={data}
        isHourlyView={isHourlyView}
        className={className}
      />
    );
  }

  if (type === "line") {
    return (
      <LineChart
        data={data}
        zones={zones}
        isHourlyView={isHourlyView}
        className={className}
      />
    );
  }

  if (type === "bar") {
    return (
      <BarChart
        data={data}
        multiSeries={multiSeries}
        stacked={stacked}
        isHourlyView={isHourlyView}
        className={className}
      />
    );
  }

  return null;
};
