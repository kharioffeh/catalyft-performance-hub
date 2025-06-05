
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { InsightsPanel } from '@/components/InsightsPanel';
import { format, startOfDay, endOfDay, addDays } from 'date-fns';
import { AriaSummary } from '@/components/AriaSummary';
import { InjuryForecastCard } from '@/components/InjuryForecastCard';
import { Calendar, BarChart3, Activity, Users, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();

  // Current readiness
  const { data: currentReadiness } = useQuery({
    queryKey: ['current-readiness', profile?.id],
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

  // Today's scheduled sessions
  const { data: todaySessions = [] } = useQuery({
    queryKey: ['today-sessions', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const today = new Date();
      const { data, error } = await supabase
        .from('sessions')
        .select('id, start_ts, end_ts, type, notes')
        .eq('athlete_uuid', profile.id)
        .gte('start_ts', startOfDay(today).toISOString())
        .lte('start_ts', endOfDay(today).toISOString())
        .order('start_ts', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  // Weekly session count
  const { data: weeklyStats } = useQuery({
    queryKey: ['weekly-stats', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return { completed: 0, planned: 0 };

      const weekStart = startOfDay(new Date());
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekEnd = addDays(weekStart, 6);

      const { data, error } = await supabase
        .from('sessions')
        .select('id, start_ts, end_ts')
        .eq('athlete_uuid', profile.id)
        .gte('start_ts', weekStart.toISOString())
        .lte('start_ts', weekEnd.toISOString());

      if (error) throw error;
      
      const now = new Date();
      const completed = data?.filter(s => new Date(s.end_ts) < now).length || 0;
      const planned = data?.length || 0;

      return { completed, planned };
    },
    enabled: !!profile?.id
  });

  // Latest injury risk
  const { data: injuryRisk } = useQuery({
    queryKey: ['latest-injury-risk', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('injury_risk_forecast')
        .select('probabilities, forecast_date')
        .eq('athlete_uuid', profile.id)
        .order('forecast_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!profile?.id
  });

  // Quick insights
  const insights = React.useMemo(() => {
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

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadinessStatus = (score: number) => {
    if (score >= 80) return 'Optimal';
    if (score >= 60) return 'Moderate';
    return 'Low';
  };

  const getRiskLevel = (probabilities: any) => {
    if (!probabilities) return { level: 'Unknown', color: 'text-gray-600' };
    
    const highRisk = probabilities.high || 0;
    if (highRisk > 0.3) return { level: 'High', color: 'text-red-600' };
    if (highRisk > 0.15) return { level: 'Moderate', color: 'text-yellow-600' };
    return { level: 'Low', color: 'text-green-600' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {profile?.role === 'coach' ? 'Coach Dashboard' : 'Dashboard'}
          </h1>
          <p className="text-gray-600">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate('/analytics')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            View Analytics
          </Button>
          <Button 
            onClick={() => navigate('/calendar')}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Schedule
          </Button>
        </div>
      </div>

      {/* Quick Status Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Readiness</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {currentReadiness ? (
              <div>
                <div className={`text-2xl font-bold ${getReadinessColor(currentReadiness.score)}`}>
                  {Math.round(currentReadiness.score)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {getReadinessStatus(currentReadiness.score)} • Today
                </p>
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-400">--</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sessions</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaySessions.length}</div>
            <p className="text-xs text-muted-foreground">
              {todaySessions.length === 0 ? 'Rest day' : 
               todaySessions.length === 1 ? 'session planned' : 
               'sessions planned'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {weeklyStats?.completed || 0}/{weeklyStats?.planned || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              sessions completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Injury Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {injuryRisk ? (
              <div>
                <div className={`text-2xl font-bold ${getRiskLevel(injuryRisk.probabilities).color}`}>
                  {getRiskLevel(injuryRisk.probabilities).level}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current forecast
                </p>
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-400">--</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Schedule
          </CardTitle>
          <CardDescription>Your planned training sessions for today</CardDescription>
        </CardHeader>
        <CardContent>
          {todaySessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No sessions scheduled for today</p>
              <p className="text-sm">Perfect time for recovery and preparation</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="capitalize">
                      {session.type}
                    </Badge>
                    <div>
                      <div className="font-medium">
                        {format(new Date(session.start_ts), 'h:mm a')} - 
                        {format(new Date(session.end_ts), 'h:mm a')}
                      </div>
                      {session.notes && (
                        <div className="text-sm text-gray-600">{session.notes}</div>
                      )}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Insights and Risk Forecast */}
      <div className="grid gap-6 lg:grid-cols-2">
        {profile?.role === 'coach' ? (
          <>
            <AriaSummary />
            <InjuryForecastCard />
          </>
        ) : (
          <>
            <InsightsPanel insights={insights} />
            <InjuryForecastCard />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Navigate to key areas of your training platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-12"
              onClick={() => navigate('/analytics')}
            >
              <BarChart3 className="w-5 h-5" />
              Performance Analytics
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 h-12"
              onClick={() => navigate('/calendar')}
            >
              <Calendar className="w-5 h-5" />
              Training Calendar
            </Button>
            {profile?.role === 'coach' && (
              <Button 
                variant="outline" 
                className="flex items-center gap-2 h-12"
                onClick={() => navigate('/athletes')}
              >
                <Users className="w-5 h-5" />
                Manage Athletes
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
