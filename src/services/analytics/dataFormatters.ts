
// Generate chart data from raw data
export const formatChartData = (rawData: any[], xKey: string, yKey: string) => {
  return rawData.map(item => ({
    x: item[xKey],
    y: item[yKey] || 0
  }));
};

// Generate chart data with hourly formatting
export const formatHourlyChartData = (rawData: any[], xKey: string, yKey: string) => {
  return rawData.map(item => ({
    x: item[xKey],
    y: item[yKey] || 0,
    hour: new Date(item[xKey]).getHours()
  }));
};

// Generate sleep chart data with stages
export const formatSleepChartData = (rawData: any[]) => {
  return rawData.map(item => ({
    x: item.day,
    y: item.total_sleep_hours || 0,
    deep: (item.deep_minutes || 0) / 60,
    light: (item.light_minutes || 0) / 60,
    rem: (item.rem_minutes || 0) / 60
  }));
};

// Generate hourly sleep chart data
export const formatHourlySleepChartData = (rawData: any[]) => {
  return rawData.map(item => ({
    x: item.day,
    y: item.total_sleep_hours || 0,
    deep: (item.deep_minutes || 0) / 60,
    light: (item.light_minutes || 0) / 60,
    rem: (item.rem_minutes || 0) / 60,
    hour: new Date(item.day).getHours()
  }));
};

// Generate load secondary data for acute vs chronic comparison
export const formatLoadSecondaryData = (rawData: any[]) => {
  return rawData.map(item => ({
    x: item.day,
    y: (item.acute_7d || 0) + (item.chronic_28d || 0),
    acute: item.acute_7d || 0,
    chronic: item.chronic_28d || 0
  }));
};

// Generate hourly load secondary data
export const formatHourlyLoadSecondaryData = (rawData: any[]) => {
  return rawData.map(item => ({
    x: item.day,
    y: (item.acute_7d || 0) + (item.chronic_28d || 0),
    acute: item.acute_7d || 0,
    chronic: item.chronic_28d || 0,
    hour: new Date(item.day).getHours()
  }));
};
