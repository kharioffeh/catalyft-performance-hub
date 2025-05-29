import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { ReadinessChart } from '@/components/ReadinessChart';
import { WorkoutVolumeChart } from '@/components/WorkoutVolumeChart';
import { InsightsPanel } from '@/components/InsightsPanel';
import { PerformanceMetrics } from '@/components/PerformanceMetrics';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';
import { AriaSummary } from '@/components/AriaSummary';
import { InjuryForecastCard } from '@/components/InjuryForecastCard';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

  // Current readiness data
  const { data: readinessData } = useQuery({
    queryKey: ['readiness-latest', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('readiness_scores')
        .select('score, ts')
        .eq('athlete_uuid', profile.id)
        .order('ts', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  // 7-day readiness trend
  const { data: readinessTrend = [] } = useQuery({
    queryKey: ['readiness-trend', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('readiness_scores')
        .select('score, ts')
        .eq('athlete_uuid', profile.id)
        .gte('ts', subDays(new Date(), 7).toISOString())
        .order('ts', { ascending: true });

      if (error) throw error;
      return data?.map(item => ({
        date: item.ts,
        score: Math.round(item.score)
      })) || [];
    },
    enabled: !!profile?.id
  });

  // Sleep data for the week
  const { data: sleepData = [] } = useQuery({
    queryKey: ['sleep-7day', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('wearable_raw')
        .select('value, ts')
        .eq('athlete_uuid', profile.id)
        .eq('metric', 'sleep_efficiency')
        .gte('ts', subDays(new Date(), 7).toISOString())
        .order('ts', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  // Training sessions for volume calculation
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions-volume', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('sessions')
        .select('start_ts, end_ts, type')
        .eq('athlete_uuid', profile.id)
        .gte('start_ts', subDays(new Date(), 28).toISOString())
        .order('start_ts', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  // Generate mock insights for demonstration
  const insights = React.useMemo(() => {
    const insights = [];
    
    if (readinessData && readinessData.score < 70) {
      insights.push({
        type: 'warning' as const,
        title: 'Low Readiness Detected',
        description: 'Your readiness score is below optimal. Consider lighter training or extra recovery.',
        metric: `Current score: ${Math.round(readinessData.score)}%`,
        change: -12
      });
    }

    if (sleepData.length > 0) {
      const avgSleep = sleepData.reduce((sum, item) => sum + item.value, 0) / sleepData.length;
      if (avgSleep > 85) {
        insights.push({
          type: 'positive' as const,
          title: 'Excellent Sleep Quality',
          description: 'Your sleep efficiency has been consistently high this week.',
          metric: `Average efficiency: ${Math.round(avgSleep)}%`,
          change: 8
        });
      }
    }

    if (sessions.length > 0) {
      const thisWeekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.start_ts);
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });

      if (thisWeekSessions.length >= 4) {
        insights.push({
          type: 'positive' as const,
          title: 'Training Consistency',
          description: 'Great job maintaining your training schedule this week.',
          metric: `${thisWeekSessions.length} sessions completed`,
        });
      }
    }

    return insights;
  }, [readinessData, sleepData, sessions]);

  // Generate volume data for chart
  const volumeData = React.useMemo(() => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = startOfWeek(subDays(new Date(), i * 7));
      const weekEnd = endOfWeek(subDays(new Date(), i * 7));
      
      const weekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.start_ts);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });

      const totalHours = weekSessions.reduce((sum, session) => {
        const start = new Date(session.start_ts);
        const end = new Date(session.end_ts);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        return sum + hours;
      }, 0);

      weeks.push({
        week: format(weekStart, 'MMM dd'),
        volume: Math.round(totalHours * 10) / 10,
        sessions: weekSessions.length
      });
    }
    return weeks;
  }, [sessions]);

  // Generate performance metrics
  const performanceMetrics = React.useMemo(() => {
    const metrics = [];

    if (readinessData) {
      metrics.push({
        name: 'Readiness Score',
        value: Math.round(readinessData.score),
        target: 80,
        unit: '%',
        trend: readinessData.score >= 75 ? 'up' : readinessData.score >= 65 ? 'stable' : 'down' as const,
        change: 5
      });
    }

    if (sleepData.length > 0) {
      const avgSleep = sleepData.reduce((sum, item) => sum + item.value, 0) / sleepData.length;
      metrics.push({
        name: 'Sleep Efficiency',
        value: Math.round(avgSleep),
        target: 85,
        unit: '%',
        trend: avgSleep >= 80 ? 'up' : 'stable' as const,
        change: 3
      });
    }

    if (sessions.length > 0) {
      const thisWeek = sessions.filter(session => {
        const sessionDate = new Date(session.start_ts);
        return sessionDate >= startOfWeek(new Date()) && sessionDate <= endOfWeek(new Date());
      });

      metrics.push({
        name: 'Weekly Sessions',
        value: thisWeek.length,
        target: 5,
        unit: '',
        trend: thisWeek.length >= 4 ? 'up' : 'stable' as const,
        change: 20
      });
    }

    return metrics;
  }, [readinessData, sleepData, sessions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          Generate AI Report
        </Button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Current Readiness</CardTitle>
            <CardDescription>Latest readiness score</CardDescription>
          </CardHeader>
          <CardContent>
            {readinessData ? (
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {Math.round(readinessData.score)}%
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(readinessData.ts).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No readiness data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7-Day Sleep</CardTitle>
            <CardDescription>Sleep efficiency trend</CardDescription>
          </CardHeader>
          <CardContent>
            {sleepData.length > 0 ? (
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {Math.round(sleepData[sleepData.length - 1]?.value || 0)}%
                </div>
                <div className="text-sm text-gray-500">
                  Latest sleep efficiency
                </div>
                <div className="h-8 flex items-end space-x-1">
                  {sleepData.map((point, index) => (
                    <div
                      key={index}
                      className="bg-blue-500 rounded-t flex-1"
                      style={{ height: `${(point.value / 100) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No sleep data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Training Load</CardTitle>
            <CardDescription>This week's progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 mb-2">
                {sessions.filter(s => {
                  const sessionDate = new Date(s.start_ts);
                  return sessionDate >= startOfWeek(new Date()) && sessionDate <= endOfWeek(new Date());
                }).length}
              </div>
              <div className="text-sm text-gray-500">
                Sessions completed
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ReadinessChart data={readinessTrend} />
        <WorkoutVolumeChart data={volumeData} />
      </div>

      {/* AI Insights and Injury Forecast */}
      <div className="grid gap-6 lg:grid-cols-2">
        {profile?.role === 'coach' ? (
          <>
            <AriaSummary />
            <InjuryForecastCard />
          </>
        ) : (
          <>
            <InjuryForecastCard />
            <InsightsPanel insights={insights} />
          </>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 lg:grid-cols-1">
        <PerformanceMetrics metrics={performanceMetrics} />
      </div>
    </div>
  );
};

export default Dashboard;
