
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TemplateCard } from '@/components/TemplateCard';
import { WorkoutTemplate } from '@/types/workout';

interface WorkoutTemplatesProps {
  templates: WorkoutTemplate[];
  isLoading: boolean;
  onAssignTemplate: (template: WorkoutTemplate) => void;
}

export const WorkoutTemplates: React.FC<WorkoutTemplatesProps> = ({
  templates,
  isLoading,
  onAssignTemplate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Templates</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : templates.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onAssign={onAssignTemplate}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No workout templates created yet
          </div>
        )}
      </CardContent>
    </Card>
  );
};
