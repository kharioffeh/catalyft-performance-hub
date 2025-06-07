
import { format, subDays, startOfDay, addDays } from 'date-fns';

// Mock athlete profiles with different characteristics
export const mockAthletes = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Sarah Johnson',
    profile: 'elite', // High performance, consistent
    baseReadiness: 85,
    baseSleep: 8.2,
    baseLoad: 15
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Mike Chen',
    profile: 'developing', // Moderate performance, some inconsistency
    baseReadiness: 72,
    baseSleep: 7.5,
    baseLoad: 12
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Alex Rodriguez',
    profile: 'recovering', // Lower performance, needs monitoring
    baseReadiness: 65,
    baseSleep: 6.8,
    baseLoad: 8
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440004',
    name: 'Emma Thompson',
    profile: 'peaking', // Very high performance, training hard
    baseReadiness: 78,
    baseSleep: 7.8,
    baseLoad: 18
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440005',
    name: 'Jordan Kim',
    profile: 'baseline', // Average across all metrics
    baseReadiness: 75,
    baseSleep: 7.2,
    baseLoad: 10
  }
];

// Generate realistic readiness data
export const generateReadinessData = (athleteId: string, period: number) => {
  const athlete = mockAthletes.find(a => a.id === athleteId) || mockAthletes[0];
  const endDate = new Date();
  const startDate = subDays(endDate, period);
  const data = [];
  
  let currentScore = athlete.baseReadiness;
  
  for (let i = 0; i <= period; i++) {
    const date = format(addDays(startDate, i), 'yyyy-MM-dd');
    const dayOfWeek = addDays(startDate, i).getDay();
    
    // Add weekly patterns (weekend recovery)
    let weekendBonus = (dayOfWeek === 0 || dayOfWeek === 6) ? 5 : 0;
    
    // Add training stress patterns
    let trainingStress = 0;
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      trainingStress = -3; // Hard training days
    }
    
    // Random variation
    const randomVariation = (Math.random() - 0.5) * 8;
    
    // Calculate score with bounds
    currentScore = Math.max(30, Math.min(100, 
      athlete.baseReadiness + weekendBonus + trainingStress + randomVariation
    ));
    
    data.push({
      day: date,
      readiness_score: Math.round(currentScore),
      avg_7d: Math.round(currentScore + (Math.random() - 0.5) * 3),
      avg_30d: Math.round(athlete.baseReadiness + (Math.random() - 0.5) * 5),
      avg_90d: Math.round(athlete.baseReadiness + (Math.random() - 0.5) * 3)
    });
  }
  
  return data;
};

// Generate realistic sleep data
export const generateSleepData = (athleteId: string, period: number) => {
  const athlete = mockAthletes.find(a => a.id === athleteId) || mockAthletes[0];
  const endDate = new Date();
  const startDate = subDays(endDate, period);
  const data = [];
  
  for (let i = 0; i <= period; i++) {
    const date = format(addDays(startDate, i), 'yyyy-MM-dd');
    const dayOfWeek = addDays(startDate, i).getDay();
    
    // Weekend sleep-in pattern
    const weekendBonus = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.5 : 0;
    
    // Random variation
    const variation = (Math.random() - 0.5) * 1.5;
    const totalSleep = Math.max(5, Math.min(10, athlete.baseSleep + weekendBonus + variation));
    
    // Sleep stage breakdown (as percentages of total sleep)
    const deepSleep = totalSleep * (0.15 + Math.random() * 0.1); // 15-25%
    const remSleep = totalSleep * (0.20 + Math.random() * 0.1);  // 20-30%
    const lightSleep = totalSleep - deepSleep - remSleep;        // Remainder
    
    data.push({
      day: date,
      total_sleep_hours: Number(totalSleep.toFixed(1)),
      deep_minutes: Math.round(deepSleep * 60),
      light_minutes: Math.round(lightSleep * 60),
      rem_minutes: Math.round(remSleep * 60),
      avg_hr: Math.round(50 + Math.random() * 20),
      sleep_efficiency: Math.round(80 + Math.random() * 15),
      hrv_rmssd: Math.round(25 + Math.random() * 25)
    });
  }
  
  return data;
};

// Generate realistic training load data
export const generateLoadData = (athleteId: string, period: number) => {
  const athlete = mockAthletes.find(a => a.id === athleteId) || mockAthletes[0];
  const endDate = new Date();
  const startDate = subDays(endDate, period);
  const data = [];
  
  const loads = [];
  
  // Generate daily loads first
  for (let i = 0; i <= period; i++) {
    const dayOfWeek = addDays(startDate, i).getDay();
    
    let dailyLoad = 0;
    // Training pattern: Hard on Mon/Wed/Fri, easy Tue/Thu, rest weekends
    if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
      dailyLoad = athlete.baseLoad + (Math.random() - 0.3) * 8; // Hard days
    } else if (dayOfWeek === 2 || dayOfWeek === 4) {
      dailyLoad = athlete.baseLoad * 0.6 + (Math.random() - 0.5) * 4; // Easy days
    } else {
      dailyLoad = athlete.baseLoad * 0.2 + Math.random() * 3; // Rest days
    }
    
    loads.push(Math.max(0, dailyLoad));
  }
  
  // Calculate rolling averages and ACWR
  for (let i = 0; i <= period; i++) {
    const date = format(addDays(startDate, i), 'yyyy-MM-dd');
    const dailyLoad = loads[i];
    
    // Calculate acute load (7-day average)
    const acute7dStart = Math.max(0, i - 6);
    const acute7d = loads.slice(acute7dStart, i + 1).reduce((sum, load) => sum + load, 0) / 7;
    
    // Calculate chronic load (28-day average)
    const chronic28dStart = Math.max(0, i - 27);
    const chronic28d = loads.slice(chronic28dStart, i + 1).reduce((sum, load) => sum + load, 0) / 28;
    
    // Calculate ACWR
    const acwr = chronic28d > 0 ? acute7d / chronic28d : 0;
    
    data.push({
      day: date,
      daily_load: Number(dailyLoad.toFixed(1)),
      acute_7d: Number(acute7d.toFixed(1)),
      chronic_28d: Number(chronic28d.toFixed(1)),
      acwr_7_28: Number(acwr.toFixed(2))
    });
  }
  
  return data;
};

// Generate latest strain data
export const generateLatestStrain = (athleteId: string) => {
  const athlete = mockAthletes.find(a => a.id === athleteId) || mockAthletes[0];
  const baseStrain = athlete.baseLoad + 5;
  
  return {
    value: Number((baseStrain + (Math.random() - 0.5) * 6).toFixed(1)),
    ts: new Date().toISOString()
  };
};

// Generate chart data from raw data
export const formatChartData = (rawData: any[], xKey: string, yKey: string) => {
  return rawData.map(item => ({
    x: item[xKey],
    y: item[yKey] || 0
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

// Generate load secondary data for acute vs chronic comparison
export const formatLoadSecondaryData = (rawData: any[]) => {
  return rawData.map(item => ({
    x: item.day,
    y: (item.acute_7d || 0) + (item.chronic_28d || 0),
    acute: item.acute_7d || 0,
    chronic: item.chronic_28d || 0
  }));
};
