export interface MetricDataResult {
  latestScore: number;
  delta7d: number;
  series: Array<{ x: string; y: number }>;
  secondary?: Array<{ x: string; y: number; [key: string]: any }>;
  tableRows?: Array<{ [key: string]: any }>;
  isHourlyView?: boolean;
}

export interface ReadinessMetrics {
  hrv?: number;
  restingHR?: number;
  sleepScore?: number;
  soreness?: number;
  motivation?: number;
}

export interface NutritionTargets {
  kcalTarget: number;
  proteinTarget: number;
  carbTarget: number;
  fatTarget: number;
}

export interface MacroTotals {
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
}

export interface TrainingLoadMetrics {
  daily_load: number;
  acute_7d: number;
  chronic_28d: number;
  acwr_7_28: number;
}

export interface SleepMetrics {
  total_sleep_hours: number;
  deep_minutes: number;
  light_minutes: number;
  rem_minutes: number;
  avg_hr: number;
  sleep_efficiency: number;
  hrv_rmssd: number;
}