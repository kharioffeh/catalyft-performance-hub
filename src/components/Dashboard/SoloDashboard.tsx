import React from 'react';
import { DashboardHeader } from './DashboardHeader';
import { QuickStatusCards } from './QuickStatusCards';
import { TodaysSchedule } from './TodaysSchedule';
import { QuickActions } from './QuickActions';
import { InsightsPanel } from '@/components/InsightsPanel';
import { InjuryForecastCard } from '@/components/InjuryForecastCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Brain, Target } from 'lucide-react';

interface SoloDashboardProps {
  currentReadiness: any;
  todaySessions: any[];
  weeklyStats: any;
  injuryRisk: any;
  insights: any[];
}

export const SoloDashboard: React.FC<SoloDashboardProps> = ({
  currentReadiness,
  todaySessions,
  weeklyStats,
  injuryRisk,
  insights
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <DashboardHeader userRole="solo-athlete" />
      
      <QuickStatusCards 
        currentReadiness={currentReadiness}
        todaySessions={todaySessions}
        weeklyStats={weeklyStats}
        injuryRisk={injuryRisk}
      />

      {/* Solo Athlete Specific Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            AI-Powered Solo Training
          </CardTitle>
          <CardDescription>
            Get personalized insights and training recommendations powered by our AI coach
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/chat')} className="flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Chat with ARIA
            </Button>
            <Button variant="outline" onClick={() => navigate('/templates')} className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              Training Templates
            </Button>
          </div>
        </CardContent>
      </Card>

      <TodaysSchedule todaySessions={todaySessions} />

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightsPanel insights={insights} />
        <InjuryForecastCard />
      </div>

      <QuickActions userRole="solo-athlete" />
    </div>
  );
};
