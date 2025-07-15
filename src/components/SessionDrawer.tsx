import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, FileText, Play } from 'lucide-react';
import { Session } from '@/types/training';
import { useUpdateSession } from '@/hooks/useSessions';
import { useGlassToast } from '@/hooks/useGlassToast';
import { format } from 'date-fns';

interface SessionDrawerProps {
  session: Session | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SessionDrawer: React.FC<SessionDrawerProps> = ({ 
  session, 
  open, 
  onOpenChange 
}) => {
  const updateSession = useUpdateSession();
  const toast = useGlassToast();

  const handleStartSession = async () => {
    if (!session) return;

    try {
      await updateSession.mutateAsync({
        id: session.id,
        status: 'active'
      });
      
      toast.success('Session Started', 'Your training session is now in progress');
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to start session:', error);
      toast.error('Failed to Start', 'Could not start the session. Please try again.');
    }
  };

  if (!session) return null;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'in-progress':
        return 'bg-blue-500/20 text-blue-600 border-blue-500/30';
      case 'completed':
        return 'bg-green-500/20 text-green-600 border-green-500/30';
      case 'scheduled':
      default:
        return 'bg-gray-500/20 text-gray-600 border-gray-500/30';
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="space-y-4">
          <SheetTitle className="text-xl font-semibold">
            {session.title || 'Training Session'}
          </SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6 mt-6">
          {/* Session Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <Badge className={getStatusColor(session.status)}>
              {session.status === 'active' ? 'Active' : 
               session.status === 'completed' ? 'Completed' :
               'Planned'}
            </Badge>
          </div>

          {/* Planned Date */}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <div>
              <div className="text-sm font-medium">Planned Date</div>
              <div className="text-sm text-gray-600">
                {format(new Date(session.planned_at), 'EEEE, MMMM d, yyyy')}
              </div>
            </div>
          </div>

          {/* Completed Date */}
          {session.completed_at && (
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-500" />
              <div>
                <div className="text-sm font-medium">Completed</div>
                <div className="text-sm text-gray-600">
                  {format(new Date(session.completed_at), 'EEEE, MMMM d, yyyy')}
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {session.notes && (
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <div className="text-sm font-medium">Notes</div>
                <div className="text-sm text-gray-600 mt-1">
                  {session.notes}
                </div>
              </div>
            </div>
          )}

          {/* RPE */}
          {session.rpe && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">RPE</span>
              <Badge variant="outline">{session.rpe}/10</Badge>
            </div>
          )}

          {/* Exercises */}
          {session.exercises && session.exercises.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2">Exercises</div>
              <div className="space-y-2">
                {session.exercises.slice(0, 3).map((exercise, index) => (
                  <div key={index} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    Exercise {index + 1}: {exercise.sets} sets × {exercise.reps} reps
                    {exercise.load_kg && ` @ ${exercise.load_kg}kg`}
                  </div>
                ))}
                {session.exercises.length > 3 && (
                  <div className="text-sm text-gray-500">
                    +{session.exercises.length - 3} more exercises
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Start Button */}
          {session.status !== 'completed' && session.status !== 'active' && (
            <Button
              onClick={handleStartSession}
              disabled={updateSession.isPending}
              className="w-full flex items-center gap-2"
              size="lg"
            >
              <Play className="w-4 h-4" />
              {updateSession.isPending ? 'Starting...' : 'Start Session'}
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};