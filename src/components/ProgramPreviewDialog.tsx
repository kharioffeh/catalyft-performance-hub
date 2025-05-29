
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface ProgramPreviewDialogProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ProgramPreviewDialog: React.FC<ProgramPreviewDialogProps> = ({
  template,
  open,
  onOpenChange,
}) => {
  const [currentWeek, setCurrentWeek] = useState(0);

  if (!template) return null;

  const program = template.block_json;
  const weeks = program.weeks || [];

  const nextWeek = () => {
    if (currentWeek < weeks.length - 1) {
      setCurrentWeek(currentWeek + 1);
    }
  };

  const prevWeek = () => {
    if (currentWeek > 0) {
      setCurrentWeek(currentWeek - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{template.name}</DialogTitle>
          <DialogDescription>
            {weeks.length} week program preview
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Week Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevWeek}
              disabled={currentWeek === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Week {currentWeek + 1}</span>
            </div>
            
            <Button
              variant="outline"
              onClick={nextWeek}
              disabled={currentWeek === weeks.length - 1}
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          {/* Week Content */}
          {weeks[currentWeek] && (
            <div className="grid gap-4 md:grid-cols-2">
              {weeks[currentWeek].map((session: any, sessionIndex: number) => (
                <Card key={sessionIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg">{session.sessionName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {session.exercises?.map((exercise: any, exerciseIndex: number) => (
                      <div key={exerciseIndex} className="border-l-2 border-blue-200 pl-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-medium">{exercise.name}</h4>
                          {exercise.pct1RM && (
                            <Badge variant="secondary">{exercise.pct1RM}% 1RM</Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div>
                            {exercise.sets} sets × {exercise.reps} reps
                          </div>
                          <div>Rest: {exercise.rest}</div>
                          {exercise.notes && (
                            <div className="text-xs italic">{exercise.notes}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Week Indicators */}
          <div className="flex justify-center space-x-2">
            {weeks.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentWeek(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentWeek ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
