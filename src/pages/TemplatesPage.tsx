import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Dumbbell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProgramTemplates } from '@/hooks/useProgramTemplates';
import { useCreateProgramFromTemplate } from '@/hooks/useCreateProgramFromTemplate';
import { GenerateProgramDialog } from '@/components/GenerateProgramDialog';
import { TemplateCard } from '@/components/TemplateCard';
import { TemplateModal } from '@/components/TemplateModal';
import { useTemplateModal } from '@/store/useTemplateModal';
import { useNavigate } from 'react-router-dom';

const TemplatesPage: React.FC = () => {
  const { profile } = useAuth();
  const { data: templates = [], isLoading } = useProgramTemplates();
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const { tpl, close } = useTemplateModal();
  const navigate = useNavigate();
  const { mutate: createProgram, isPending: isCreating } = useCreateProgramFromTemplate();

  const handleAssign = (template: { id: string }) => {
    createProgram(
      { templateId: template.id, athleteUuid: profile?.id },
      { onSuccess: () => navigate('/training-plan') }
    );
  };

  // Solo users can view and generate templates but not assign them
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">Program Templates</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => setIsGenerateOpen(true)}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Generate with KAI
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-4">
          {templates.map((template) => (
            <TemplateCard 
              key={template.id} 
              template={template}
              onAssign={handleAssign}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Program Templates</h3>
            <p className="text-gray-500 mb-4">
              Generate training program templates with KAI
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button onClick={() => setIsGenerateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate with KAI
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <GenerateProgramDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
      />

      {tpl && (
        <TemplateModal
          template={tpl}
          open={!!tpl}
          onOpenChange={(open) => !open && close()}
          onAssign={handleAssign}
        />
      )}
    </div>
  );
};

export default TemplatesPage;