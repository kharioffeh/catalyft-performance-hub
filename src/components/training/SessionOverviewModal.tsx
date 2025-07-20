
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Target, Zap } from 'lucide-react';

interface SessionOverviewModalProps {
  session: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartSession: (session: any) => void;
}

export const SessionOverviewModal: React.FC<SessionOverviewModalProps> = ({
  session,
  open,
  onOpenChange,
  onStartSession
}) => {
  if (!session) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-md border border-white/10 max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-400" />
            Session Overview
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Info */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                {session.title || `Session ${new Date(session.planned_at).toLocaleDateString()}`}
              </h3>
              <p className="text-white/60">
                Planned for {new Date(session.planned_at).toLocaleDateString()}
              </p>
            </div>
            <Badge variant="outline" className="text-white border-white/20">
              {session.type || 'Training'}
            </Badge>
          </div>

          {/* Exercises */}
          <div>
            <h4 className="text-white font-semibold mb-4">Exercises ({session.exercises?.length || 0})</h4>
            <div className="space-y-4">
              {session.exercises?.map((exercise: any, index: number) => (
                <div
                  key={index}
                  className="bg-white/5 border border-white/10 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h5 className="font-medium text-white">{exercise.name}</h5>
                    {exercise.rpe_target && (
                      <Badge variant="secondary" className="bg-orange-500/20 text-orange-200">
                        RPE {exercise.rpe_target}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-white/60">Sets</span>
                      <p className="text-white font-medium">{exercise.sets}</p>
                    </div>
                    <div>
                      <span className="text-white/60">Reps</span>
                      <p className="text-white font-medium">{exercise.reps}</p>
                    </div>
                    {exercise.load_percent && (
                      <div>
                        <span className="text-white/60">Load</span>
                        <p className="text-white font-medium">{exercise.load_percent}% 1RM</p>
                      </div>
                    )}
                    {exercise.rest_seconds && (
                      <div>
                        <span className="text-white/60">Rest</span>
                        <p className="text-white font-medium">
                          {Math.floor(exercise.rest_seconds / 60)}:{(exercise.rest_seconds % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    )}
                  </div>

                  {exercise.notes && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-white/70 text-sm">{exercise.notes}</p>
                    </div>
                  )}
                </div>
              )) || (
                <p className="text-white/60 text-center py-4">No exercises planned for this session</p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Close
            </Button>
            {!session.completed_at && (
              <Button
                onClick={() => onStartSession(session)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Session
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
