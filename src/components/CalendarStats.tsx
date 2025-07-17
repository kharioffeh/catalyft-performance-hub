
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

interface Session {
  id: string;
  athlete_uuid: string;
  type: string;
  start_ts: string;
  end_ts: string;
  athletes?: {
    name: string;
  };
}

interface CalendarStatsProps {
  sessions: Session[];
}

export const CalendarStats: React.FC<CalendarStatsProps> = ({ sessions }) => {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday

  // Filter sessions for this week
  const thisWeekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.start_ts);
    return isWithinInterval(sessionDate, { start: weekStart, end: weekEnd });
  });

  // Calculate stats
  const totalSessions = thisWeekSessions.length;
  const uniqueAthletes = new Set(thisWeekSessions.map(s => s.athlete_uuid)).size;
  
  const totalHours = thisWeekSessions.reduce((acc, session) => {
    const start = new Date(session.start_ts);
    const end = new Date(session.end_ts);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return acc + hours;
  }, 0);

  // Session type breakdown
  const sessionTypes = thisWeekSessions.reduce((acc, session) => {
    acc[session.type] = (acc[session.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-green-100 text-green-800';
      case 'technical':
        return 'bg-blue-100 text-blue-800';
      case 'recovery':
        return 'bg-yellow-100 text-yellow-800';
      case 'conditioning':
        return 'bg-purple-100 text-purple-800';
      case 'assessment':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Week</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-display font-bold">{totalSessions}</div>
          <p className="text-xs text-muted-foreground">
            Sessions scheduled
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Athletes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-display font-bold">{uniqueAthletes}</div>
          <p className="text-xs text-muted-foreground">
            Athletes training
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Training Hours</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-display font-bold">{totalHours.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            Hours scheduled
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Session Types</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            {Object.entries(sessionTypes).map(([type, count]) => (
              <Badge key={type} className={getTypeColor(type)} variant="secondary">
                {type}: {count}
              </Badge>
            ))}
            {Object.keys(sessionTypes).length === 0 && (
              <span className="text-xs text-muted-foreground">No sessions</span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
