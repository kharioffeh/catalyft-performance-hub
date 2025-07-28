
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SessionDetailsDialog } from '@/components/SessionDetailsDialog';
// CreateSessionDialog removed for solo experience
import { Play, Clock, Users, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface Session {
  id: string;
  athlete_uuid: string;
  coach_uuid: string;
  type: string;
  start_ts: string;
  end_ts: string;
  notes?: string;
  status?: string;
  athletes?: {
    name: string;
  };
}

interface TrainingSessionsListProps {
  sessions: Session[];
  isLoading: boolean;
  isCoach?: boolean; // Made optional since we'll determine this internally
}

export const TrainingSessionsList: React.FC<TrainingSessionsListProps> = ({
  sessions,
  isLoading,
  isCoach, // Keep for backward compatibility
}) => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // For solo functionality, only allow editing user's own sessions
  const canEditSession = (session: Session | null) => {
    if (!session || !profile) return false;
    return session.athlete_uuid === profile.id;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-300';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-300';
      case 'planned':
        return 'bg-yellow-500/20 text-yellow-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'strength':
        return 'bg-green-500/20 text-green-300';
      case 'technical':
        return 'bg-blue-500/20 text-blue-300';
      case 'recovery':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'conditioning':
        return 'bg-purple-500/20 text-purple-300';
      case 'assessment':
        return 'bg-orange-500/20 text-orange-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsDetailsOpen(true);
  };

  const handleCreateSession = () => {
    setIsCreateOpen(true);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">My Sessions</h2>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-white/10 border-white/20 animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-white/20 rounded w-1/4"></div>
                  <div className="h-4 bg-white/20 rounded w-1/2"></div>
                  <div className="h-4 bg-white/20 rounded w-1/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">My Sessions</h2>
        </div>
        <Card className="bg-white/10 border-white/20">
          <CardContent className="p-8 text-center">
            <Clock className="mx-auto h-12 w-12 text-white/50 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No sessions scheduled</h3>
            <p className="text-white/70 mb-4">
              You haven't scheduled any training sessions yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">My Sessions</h2>
        </div>

        <div className="grid gap-4">
          {sessions.map((session) => (
            <Card 
              key={session.id} 
              className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors cursor-pointer"
              onClick={() => handleSessionClick(session)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white capitalize">
                    {session.type} Session
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={getTypeColor(session.type)}>
                      {session.type}
                    </Badge>
                    {session.status && (
                      <Badge className={getStatusColor(session.status)}>
                        {session.status.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(session.start_ts), 'MMM d, yyyy')} at{' '}
                      {format(new Date(session.start_ts), 'h:mm a')}
                    </span>
                  </div>
                  {session.athletes?.name && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Athlete: {session.athletes.name}</span>
                    </div>
                  )}
                  {session.notes && (
                    <p className="text-white/60 text-xs mt-2 line-clamp-2">
                      {session.notes}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dialogs */}
      <SessionDetailsDialog
        session={selectedSession}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        queryClient={queryClient}
        canEdit={canEditSession(selectedSession)}
      />

      {/* Session creation dialog removed for solo experience */}
    </>
  );
};
