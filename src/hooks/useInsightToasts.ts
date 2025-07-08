
import { useState, useCallback, useRef, useEffect } from 'react';
import { useMetrics } from './useMetrics';
import { useStress } from './useStress';
import { InsightToastData } from '@/components/ui/InsightToast';

interface InsightToastManager {
  insights: InsightToastData[];
  showInsight: (insight: Omit<InsightToastData, 'id'>) => void;
  dismissInsight: (id: string) => void;
  clearAll: () => void;
}

const RATE_LIMIT_MS = 120000; // 2 minutes between insights
const MAX_INSIGHTS = 1; // Only show one insight at a time

export const useInsightToasts = (): InsightToastManager => {
  const [insights, setInsights] = useState<InsightToastData[]>([]);
  const lastInsightTime = useRef<number>(0);
  const shownInsights = useRef<Set<string>>(new Set());
  
  const { data: metricsData } = useMetrics();
  const { data: stressData } = useStress();

  const generateInsightMessage = (type: string, value: number | null, severity: 'green' | 'amber' | 'red'): string => {
    switch (type) {
      case 'recovery':
        if (!value) return '';
        if (value >= 80) return `Recovery ${Math.round(value)} — green light for hard session`;
        if (value >= 60) return `Recovery ${Math.round(value)} — consider moderate intensity`;
        return `Recovery ${Math.round(value)} — prioritize rest and recovery`;
        
      case 'strain':
        if (!value) return '';
        if (value >= 18) return `High strain detected — monitor fatigue closely`;
        if (value >= 12) return `Moderate strain — good training stimulus`;
        return `Low strain — opportunity for intensity`;
        
      case 'acwr':
        if (!value) return '';
        if (value > 1.3) return `Training load elevated — injury risk moderate`;
        if (value < 0.8) return `Training load low — safe to increase intensity`;
        return `Training load optimal — maintain current approach`;
        
      default:
        return '';
    }
  };

  const showInsight = useCallback((insight: Omit<InsightToastData, 'id'>) => {
    const now = Date.now();
    const insightKey = `${insight.type}-${insight.message}`;
    
    // Rate limiting
    if (now - lastInsightTime.current < RATE_LIMIT_MS) return;
    
    // Duplicate prevention
    if (shownInsights.current.has(insightKey)) return;
    
    // Max insights limit
    if (insights.length >= MAX_INSIGHTS) return;

    const newInsight: InsightToastData = {
      ...insight,
      id: Math.random().toString(36).substr(2, 9)
    };

    setInsights(prev => [...prev, newInsight]);
    lastInsightTime.current = now;
    shownInsights.current.add(insightKey);

    // Clear the shown insight after some time to allow re-showing
    setTimeout(() => {
      shownInsights.current.delete(insightKey);
    }, 300000); // 5 minutes
  }, [insights.length]);

  const dismissInsight = useCallback((id: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setInsights([]);
  }, []);

  // Generate insights based on metrics
  useEffect(() => {
    if (!metricsData) return;

    // Recovery insights
    if (metricsData.recovery !== null) {
      const recovery = metricsData.recovery;
      let severity: 'green' | 'amber' | 'red' = 'green';
      
      if (recovery < 60) severity = 'red';
      else if (recovery < 80) severity = 'amber';
      
      const message = generateInsightMessage('recovery', recovery, severity);
      if (message) {
        showInsight({
          message,
          type: 'recovery',
          severity
        });
      }
    }

    // Strain insights
    if (metricsData.strain !== null) {
      const strain = metricsData.strain;
      let severity: 'green' | 'amber' | 'red' = 'green';
      
      if (strain >= 18) severity = 'red';
      else if (strain >= 15) severity = 'amber';
      
      const message = generateInsightMessage('strain', strain, severity);
      if (message) {
        showInsight({
          message,
          type: 'strain',
          severity
        });
      }
    }
  }, [metricsData, showInsight]);

  // Stress insights
  useEffect(() => {
    if (stressData && stressData.current !== null && stressData.current !== undefined) {
      let severity: 'green' | 'amber' | 'red' = 'green';
      
      if (stressData.current > 70) {
        severity = stressData.current > 85 ? 'red' : 'amber';
        
        showInsight({
          message: `Stress level ${stressData.current} — consider relaxation techniques`,
          type: 'general',
          severity
        });
      }
    }
  }, [stressData, showInsight]);

  return {
    insights,
    showInsight,
    dismissInsight,
    clearAll
  };
};
