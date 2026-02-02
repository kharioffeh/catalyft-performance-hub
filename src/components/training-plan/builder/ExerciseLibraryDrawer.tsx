
import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';

interface ExerciseLibraryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onExerciseSelect?: (exercise: { id: string; name: string }) => void;
}

export const ExerciseLibraryDrawer: React.FC<ExerciseLibraryDrawerProps> = ({
  open,
  onOpenChange,
  onExerciseSelect
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] bg-[#0F172A] border-white/10">
        <SheetHeader>
          <SheetTitle className="text-white">Exercise Library</SheetTitle>
          <SheetDescription className="text-white/70">
            {onExerciseSelect
              ? 'Click an exercise to add it to the selected session'
              : 'Browse available exercises'}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <ExerciseLibrary onExerciseSelect={onExerciseSelect} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
