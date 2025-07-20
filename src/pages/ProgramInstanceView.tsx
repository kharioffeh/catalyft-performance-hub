
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProgramInstance } from '@/hooks/useProgramInstances';
import { useSessions } from '@/hooks/useSessions';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Target, Play, CheckCircle } from 'lucide-react';
import { SessionOverviewModal } from '@/components/training/SessionOverviewModal';
import { LiveSessionModal } from '@/components/training/LiveSessionModal';

export const ProgramInstanceView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: programInstance, isLoading } = useProgramInstance(id!);
  const { data: sessions = [] } = useSessions();
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [liveSession, setLiveSession] = useState<any>(null);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const [liveOpen, setLiveOpen] = useState(false);

  // Filter sessions for this program
  const programSessions = sessions.filter(s => s.program_id === id);

  const handleViewSession = (session: any) => {
    setSelectedSession(session);
    setOverviewOpen(true);
  };

  const handleStartSession = (session: any) => {
    setLiveSession(session);
    setLiveOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-brand-charcoal p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-white/20 rounded w-64"></div>
            <div className="h-64 bg-white/20 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!programInstance) {
    return (
      <div className="min-h-screen bg-brand-charcoal p-4 md:p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-white">Program not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-charcoal p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Program Header */}
        <GlassCard className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {programInstance.template?.title || 'Training Program'}
              </h1>
              <div className="flex items-center gap-4 text-white/70">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  <span>{programInstance.template?.goal || 'General Fitness'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{programInstance.template?.weeks || 4} weeks</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{new Date(programInstance.start_date).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <Badge 
              variant={programInstance.status === 'active' ? 'default' : 'secondary'}
              className="capitalize"
            >
              {programInstance.status}
            </Badge>
          </div>
        </GlassCard>

        {/* Sessions Grid */}
        <GlassCard className="p-6">
          <h2 className="text-xl font-bold text-white mb-4">Training Sessions</h2>
          
          {programSessions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/60">No sessions found for this program</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {programSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-white">Session {index + 1}</h3>
                      <p className="text-white/60 text-sm">
                        {new Date(session.planned_at).toLocaleDateString()}
                      </p>
                    </div>
                    {session.completed_at && (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-white/80 text-sm">
                      {session.exercises?.length || 0} exercises
                    </p>
                    <p className="text-white/60 text-xs">
                      {session.type || 'Training'} Session
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewSession(session)}
                      className="flex-1 bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      View Details
                    </Button>
                    {!session.completed_at && (
                      <Button
                        size="sm"
                        onClick={() => handleStartSession(session)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Session Overview Modal */}
        <SessionOverviewModal
          session={selectedSession}
          open={overviewOpen}
          onOpenChange={setOverviewOpen}
          onStartSession={(session) => {
            setOverviewOpen(false);
            handleStartSession(session);
          }}
        />

        {/* Live Session Modal */}
        <LiveSessionModal
          session={liveSession}
          open={liveOpen}
          onOpenChange={setLiveOpen}
        />
      </div>
    </div>
  );
};

export default ProgramInstanceView;
