import { format, subDays, addDays, addHours, startOfDay } from 'date-fns';
import { mockAthletes } from './athleteProfiles';

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

// Generate hourly readiness data for 24h view
export const generateHourlyReadinessData = (athleteId: string) => {
  const athlete = mockAthletes.find(a => a.id === athleteId) || mockAthletes[0];
  const now = new Date();
  const startOfCurrentDay = startOfDay(now);
  const data = [];
  
  let currentScore = athlete.baseReadiness;
  
  for (let i = 0; i < 24; i++) {
    const timestamp = addHours(startOfCurrentDay, i);
    const hour = i;
    
    // Circadian rhythm patterns
    let circadianEffect = 0;
    if (hour >= 6 && hour <= 10) {
      circadianEffect = 5; // Morning boost
    } else if (hour >= 14 && hour <= 16) {
      circadianEffect = -3; // Afternoon dip
    } else if (hour >= 22 || hour <= 5) {
      circadianEffect = -5; // Night/early morning low
    }
    
    // Post-workout effects (assuming workout around 17:00)
    let workoutEffect = 0;
    if (hour >= 17 && hour <= 19) {
      workoutEffect = -8; // During/immediately after workout
    } else if (hour >= 20 && hour <= 22) {
      workoutEffect = 3; // Recovery boost
    }
    
    const randomVariation = (Math.random() - 0.5) * 4;
    currentScore = Math.max(30, Math.min(100, 
      athlete.baseReadiness + circadianEffect + workoutEffect + randomVariation
    ));
    
    data.push({
      day: timestamp.toISOString(),
      readiness_score: Math.round(currentScore),
      avg_7d: Math.round(currentScore + (Math.random() - 0.5) * 2),
      avg_30d: Math.round(athlete.baseReadiness + (Math.random() - 0.5) * 3),
      avg_90d: Math.round(athlete.baseReadiness + (Math.random() - 0.5) * 2)
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

// Generate hourly sleep quality data for 24h view
export const generateHourlySleepData = (athleteId: string) => {
  const athlete = mockAthletes.find(a => a.id === athleteId) || mockAthletes[0];
  const now = new Date();
  const startOfCurrentDay = startOfDay(now);
  const data = [];
  
  for (let i = 0; i < 24; i++) {
    const timestamp = addHours(startOfCurrentDay, i);
    const hour = i;
    
    // Sleep period simulation (assuming sleep from 23:00 to 07:00)
    let sleepHours = 0;
    let deepMinutes = 0;
    let lightMinutes = 0;
    let remMinutes = 0;
    let avgHr = 70;
    
    if (hour >= 23 || hour <= 7) {
      // During sleep period
      sleepHours = 1; // 1 hour blocks
      if (hour >= 0 && hour <= 2) {
        // Deep sleep early in night
        deepMinutes = 40;
        lightMinutes = 15;
        remMinutes = 5;
        avgHr = 50;
      } else if (hour >= 3 && hour <= 5) {
        // Mixed sleep
        deepMinutes = 20;
        lightMinutes = 25;
        remMinutes = 15;
        avgHr = 55;
      } else {
        // Lighter sleep towards morning
        deepMinutes = 10;
        lightMinutes = 35;
        remMinutes = 15;
        avgHr = 60;
      }
    }
    
    data.push({
      day: timestamp.toISOString(),
      total_sleep_hours: sleepHours,
      deep_minutes: deepMinutes,
      light_minutes: lightMinutes,
      rem_minutes: remMinutes,
      avg_hr: avgHr + Math.round((Math.random() - 0.5) * 10),
      sleep_efficiency: sleepHours > 0 ? Math.round(85 + Math.random() * 10) : 0,
      hrv_rmssd: Math.round(30 + Math.random() * 20)
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

// Generate hourly training load data for 24h view
export const generateHourlyLoadData = (athleteId: string) => {
  const athlete = mockAthletes.find(a => a.id === athleteId) || mockAthletes[0];
  const now = new Date();
  const startOfCurrentDay = startOfDay(now);
  const data = [];
  
  let cumulativeLoad = 0;
  
  for (let i = 0; i < 24; i++) {
    const timestamp = addHours(startOfCurrentDay, i);
    const hour = i;
    
    let hourlyLoad = 0;
    
    // Training session simulation (17:00-19:00)
    if (hour >= 17 && hour <= 19) {
      hourlyLoad = athlete.baseLoad / 2; // Split training across 2 hours
    }
    // Morning activity (7:00-8:00)
    else if (hour >= 7 && hour <= 8) {
      hourlyLoad = athlete.baseLoad * 0.1; // Light morning activity
    }
    // Background activity throughout day
    else if (hour >= 8 && hour <= 22) {
      hourlyLoad = athlete.baseLoad * 0.02; // Very light background load
    }
    
    cumulativeLoad += hourlyLoad;
    
    // For hourly view, acute and chronic loads are simplified
    const acute1h = hourlyLoad;
    const chronic24h = cumulativeLoad / Math.max(1, i + 1);
    const acwr = chronic24h > 0 ? acute1h / chronic24h : 0;
    
    data.push({
      day: timestamp.toISOString(),
      daily_load: Number(hourlyLoad.toFixed(2)),
      acute_7d: Number(acute1h.toFixed(2)),
      chronic_28d: Number(chronic24h.toFixed(2)),
      acwr_7_28: Number(acwr.toFixed(3))
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
