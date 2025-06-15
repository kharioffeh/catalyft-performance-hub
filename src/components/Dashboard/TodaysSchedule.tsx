
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface TodaysScheduleProps {
  todaySessions: any[];
}

export const TodaysSchedule: React.FC<TodaysScheduleProps> = ({ todaySessions }) => {
  return (
    <div className="glass-card p-6 min-h-[220px]">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-white/70" />
        <h3 className="text-lg font-semibold text-white">Today's Schedule</h3>
      </div>
      <p className="text-sm text-white/60 mb-6">Your planned training sessions for today</p>
      
      {todaySessions.length === 0 ? (
        <div className="text-center py-8 text-white/50">
          <Calendar className="w-12 h-12 mx-auto mb-4 text-white/30" />
          <p className="text-white/70">No sessions scheduled for today</p>
          <p className="text-sm text-white/50">Perfect time for recovery and preparation</p>
        </div>
      ) : (
        <div className="space-y-3">
          {todaySessions.map((session) => (
            <div key={session.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="capitalize bg-white/10 border-white/20 text-white">
                  {session.type}
                </Badge>
                <div>
                  <div className="font-medium text-white">
                    {format(new Date(session.start_ts), 'h:mm a')} - 
                    {format(new Date(session.end_ts), 'h:mm a')}
                  </div>
                  {session.notes && (
                    <div className="text-sm text-white/60">{session.notes}</div>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                View Details
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
