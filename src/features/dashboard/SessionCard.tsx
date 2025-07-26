import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Trophy } from 'lucide-react';
import { format } from 'date-fns';
import GlassCard from '@/components/ui/GlassCard';
import { usePRs } from '@/hooks/usePRs';

interface Session {
  id: string;
  athlete_uuid: string;
  coach_uuid: string;
  type: string;
  start_ts: string;
  end_ts: string;
  status: 'planned' | 'active' | 'completed';
  notes?: string;
  exercises?: Array<{
    name: string;
    sets?: number;
    reps?: number;
    load?: number;
  }>;
}

interface SessionCardProps {
  session: Session;
  onViewDetails?: () => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, onViewDetails }) => {
  // Get the first exercise name for PR lookup (simplified for this implementation)
  const mainExercise = session.exercises?.[0]?.name || '';
  const { data: prs } = usePRs(mainExercise);
  
  // Check if any PR was achieved on the same date as this session
  const sessionDate = format(new Date(session.start_ts), 'yyyy-MM-dd');
  const prBadges = [];
  
  if (prs) {
    Object.entries(prs).forEach(([prType, prRecord]) => {
      if (format(new Date(prRecord.achieved_at), 'yyyy-MM-dd') === sessionDate) {
        let badgeText = '';
        switch (prType) {
          case '1rm':
            badgeText = `New 1RM: ${prRecord.value} ${prRecord.unit}`;
            break;
          case '3rm':
            badgeText = `New 3RM: ${prRecord.value} ${prRecord.unit}`;
            break;
          case 'velocity':
            badgeText = `New Velocity: ${prRecord.value} ${prRecord.unit}`;
            break;
        }
        prBadges.push(badgeText);
      }
    });
  }

  return (
    <GlassCard className="p-4 hover:bg-white/10 transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge 
            variant="outline" 
            className="capitalize bg-white/10 border-white/20 text-white"
          >
            {session.type}
          </Badge>
          <div>
            <div className="font-medium text-white">
              {format(new Date(session.start_ts), 'h:mm a')} - 
              {format(new Date(session.end_ts), 'h:mm a')}
            </div>
            {/* PR Badges */}
            {prBadges.length > 0 && (
              <div className="mt-1">
                {prBadges.map((badgeText, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1 bg-brand-blue text-charcoal px-2 py-1 rounded-full text-xs font-semibold mr-2"
                  >
                    <Trophy className="w-3 h-3" />
                    {badgeText}
                  </div>
                ))}
              </div>
            )}
            {session.notes && (
              <div className="text-sm text-white/60 mt-1">{session.notes}</div>
            )}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-white/70 hover:text-white hover:bg-white/10"
          onClick={onViewDetails}
        >
          View Details
        </Button>
      </div>
    </GlassCard>
  );
};