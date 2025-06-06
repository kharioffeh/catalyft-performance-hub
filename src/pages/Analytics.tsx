
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useEnhancedMetricsWithAthlete } from '@/hooks/useEnhancedMetricsWithAthlete';
import { AthleteSelector } from '@/components/Analytics/AthleteSelector';
import { EnhancedTrainingLoadChart } from '@/components/EnhancedTrainingLoadChart';
import { EnhancedSleepChart } from '@/components/EnhancedSleepChart';
import { ReadinessChart } from '@/components/ReadinessChart';
import { WorkoutVolumeChart } from '@/components/WorkoutVolumeChart';
import { PerformanceMetrics } from '@/components/PerformanceMetrics';
import { useAuth } from '@/contexts/AuthContext';
import { useAthletes } from '@/hooks/useAthletes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

const Analytics: React.FC = () => {
  const { profile } = useAuth();
  const { athletes } = useAthletes();
  
  // State for selected athlete - default to current user for athletes, first athlete for coaches
  const [selectedAthleteId, setSelectedAthleteId] = useState<string>('');

  // Set default selected athlete when data loads
  useEffect(() => {
    if (profile?.role === 'coach' && athletes.length > 0 && !selectedAthleteId) {
      setSelectedAthleteId(athletes[0].id);
    } else if (profile?.role !== 'coach' && profile?.id && !selectedAthleteId) {
      setSelectedAthleteId(profile.id);
    }
  }, [profile, athletes, selectedAthleteId]);

  const { readinessRolling, sleepDaily, loadACWR, latestStrain } = useEnhancedMetricsWithAthlete(selectedAthleteId);

  // Get selected athlete name for display
  const selectedAthlete = athletes.find(a => a.id === selectedAthleteId);
  const displayName = profile?.role === 'coach' ? selectedAthlete?.name || 'Unknown Athlete' : 'My Analytics';

  // 7-day readiness trend for chart
  const { data: readinessTrend = [] } = useQuery({
    queryKey: ['readiness-trend', selectedAthleteId],
    queryFn: async () => {
      if (!selectedAthleteId) return [];

      const { data, error } = await supabase
        .from('readiness_scores')
        .select('score, ts')
        .eq('athlete_uuid', selectedAthleteId)
        .gte('ts', subDays(new Date(), 7).toISOString())
        .order('ts', { ascending: true });

      if (error) throw error;
      return data?.map(item => ({
        date: item.ts,
        score: Math.round(item.score)
      })) || [];
    },
    enabled: !!selectedAthleteId
  });

  // Training sessions for volume calculation
  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions-volume', selectedAthleteId],
    queryFn: async () => {
      if (!selectedAthleteId) return [];

      const { data, error } = await supabase
        .from('sessions')
        .select('start_ts, end_ts, type, load')
        .eq('athlete_uuid', selectedAthleteId)
        .gte('start_ts', subDays(new Date(), 28).toISOString())
        .order('start_ts', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedAthleteId
  });

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
        volume: Math.round(totalLoad / 10) / 10,
        sessions: weekSessions.length
      });
    }
    return weeks;
  }, [sessions]);

  // Generate performance metrics
  const performanceMetrics = React.useMemo(() => {
    const metrics = [];

    if (readinessRolling.length > 0) {
      const latestReadiness = readinessRolling[readinessRolling.length - 1];
      metrics.push({
        name: 'Readiness Score',
        value: Math.round(latestReadiness.readiness_score || 0),
        target: 80,
        unit: '%',
        trend: (latestReadiness.readiness_score || 0) >= 75 ? 'up' : (latestReadiness.readiness_score || 0) >= 65 ? 'stable' : 'down' as const,
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
  }, [readinessRolling, latestStrain, loadACWR, sessions]);

  if (!selectedAthleteId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
          <p className="text-gray-600">
            {profile?.role === 'coach' ? `Analyzing ${displayName}'s performance` : 'Deep dive into training metrics and performance trends'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <AthleteSelector
            selectedAthleteId={selectedAthleteId}
            onAthleteChange={setSelectedAthleteId}
          />
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Analytics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Current Readiness</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {readinessRolling.length > 0 ? 
                Math.round(readinessRolling[readinessRolling.length - 1]?.readiness_score || 0) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              7d avg: {readinessRolling.length > 0 ? 
                Math.round(readinessRolling[readinessRolling.length - 1]?.avg_7d || 0) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>ACWR Status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              loadACWR.length > 0 && loadACWR[loadACWR.length - 1]?.acwr_7_28 > 1.5 ? 'text-red-600' :
              loadACWR.length > 0 && loadACWR[loadACWR.length - 1]?.acwr_7_28 > 1.3 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {loadACWR.length > 0 ? loadACWR[loadACWR.length - 1]?.acwr_7_28?.toFixed(2) : '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Acute:Chronic ratio
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Sleep Efficiency</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {sleepDaily.length > 0 ? 
                Math.round(sleepDaily[sleepDaily.length - 1]?.sleep_efficiency || 0) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Latest night
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Latest Strain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestStrain ? latestStrain.value.toFixed(1) : '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              Yesterday's load
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Analytics Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <EnhancedTrainingLoadChart data={loadACWR} />
        <EnhancedSleepChart data={sleepDaily} />
      </div>

      {/* Trends and Volume Analysis */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ReadinessChart data={readinessTrend} />
        <WorkoutVolumeChart data={volumeData} />
      </div>

      {/* Detailed Performance Metrics */}
      <PerformanceMetrics metrics={performanceMetrics} />
    </div>
  );
};

export default Analytics;
