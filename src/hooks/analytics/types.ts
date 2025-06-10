
export interface MetricDataResult {
  latestScore?: number;
  latestAcwr?: number;
  avgHours?: number;
  delta7d: number;
  series: any[];
  secondary?: any[];
  scatter?: any[];
  tableRows: any[];
  zones?: Array<{ from: number; to: number; color: string; label: string }>;
  isHourlyView: boolean;
}

export type MetricType = "readiness" | "sleep" | "load";
