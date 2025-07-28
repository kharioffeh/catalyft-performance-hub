
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { TemplateCard } from '@/components/training-plan/TemplateCard';

interface TrainingProgramsTemplatesTabProps {
  templates: any[];
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
  isSolo,
  deleteLoading,
  onView,
  onEdit,
  onDelete,
  onCreateTemplate,
  onCreateProgram,
}) => {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Training Programs</h3>
          <p className="text-white/60">Multi-week periodized training programs</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onCreateProgram}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Program
          </Button>
        </div>
      </div>

      {/* Templates Grid */}
      {templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={{
                id: template.id,
                title: template.title,
                goal: template.goal,
                weeks: template.weeks,
                visibility: template.visibility,
                created_at: template.created_at,
                owner_uuid: template.owner_uuid,
              }}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              deleteLoading={deleteLoading}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Sparkles className="w-16 h-16 text-white/40 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            {isSolo ? 'No training programs yet' : 'No templates available'}
          </h3>
          <p className="text-white/60 max-w-md mx-auto mb-6">
            {isSolo 
              ? 'Create your first training program to get started with structured periodized training.'
              : 'Create templates that can be used to generate personalized training programs for your athletes.'
            }
          </p>
          <div className="flex gap-2 justify-center">
            <Button
              onClick={onCreateProgram}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Program
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
