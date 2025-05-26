
import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Dashboard: React.FC = () => {
  const { profile, error: authError } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);

  console.log('Dashboard: Rendering with profile:', profile, 'authError:', authError);

  // Show auth error if present
  if (authError) {
    return (
      <AppLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Authentication error: {authError}
          </AlertDescription>
        </Alert>
      </AppLayout>
    );
  }

  // Early return with loading state if no profile
  if (!profile) {
    console.log('Dashboard: No profile found, showing loading...');
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const { data: subscriptionData, error: subscriptionError } = useQuery({
    queryKey: ['subscription', profile?.id],
    queryFn: async () => {
      console.log('Dashboard: Fetching subscription data for:', profile?.id);
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', profile.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Dashboard: Subscription query error:', error);
        throw error;
      }
      console.log('Dashboard: Subscription data:', data);
      return data;
    },
    enabled: !!profile?.id
  });

  const { data: athleteCount = 0, error: athleteCountError } = useQuery({
    queryKey: ['athlete-count', profile?.id],
    queryFn: async () => {
      console.log('Dashboard: Fetching athlete count for:', profile?.id);
      if (!profile?.id) return 0;

      const { data, error } = await supabase.rpc('get_user_athlete_count', {
        user_uuid: profile.id
      });

      if (error) {
        console.error('Dashboard: Athlete count error:', error);
        throw error;
      }
      console.log('Dashboard: Athlete count:', data);
      return data || 0;
    },
    enabled: !!profile?.id
  });

  const { data: readinessData, error: readinessError } = useQuery({
    queryKey: ['readiness-latest', profile?.id],
    queryFn: async () => {
      console.log('Dashboard: Fetching readiness data for:', profile?.id);
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('readiness_scores')
        .select('score, ts')
        .eq('athlete_uuid', profile.id)
        .order('ts', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Dashboard: Readiness query error:', error);
        throw error;
      }
      console.log('Dashboard: Readiness data:', data);
      return data;
    },
    enabled: !!profile?.id
  });

  const { data: sleepData = [], error: sleepError } = useQuery({
    queryKey: ['sleep-7day', profile?.id],
    queryFn: async () => {
      console.log('Dashboard: Fetching sleep data for:', profile?.id);
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('wearable_raw')
        .select('value, ts')
        .eq('athlete_uuid', profile.id)
        .eq('metric', 'sleep_efficiency')
        .gte('ts', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('ts', { ascending: true });

      if (error) {
        console.error('Dashboard: Sleep data error:', error);
        throw error;
      }
      console.log('Dashboard: Sleep data:', data);
      return data || [];
    },
    enabled: !!profile?.id
  });

  const { data: upcomingSessions = [], error: sessionsError } = useQuery({
    queryKey: ['sessions-7day', profile?.id],
    queryFn: async () => {
      console.log('Dashboard: Fetching sessions for:', profile?.id);
      if (!profile?.id) return [];

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('athlete_uuid', profile.id)
        .gte('start_ts', new Date().toISOString())
        .lte('start_ts', sevenDaysFromNow.toISOString())
        .order('start_ts', { ascending: true });

      if (error) {
        console.error('Dashboard: Sessions error:', error);
        throw error;
      }
      console.log('Dashboard: Sessions data:', data);
      return data || [];
    },
    enabled: !!profile?.id
  });

  // Log any query errors
  if (subscriptionError) console.error('Subscription error:', subscriptionError);
  if (athleteCountError) console.error('Athlete count error:', athleteCountError);
  if (readinessError) console.error('Readiness error:', readinessError);
  if (sleepError) console.error('Sleep error:', sleepError);
  if (sessionsError) console.error('Sessions error:', sessionsError);

  const generatePlan = async () => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "User profile not found",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      console.log('Generating training plan with data:', {
        readinessData,
        upcomingSessions
      });

      const { data, error } = await supabase.functions.invoke('generate-training-plan', {
        body: {
          athleteId: profile.id,
          readinessData: readinessData || {},
          calendarData: upcomingSessions
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Training plan generated and saved successfully!",
      });

      console.log('Generated workout plan:', data.workoutPlan);

    } catch (error) {
      console.error('Error generating plan:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate training plan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  console.log('Dashboard: Rendering main content');

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button 
            onClick={generatePlan}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl px-6 py-2 shadow-sm"
          >
            {isGenerating ? 'Generating...' : 'Generate Plan'}
          </Button>
        </div>

        {/* Subscription Status Card */}
        {subscriptionData ? (
          <Card className="border-l-4 border-l-green-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="default" className="mb-2">
                    {subscriptionData.plan?.name} Plan
                  </Badge>
                  <p className="text-sm text-gray-600">
                    £{subscriptionData.plan?.price_monthly}/month
                  </p>
                  {subscriptionData.plan?.athlete_limit && (
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {athleteCount}/{subscriptionData.plan.athlete_limit} athletes used
                      </span>
                    </div>
                  )}
                </div>
                <Link to="/subscription">
                  <Button variant="outline" size="sm">
                    Manage Plan
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle>No Active Subscription</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Upgrade to unlock AI-powered training plans and advanced features.
              </p>
              <Link to="/subscription">
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  View Plans
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Readiness KPI Card */}
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

          {/* Sleep Sparkline */}
          <Card>
            <CardHeader>
              <CardTitle>7-Day Sleep</CardTitle>
              <CardDescription>Sleep efficiency trend</CardDescription>
            </CardHeader>
            <CardContent>
              {sleepData && sleepData.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {Math.round(sleepData[sleepData.length - 1]?.value || 0)}%
                  </div>
                  <div className="text-sm text-gray-500">
                    Latest sleep efficiency
                  </div>
                  {/* Simple sparkline representation */}
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

          {/* Load vs Chronic placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Load Analysis</CardTitle>
              <CardDescription>Last 30 sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-gray-500">
                Load vs chronic workload chart
                <br />
                <small>Coming soon</small>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
