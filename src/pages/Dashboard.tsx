
import React from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const Dashboard: React.FC = () => {
  const { profile } = useAuth();

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

  const { data: sleepData } = useQuery({
    queryKey: ['sleep-7day', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from('wearable_raw')
        .select('value, ts')
        .eq('athlete_uuid', profile.id)
        .eq('metric', 'sleep_efficiency')
        .gte('ts', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('ts', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    enabled: !!profile?.id
  });

  const generatePlan = async () => {
    console.log('Generating training plan...');
    // This would call an RPC to OpenAI
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <Button 
            onClick={generatePlan}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl px-6 py-2 shadow-sm"
          >
            Generate Plan
          </Button>
        </div>

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
              {sleepData.length > 0 ? (
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
