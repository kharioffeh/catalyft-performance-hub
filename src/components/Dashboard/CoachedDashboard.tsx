
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
import { MessageSquare, Users } from 'lucide-react';

interface CoachedDashboardProps {
  currentReadiness: any;
  todaySessions: any[];
  weeklyStats: any;
  injuryRisk: any;
  insights: any[];
}

export const CoachedDashboard: React.FC<CoachedDashboardProps> = ({
  currentReadiness,
  todaySessions,
  weeklyStats,
  injuryRisk,
  insights
}) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <DashboardHeader userRole="coached-athlete" />
      
      <QuickStatusCards 
        currentReadiness={currentReadiness}
        todaySessions={todaySessions}
        weeklyStats={weeklyStats}
        injuryRisk={injuryRisk}
      />

      {/* Coached Athlete Specific Card */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-green-600" />
            Coach Connection
          </CardTitle>
          <CardDescription>
            Stay connected with your coach and access your personalized training program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/chat')} className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Message Coach
            </Button>
            <Button variant="outline" onClick={() => navigate('/training-plan')}>
              View Training Plan
            </Button>
          </div>
        </CardContent>
      </Card>

      <TodaysSchedule todaySessions={todaySessions} />

      <div className="grid gap-6 lg:grid-cols-2">
        <InsightsPanel insights={insights} />
        <InjuryForecastCard />
      </div>

      <QuickActions userRole="coached-athlete" />
    </div>
  );
};
