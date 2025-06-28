
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import { TemplateCard } from '@/components/TrainingObjects/TemplateCard';

interface TrainingProgramsTemplatesTabProps {
  templates: any[];
  isCoach: boolean;
  isSolo: boolean;
  deleteLoading: boolean;
  onView: (templateId: string) => void;
  onEdit: (templateId: string) => void;
  onDelete: (templateId: string) => void;
  onCreateTemplate: () => void;
  onCreateProgram: () => void;
}

export const TrainingProgramsTemplatesTab: React.FC<TrainingProgramsTemplatesTabProps> = ({
  templates,
  isCoach,
  isSolo,
  deleteLoading,
  onView,
  onEdit,
  onDelete,
  onCreateTemplate,
  onCreateProgram,
}) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Training Templates</h2>
          <p className="text-gray-600">Create and manage training templates</p>
        </div>
        {isCoach && (
          <div className="flex gap-2">
            <Button onClick={onCreateTemplate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
            <Button onClick={onCreateProgram} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Program
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isCoach={isCoach}
            isSolo={isSolo}
            deleteLoading={deleteLoading}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No templates</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new template.</p>
          {isCoach && (
            <div className="mt-6">
              <Button onClick={onCreateTemplate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
