
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';

interface TrainingProgramsHeaderProps {
  isCoach: boolean;
  onCreateTemplate: () => void;
}

export const TrainingProgramsHeader: React.FC<TrainingProgramsHeaderProps> = ({
  isCoach,
  onCreateTemplate,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <BookOpen className="w-8 h-8 text-blue-400" />
        <div>
          <h1 className="text-3xl font-bold text-white">Training Programs</h1>
          <p className="text-white/70">Advanced template and program management system</p>
        </div>
      </div>
      {isCoach && (
        <Button 
          onClick={onCreateTemplate} 
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
        >
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      )}
    </div>
  );
};
