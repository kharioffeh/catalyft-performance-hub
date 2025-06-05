
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TodaysScheduleProps {
  todaySessions: any[];
}

export const TodaysSchedule: React.FC<TodaysScheduleProps> = ({ todaySessions }) => {
  return (
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
  );
};
