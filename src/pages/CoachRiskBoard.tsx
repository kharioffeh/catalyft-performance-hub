
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingDown, TrendingUp, Activity, Heart, Moon } from 'lucide-react';

interface AthleteRiskData {
  id: string;
  name: string;
  latest_readiness: number;
  avg_readiness_7d: number;
  latest_strain: number;
  avg_sleep_efficiency: number;
  recent_sessions_count: number;
  last_session_date: string;
  hrv_trend: 'up' | 'down' | 'stable';
  training_load_trend: 'up' | 'down' | 'stable';
}

const CoachRiskBoard: React.FC = () => {
  const { profile } = useAuth();
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteRiskData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: athleteRiskData, isLoading } = useQuery({
    queryKey: ['coach-risk-board', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      // Get athletes with comprehensive risk data
      const { data: athletes, error: athletesError } = await supabase
        .from('athletes')
        .select('id, name')
        .eq('coach_uuid', profile.id);

      if (athletesError) throw athletesError;

      const riskData: AthleteRiskData[] = [];

      for (const athlete of athletes || []) {
        // Get latest readiness score
        const { data: latestReadiness } = await supabase
          .from('readiness_scores')
          .select('score')
          .eq('athlete_uuid', athlete.id)
          .order('ts', { ascending: false })
          .limit(1)
          .single();

        // Get 7-day average readiness
        const { data: weekReadiness } = await supabase
          .from('readiness_scores')
          .select('score')
          .eq('athlete_uuid', athlete.id)
          .gte('ts', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('ts', { ascending: false });

        // Get latest strain
        const { data: latestStrain } = await supabase
          .from('wearable_raw')
          .select('value')
          .eq('athlete_uuid', athlete.id)
          .eq('metric', 'strain')
          .order('ts', { ascending: false })
          .limit(1)
          .single();

        // Get sleep efficiency
        const { data: sleepData } = await supabase
          .from('wearable_raw')
          .select('value')
          .eq('athlete_uuid', athlete.id)
          .eq('metric', 'sleep_efficiency')
          .gte('ts', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('ts', { ascending: false });

        // Get recent sessions
        const { data: recentSessions } = await supabase
          .from('sessions')
          .select('start_ts, type')
          .eq('athlete_uuid', athlete.id)
          .gte('start_ts', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .order('start_ts', { ascending: false });

        // Get HRV data for trend analysis
        const { data: hrvData } = await supabase
          .from('wearable_raw')
          .select('value, ts')
          .eq('athlete_uuid', athlete.id)
          .eq('metric', 'hrv_rmssd')
          .gte('ts', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
          .order('ts', { ascending: false })
          .limit(14);

        // Calculate trends
        const getHrvTrend = () => {
          if (!hrvData || hrvData.length < 7) return 'stable';
          const recent = hrvData.slice(0, 7).reduce((sum, d) => sum + d.value, 0) / 7;
          const older = hrvData.slice(7, 14).reduce((sum, d) => sum + d.value, 0) / 7;
          if (recent > older * 1.05) return 'up';
          if (recent < older * 0.95) return 'down';
          return 'stable';
        };

        const getTrainingLoadTrend = () => {
          if (!recentSessions || recentSessions.length < 3) return 'stable';
          const recentDays = recentSessions.filter(s => 
            new Date(s.start_ts) >= new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          ).length;
          const olderDays = recentSessions.filter(s => 
            new Date(s.start_ts) >= new Date(Date.now() - 6 * 24 * 60 * 60 * 1000) &&
            new Date(s.start_ts) < new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
          ).length;
          
          if (recentDays > olderDays) return 'up';
          if (recentDays < olderDays) return 'down';
          return 'stable';
        };

        riskData.push({
          id: athlete.id,
          name: athlete.name,
          latest_readiness: latestReadiness?.score || 0,
          avg_readiness_7d: weekReadiness?.length ? 
            weekReadiness.reduce((sum, r) => sum + r.score, 0) / weekReadiness.length : 0,
          latest_strain: latestStrain?.value || 0,
          avg_sleep_efficiency: sleepData?.length ?
            sleepData.reduce((sum, s) => sum + s.value, 0) / sleepData.length : 0,
          recent_sessions_count: recentSessions?.length || 0,
          last_session_date: recentSessions?.[0]?.start_ts || '',
          hrv_trend: getHrvTrend(),
          training_load_trend: getTrainingLoadTrend()
        });
      }

      return riskData.sort((a, b) => getRiskScore(a) - getRiskScore(b));
    },
    enabled: !!profile?.id && profile?.role === 'coach'
  });

  const getRiskScore = (athlete: AthleteRiskData) => {
    let score = 0;
    
    // Readiness impact (40% of risk)
    if (athlete.latest_readiness < 60) score += 40;
    else if (athlete.latest_readiness < 75) score += 20;
    
    // Sleep impact (20% of risk)
    if (athlete.avg_sleep_efficiency < 70) score += 20;
    else if (athlete.avg_sleep_efficiency < 85) score += 10;
    
    // Training load impact (20% of risk)
    if (athlete.training_load_trend === 'up' && athlete.latest_readiness < 75) score += 20;
    if (athlete.recent_sessions_count > 6) score += 10;
    
    // HRV trend impact (20% of risk)
    if (athlete.hrv_trend === 'down') score += 20;
    else if (athlete.hrv_trend === 'stable' && athlete.latest_readiness < 70) score += 10;
    
    return score;
  };

  const getRiskLevel = (athlete: AthleteRiskData) => {
    const score = getRiskScore(athlete);
    if (score >= 60) return { label: 'High', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    if (score >= 30) return { label: 'Medium', color: 'bg-amber-100 text-amber-800', icon: TrendingDown };
    return { label: 'Low', color: 'bg-green-100 text-green-800', icon: TrendingUp };
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <div className="w-4 h-4 bg-gray-400 rounded-full" />;
    }
  };

  const openAthleteDetails = (athlete: AthleteRiskData) => {
    setSelectedAthlete(athlete);
    setIsDialogOpen(true);
  };

  if (profile?.role !== 'coach') {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Access denied. This page is only available for coaches.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Risk Board</h1>
          <p className="text-gray-600 mt-2">
            Monitor athlete injury risk and recovery status
          </p>
        </div>
        <div className="flex space-x-2">
          <Badge variant="outline" className="bg-red-50">
            <AlertTriangle className="w-3 h-3 mr-1" />
            High Risk
          </Badge>
          <Badge variant="outline" className="bg-amber-50">
            <TrendingDown className="w-3 h-3 mr-1" />
            Medium Risk
          </Badge>
          <Badge variant="outline" className="bg-green-50">
            <TrendingUp className="w-3 h-3 mr-1" />
            Low Risk
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Athlete Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading risk assessment...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Athlete</TableHead>
                  <TableHead>Readiness</TableHead>
                  <TableHead>Sleep (7d avg)</TableHead>
                  <TableHead>Strain</TableHead>
                  <TableHead>HRV Trend</TableHead>
                  <TableHead>Training Load</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {athleteRiskData?.map((athlete) => {
                  const risk = getRiskLevel(athlete);
                  const RiskIcon = risk.icon;
                  
                  return (
                    <TableRow key={athlete.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{athlete.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{Math.round(athlete.latest_readiness)}%</span>
                          <div className={`w-2 h-2 rounded-full ${
                            athlete.latest_readiness >= 80 ? 'bg-green-500' :
                            athlete.latest_readiness >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`} />
                        </div>
                      </TableCell>
                      <TableCell>{Math.round(athlete.avg_sleep_efficiency)}%</TableCell>
                      <TableCell>{athlete.latest_strain?.toFixed(1) || 'N/A'}</TableCell>
                      <TableCell className="flex items-center">
                        {getTrendIcon(athlete.hrv_trend)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span>{athlete.recent_sessions_count} sessions</span>
                          {getTrendIcon(athlete.training_load_trend)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={risk.color}>
                          <RiskIcon className="w-3 h-3 mr-1" />
                          {risk.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openAthleteDetails(athlete)}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
          
          {(!athleteRiskData || athleteRiskData.length === 0) && !isLoading && (
            <div className="text-center py-8 text-gray-500">
              No athletes found. Add athletes to see their risk assessment.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Athlete Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedAthlete?.name} - Risk Analysis</DialogTitle>
          </DialogHeader>
          
          {selectedAthlete && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Readiness</p>
                          <p className="text-lg font-semibold">{Math.round(selectedAthlete.latest_readiness)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Moon className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-600">Sleep Efficiency</p>
                          <p className="text-lg font-semibold">{Math.round(selectedAthlete.avg_sleep_efficiency)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-5 h-5 text-red-600" />
                        <div>
                          <p className="text-sm text-gray-600">HRV Trend</p>
                          <div className="flex items-center space-x-1">
                            {getTrendIcon(selectedAthlete.hrv_trend)}
                            <span className="text-sm">{selectedAthlete.hrv_trend}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-600">Weekly Sessions</p>
                          <p className="text-lg font-semibold">{selectedAthlete.recent_sessions_count}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Risk Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Overall Risk Score</span>
                        <Badge className={getRiskLevel(selectedAthlete).color}>
                          {getRiskScore(selectedAthlete)}/100
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            getRiskScore(selectedAthlete) >= 60 ? 'bg-red-500' :
                            getRiskScore(selectedAthlete) >= 30 ? 'bg-amber-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(getRiskScore(selectedAthlete), 100)}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="recommendations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedAthlete.latest_readiness < 70 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Low Readiness:</strong> Consider reducing training intensity or implementing a recovery day.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {selectedAthlete.avg_sleep_efficiency < 80 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Poor Sleep Quality:</strong> Focus on sleep hygiene and recovery protocols.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {selectedAthlete.hrv_trend === 'down' && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Declining HRV:</strong> Monitor for overtraining signs and consider deload week.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {selectedAthlete.recent_sessions_count > 6 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>High Training Load:</strong> Ensure adequate recovery between sessions.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {getRiskScore(selectedAthlete) < 30 && (
                      <Alert className="border-green-200 bg-green-50">
                        <TrendingUp className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <strong>Good Status:</strong> Athlete is in good condition for regular training.
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CoachRiskBoard;
