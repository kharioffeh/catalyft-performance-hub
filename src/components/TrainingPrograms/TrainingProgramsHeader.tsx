
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
        <BookOpen className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Training Programs</h1>
          <p className="text-gray-600">Advanced template and program management system</p>
        </div>
      </div>
      {isCoach && (
        <Button onClick={onCreateTemplate} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      )}
    </div>
  );
};
