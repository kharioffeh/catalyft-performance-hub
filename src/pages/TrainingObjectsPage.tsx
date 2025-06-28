
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Dumbbell, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTemplates, useDeleteTemplate } from '@/hooks/useTemplates';
import { useProgramInstances } from '@/hooks/useProgramInstances';
import { NewTemplateBuilder } from '@/components/NewTemplateBuilder';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { TrainingObjectsHeader } from '@/components/TrainingObjects/TrainingObjectsHeader';
import { TrainingObjectsStats } from '@/components/TrainingObjects/TrainingObjectsStats';
import { TemplateCard } from '@/components/TrainingObjects/TemplateCard';
import { ProgramInstanceCard } from '@/components/TrainingObjects/ProgramInstanceCard';
import { DeleteTemplateDialog } from '@/components/TrainingObjects/DeleteTemplateDialog';

const TrainingObjectsPage: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: templates = [], isLoading: templatesLoading } = useTemplates();
  const { data: programInstances = [] } = useProgramInstances();
  const deleteTemplate = useDeleteTemplate();
  const [showTemplateBuilder, setShowTemplateBuilder] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const isCoach = profile?.role === 'coach';
  const isSolo = profile?.role === 'solo';

  const handleViewTemplate = (templateId: string) => {
    navigate(`/template/${templateId}`);
  };

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowTemplateBuilder(true);
  };

  const handleCreateTemplate = () => {
    setSelectedTemplateId(null);
    setShowTemplateBuilder(true);
  };

  const handleDeleteClick = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    try {
      await deleteTemplate.mutateAsync(templateToDelete);
      toast({
        title: "Template Deleted",
        description: "Template has been successfully deleted",
      });
    } catch (error) {
      toast({
        title: "Deletion Failed",
        description: "Failed to delete template. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  if (templatesLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TrainingObjectsHeader
        isCoach={isCoach}
        onCreateTemplate={handleCreateTemplate}
      />

      <TrainingObjectsStats
        templates={templates}
        programInstances={programInstances}
      />

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="programs">Program Instances</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {templates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isCoach={isCoach}
                  isSolo={isSolo}
                  deleteLoading={deleteTemplate.isPending}
                  onView={handleViewTemplate}
                  onEdit={handleEditTemplate}
                  onDelete={handleDeleteClick}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Templates Yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first training template to get started
                </p>
                {isCoach && (
                  <Button onClick={handleCreateTemplate}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Template
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="programs" className="space-y-4">
          {programInstances.length > 0 ? (
            <div className="space-y-4">
              {programInstances.map((program) => (
                <ProgramInstanceCard key={program.id} program={program} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Programs Yet</h3>
                <p className="text-gray-500 mb-4">
                  Create templates and assign them to athletes to see program instances here
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Template Builder Modal */}
      {showTemplateBuilder && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] m-4 overflow-hidden border">
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedTemplateId ? 'Edit Template' : 'Create New Template'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplateBuilder(false)}
                className="text-gray-600 hover:bg-gray-100"
              >
                ✕
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-white">
              <NewTemplateBuilder
                templateId={selectedTemplateId || undefined}
                onSave={() => setShowTemplateBuilder(false)}
              />
            </div>
          </div>
        </div>
      )}

      <DeleteTemplateDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteTemplate.isPending}
      />
    </div>
  );
};

export default TrainingObjectsPage;
