
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
import { useEnhancedMetrics } from '@/hooks/useEnhancedMetrics';
import { EnhancedTrainingLoadChart } from '@/components/EnhancedTrainingLoadChart';
import { EnhancedSleepChart } from '@/components/EnhancedSleepChart';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const { readinessRolling, sleepDaily, loadACWR, latestStrain } = useEnhancedMetrics();

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

  // Training sessions for volume calculation
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions-volume', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('sessions')
        .select('start_ts, end_ts, type, load')
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

    if (latestStrain && latestStrain.value > 15) {
      insights.push({
        type: 'warning' as const,
        title: 'High Strain Alert',
        description: 'Yesterday\'s strain was elevated. Monitor recovery closely.',
        metric: `Strain: ${latestStrain.value.toFixed(1)}`,
        change: 18
      });
    }

    if (sleepDaily.length > 0) {
      const avgEfficiency = sleepDaily.slice(-7).reduce((sum, item) => sum + (item.sleep_efficiency || 0), 0) / 7;
      if (avgEfficiency > 85) {
        insights.push({
          type: 'positive' as const,
          title: 'Excellent Sleep Quality',
          description: 'Your sleep efficiency has been consistently high this week.',
          metric: `Average efficiency: ${Math.round(avgEfficiency)}%`,
          change: 8
        });
      }
    }

    if (loadACWR.length > 0) {
      const latestACWR = loadACWR[loadACWR.length - 1];
      if (latestACWR?.acwr_7_28 > 1.5) {
        insights.push({
          type: 'warning' as const,
          title: 'High ACWR Detected',
          description: 'Your training load ratio is elevated. Consider reducing intensity.',
          metric: `ACWR: ${latestACWR.acwr_7_28.toFixed(2)}`,
          change: 25
        });
      }
    }

    return insights;
  }, [readinessData, latestStrain, sleepDaily, loadACWR]);

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

      const totalLoad = weekSessions.reduce((sum, session) => sum + (session.load || 0), 0);

      weeks.push({
        week: format(weekStart, 'MMM dd'),
        volume: Math.round(totalLoad / 10) / 10, // Convert to more readable scale
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

    if (latestStrain) {
      metrics.push({
        name: 'Latest Strain',
        value: Math.round(latestStrain.value * 10) / 10,
        target: 15,
        unit: '',
        trend: latestStrain.value <= 12 ? 'up' : 'down' as const,
        change: 8
      });
    }

    if (loadACWR.length > 0) {
      const latestACWR = loadACWR[loadACWR.length - 1];
      metrics.push({
        name: 'ACWR Ratio',
        value: Math.round((latestACWR?.acwr_7_28 || 0) * 100) / 100,
        target: 1.3,
        unit: '',
        trend: (latestACWR?.acwr_7_28 || 0) <= 1.3 ? 'up' : 'down' as const,
        change: 15
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
  }, [readinessData, latestStrain, loadACWR, sessions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Enhanced Analytics Dashboard</h1>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          Generate AI Report
        </Button>
      </div>

      {/* Key Metrics Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle>Latest Strain</CardTitle>
            <CardDescription>Most recent strain value</CardDescription>
          </CardHeader>
          <CardContent>
            {latestStrain ? (
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {latestStrain.value.toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(latestStrain.ts).toLocaleDateString()}
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No strain data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ACWR Status</CardTitle>
            <CardDescription>Acute:Chronic workload ratio</CardDescription>
          </CardHeader>
          <CardContent>
            {loadACWR.length > 0 ? (
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${
                  loadACWR[loadACWR.length - 1]?.acwr_7_28 > 1.5 ? 'text-red-600' :
                  loadACWR[loadACWR.length - 1]?.acwr_7_28 > 1.3 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {loadACWR[loadACWR.length - 1]?.acwr_7_28?.toFixed(2) || '0.00'}
                </div>
                <div className="text-sm text-gray-500">
                  Training load ratio
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No load data available
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

      {/* Enhanced Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EnhancedTrainingLoadChart data={loadACWR} />
        <EnhancedSleepChart data={sleepDaily} />
      </div>

      {/* Original Charts for Comparison */}
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
