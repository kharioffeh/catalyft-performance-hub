
import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ExerciseLibrary } from '@/components/ExerciseLibrary';

interface ExerciseLibraryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ExerciseLibraryDrawer: React.FC<ExerciseLibraryDrawerProps> = ({
  open,
  onOpenChange
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[500px] bg-[#0F172A] border-white/10">
        <SheetHeader>
          <SheetTitle className="text-white">Exercise Library</SheetTitle>
          <SheetDescription className="text-white/70">
            Drag exercises into your training sessions
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <ExerciseLibrary />
        </div>
      </SheetContent>
    </Sheet>
  );
};
