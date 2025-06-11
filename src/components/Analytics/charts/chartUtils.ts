
import { ChartDataPoint } from './types';

export const transformDataForChart = (data: ChartDataPoint[]) => {
  return data.map(point => ({
    date: point.x,
    value: point.y,
    hrv: point.hrv || 0,
    sleep: point.sleep || 0,
    deep: point.deep || 0,
    light: point.light || 0,
    rem: point.rem || 0,
    acute: point.acute || 0,
    chronic: point.chronic || 0,
    hour: point.hour,
    ...point
  }));
};

export const formatXAxis = (value: string, isHourlyView: boolean = false) => {
  if (isHourlyView) {
    return new Date(value).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  } else {
    return new Date(value).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
};
