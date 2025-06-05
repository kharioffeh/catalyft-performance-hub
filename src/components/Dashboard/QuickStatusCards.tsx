
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, BarChart3, AlertTriangle } from 'lucide-react';

interface QuickStatusCardsProps {
  currentReadiness: any;
  todaySessions: any[];
  weeklyStats: any;
  injuryRisk: any;
}

export const QuickStatusCards: React.FC<QuickStatusCardsProps> = ({
  currentReadiness,
  todaySessions,
  weeklyStats,
  injuryRisk
}) => {
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
  );
};
