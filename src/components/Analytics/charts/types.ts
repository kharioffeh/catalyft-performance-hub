
export interface Zone {
  from: number;
  to: number;
  color: string;
  label: string;
}

export interface ChartDataPoint {
  x: string;
  y: number;
  hour?: number;
  hrv?: number;
  sleep?: number;
  deep?: number;
  light?: number;
  rem?: number;
  acute?: number;
  chronic?: number;
  [key: string]: any;
}

export interface BaseChartProps {
  data: ChartDataPoint[];
  isHourlyView?: boolean;
  className?: string;
}

export interface MetricChartProps {
  type: "line" | "bar" | "scatter";
  data: ChartDataPoint[];
  zones?: Zone[];
  xLabel?: string;
  yLabel?: string;
  multiSeries?: boolean;
  stacked?: boolean;
  isHourlyView?: boolean;
  className?: string;
}
