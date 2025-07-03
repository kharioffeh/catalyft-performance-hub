
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SessionDetailsDialog } from '@/components/SessionDetailsDialog';
import { CreateSessionDialog } from '@/components/CreateSessionDialog';
import { Play, Clock, Users, Plus } from 'lucide-react';

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
  isCoach: boolean;
}

export const TrainingSessionsList: React.FC<TrainingSessionsListProps> = ({
  sessions,
  isLoading,
  isCoach,
}) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  const handleSessionClick = (session: Session) => {
    setSelectedSession(session);
    setIsDetailsOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-32 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        type="sessions"
        metric="sessions"
        onAction={() => setIsCreateOpen(true)}
        className="h-[400px]"
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {/* Header with Create button */}
        {isCoach && (
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-white">Training Sessions</h3>
              <p className="text-sm text-white/70">Manage and track all training sessions</p>
            </div>
            <Button
              onClick={() => setIsCreateOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Session
            </Button>
          </div>
        )}

        {/* Sessions List */}
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
              onClick={() => handleSessionClick(session)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10">
                      <Play className="w-5 h-5 text-white" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-white capitalize">
                          {session.type} Session
                        </h4>
                        {session.status && (
                          <Badge className={getStatusColor(session.status)}>
                            {session.status.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-white/70">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {format(new Date(session.start_ts), 'MMM dd, HH:mm')}
                        </div>
                        
                        {session.athletes?.name && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {session.athletes.name}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-white/70">
                      Duration: {
                        Math.round(
                          (new Date(session.end_ts).getTime() - new Date(session.start_ts).getTime()) / 
                          (1000 * 60)
                        )
                      } min
                    </div>
                  </div>
                </div>

                {session.notes && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-sm text-white/70 line-clamp-2">
                      {session.notes}
                    </p>
                  </div>
                )}
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
        queryClient={null}
        canEdit={isCoach}
      />

      <CreateSessionDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </>
  );
};
