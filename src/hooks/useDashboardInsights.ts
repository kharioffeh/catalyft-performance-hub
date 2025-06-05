
import React from 'react';

export const useDashboardInsights = (currentReadiness: any, todaySessions: any[], weeklyStats: any) => {
  return React.useMemo(() => {
    const insights = [];
    
    if (currentReadiness && currentReadiness.score < 70) {
      insights.push({
        type: 'warning' as const,
        title: 'Low Readiness Alert',
        description: 'Consider reducing training intensity today.',
        metric: `Score: ${Math.round(currentReadiness.score)}%`,
        change: -12
      });
    }

    if (todaySessions.length === 0) {
      insights.push({
        type: 'neutral' as const,
        title: 'Rest Day',
        description: 'No sessions scheduled for today. Great time for recovery.',
        metric: 'Today',
        change: 0
      });
    } else if (todaySessions.length > 2) {
      insights.push({
        type: 'warning' as const,
        title: 'Heavy Training Day',
        description: 'Multiple sessions scheduled. Monitor fatigue closely.',
        metric: `${todaySessions.length} sessions`,
        change: 25
      });
    }

    if (weeklyStats && weeklyStats.completed >= 4) {
      insights.push({
        type: 'positive' as const,
        title: 'Great Week!',
        description: 'You\'re on track with your training schedule.',
        metric: `${weeklyStats.completed}/${weeklyStats.planned} sessions`,
        change: 15
      });
    }

    return insights;
  }, [currentReadiness, todaySessions, weeklyStats]);
};
