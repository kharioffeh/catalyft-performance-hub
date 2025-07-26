
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import GlassCard from '@/components/ui/GlassCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { SessionCard } from '@/features/dashboard/SessionCard';

interface TodaysScheduleProps {
  todaySessions: any[];
}

export const TodaysSchedule: React.FC<TodaysScheduleProps> = ({ todaySessions }) => {
  return (
    <GlassCard className="p-6 min-h-[220px]">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-white/70" />
        <h3 className="text-lg font-semibold text-white">Today's Schedule</h3>
      </div>
      <p className="text-sm text-white/60 mb-6">Your planned training sessions for today</p>
      
      {todaySessions.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No sessions scheduled"
          description="Perfect time for recovery and preparation"
        />
      ) : (
        <div className="space-y-3">
          {todaySessions.map((session) => (
            <SessionCard 
              key={session.id} 
              session={session}
              onViewDetails={() => console.log('View details for session:', session.id)}
            />
          ))}
        </div>
      )}
    </GlassCard>
  );
};
