
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { TemplateCard } from '@/components/training-plan/TemplateCard';

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
  const handleAssign = (templateId: string) => {
    console.log('Assign program:', templateId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">Training Programs</h3>
          <p className="text-white/60">Multi-week periodized training programs</p>
        </div>
        {isCoach && (
          <div className="flex gap-2">
            <Button
              onClick={onCreateProgram}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Program
            </Button>
          </div>
        )}
      </div>

      {/* Programs Grid */}
      {templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={{
                id: template.id,
                title: template.name,
                goal: 'strength', // TODO: Extract from block_json
                weeks: 4, // TODO: Extract from block_json
                visibility: 'private',
                created_at: template.created_at,
                owner_uuid: template.coach_uuid
              }}
              onAssign={handleAssign}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={onView}
              deleteLoading={deleteLoading}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-white/40" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No Programs Created</h3>
          <p className="text-white/60 mb-6">
            Create your first training program with our intuitive builder
          </p>
          {isCoach && (
            <Button onClick={onCreateProgram} className="bg-indigo-600 hover:bg-indigo-500">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Program
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
