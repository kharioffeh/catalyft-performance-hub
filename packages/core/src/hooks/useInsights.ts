export interface Insight {
  id: string;
  title: string;
  message: string;
  type: 'readiness' | 'sleep' | 'load' | 'stress' | 'general';
  severity: 'green' | 'amber' | 'red';
  route?: string;
  value?: number;
  trend?: 'up' | 'down' | 'stable';
}

export interface MetricsData {
  recovery?: number;
}

export interface StressData {
  current?: number;
}

export interface InsightParams {
  metricsData?: MetricsData;
  stressData?: StressData;
  sleepScore?: number;
  loadACWR?: Array<{ acwr_7_28?: number }>;
}

/**
 * Core insights generation logic
 */
export const generateInsights = (params: InsightParams): Insight[] => {
  const { metricsData, stressData, sleepScore, loadACWR } = params;
  const insights: Insight[] = [];

  // Readiness insights
  if (metricsData?.recovery !== null && metricsData?.recovery !== undefined) {
    const readiness = metricsData.recovery;
    let severity: 'green' | 'amber' | 'red' = 'green';
    let message = '';
    
    if (readiness < 60) {
      severity = 'red';
      message = 'Low readiness detected. Prioritize rest and recovery today.';
    } else if (readiness < 80) {
      severity = 'amber';
      message = 'Moderate readiness. Consider light to moderate training.';
    } else {
      message = 'High readiness. Green light for intense training today.';
    }

    insights.push({
      id: 'readiness-insight',
      title: 'Readiness',
      message,
      type: 'readiness',
      severity,
      route: '/analytics/readiness',
      value: readiness,
      trend: 'stable'
    });
  }

  // Sleep insights
  if (sleepScore) {
    let severity: 'green' | 'amber' | 'red' = 'green';
    let message = '';
    
    if (sleepScore < 70) {
      severity = 'red';
      message = `Poor sleep quality (${sleepScore}%). Focus on sleep hygiene tonight.`;
    } else if (sleepScore < 85) {
      severity = 'amber';
      message = `Moderate sleep quality (${sleepScore}%). Room for improvement.`;
    } else {
      message = `Excellent sleep quality (${sleepScore}%). Well rested for training.`;
    }

    insights.push({
      id: 'sleep-insight',
      title: 'Sleep Quality',
      message,
      type: 'sleep',
      severity,
      route: '/sleep',
      value: sleepScore,
      trend: 'up'
    });
  }

  // Training load insights
  const latestACWR = loadACWR && loadACWR[loadACWR.length - 1];
  if (latestACWR?.acwr_7_28 !== null && latestACWR?.acwr_7_28 !== undefined) {
    const acwr = latestACWR.acwr_7_28;
    let severity: 'green' | 'amber' | 'red' = 'green';
    let message = '';
    
    if (acwr > 1.5) {
      severity = 'red';
      message = `High training load (${acwr.toFixed(2)}). Elevated injury risk detected.`;
    } else if (acwr > 1.3) {
      severity = 'amber';
      message = `Moderate training load (${acwr.toFixed(2)}). Monitor fatigue closely.`;
    } else if (acwr < 0.8) {
      severity = 'amber';
      message = `Low training load (${acwr.toFixed(2)}). Safe to increase intensity.`;
    } else {
      message = `Optimal training load (${acwr.toFixed(2)}). Maintain current approach.`;
    }

    insights.push({
      id: 'load-insight',
      title: 'Training Load',
      message,
      type: 'load',
      severity,
      route: '/analytics/load',
      value: acwr,
      trend: 'stable'
    });
  }

  // Stress insights
  if (stressData?.current !== null && stressData?.current !== undefined) {
    const stress = stressData.current;
    let severity: 'green' | 'amber' | 'red' = 'green';
    let message = '';
    
    if (stress > 70) {
      severity = stress > 85 ? 'red' : 'amber';
      message = `Elevated stress levels (${stress}). Consider relaxation techniques.`;
    } else if (stress < 30) {
      message = `Low stress levels (${stress}). Optimal state for training.`;
    } else {
      message = `Moderate stress levels (${stress}). Well balanced state.`;
    }

    insights.push({
      id: 'stress-insight',
      title: 'Stress Level',
      message,
      type: 'stress',
      severity,
      route: '/analytics/stress',
      value: stress,
      trend: 'stable'
    });
  }

  // General performance insight
  if (metricsData && sleepScore) {
    const combinedScore = (metricsData.recovery! + sleepScore) / 2;
    if (combinedScore > 85) {
      insights.push({
        id: 'performance-insight',
        title: 'Performance State',
        message: 'Peak performance window detected. Perfect time for challenging workouts.',
        type: 'general',
        severity: 'green',
        route: '/analytics',
        value: combinedScore,
        trend: 'up'
      });
    }
  }

  return insights.slice(0, 5); // Limit to 5 insights
};

export const useInsights = generateInsights;