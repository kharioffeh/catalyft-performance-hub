
import React from 'react';
import { BookOpen } from 'lucide-react';

interface TrainingProgramsStatsProps {
  totalTemplates: number;
  activePrograms: number;
  totalExercises: number;
}

export const TrainingProgramsStats: React.FC<TrainingProgramsStatsProps> = ({
  totalTemplates,
  activePrograms,
  totalExercises,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
        <div>
          <p className="text-sm font-medium text-white/70">Total Templates</p>
          <div className="text-2xl font-bold text-white">{totalTemplates}</div>
        </div>
        <BookOpen className="h-5 w-5 text-white/50" />
      </div>
      
      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
        <div>
          <p className="text-sm font-medium text-white/70">Active Programs</p>
          <div className="text-2xl font-bold text-white">{activePrograms}</div>
        </div>
        <BookOpen className="h-5 w-5 text-white/50" />
      </div>

      <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
        <div>
          <p className="text-sm font-medium text-white/70">Exercise Library</p>
          <div className="text-2xl font-bold text-white">{totalExercises}</div>
        </div>
        <BookOpen className="h-5 w-5 text-white/50" />
      </div>
    </div>
  );
};
