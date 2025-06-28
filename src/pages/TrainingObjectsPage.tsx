import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Dumbbell, Calendar, Users, BookOpen, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTemplates, useDeleteTemplate } from '@/hooks/useTemplates';
import { useProgramInstances } from '@/hooks/useProgramInstances';
import { NewTemplateBuilder } from '@/components/NewTemplateBuilder';
import { GenerateButton } from '@/components/GenerateButton';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Training Objects</h1>
            <p className="text-gray-600">Advanced template and program management system</p>
          </div>
        </div>
        {isCoach && (
          <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Create Template
          </Button>
        )}
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              Training templates created
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {programInstances.filter(p => p.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently running programs
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programs</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programInstances.length}</div>
            <p className="text-xs text-muted-foreground">
              All program instances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="programs">Program Instances</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          {templates.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <Badge variant="outline">{template.goal}</Badge>
                    </div>
                    <CardDescription>
                      {template.weeks} week{template.weeks !== 1 ? 's' : ''} • {template.visibility}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-sm text-gray-600">
                      Created {new Date(template.created_at).toLocaleDateString()}
                    </div>
                    
                    {isSolo && (
                      <GenerateButton
                        templateId={template.id}
                        label="Start This Program"
                        full
                        className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                      />
                    )}
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewTemplate(template.id)}
                        className="flex-1"
                      >
                        View
                      </Button>
                      {isCoach && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleEditTemplate(template.id)}
                            className="flex-1"
                          >
                            Edit
                          </Button>
                          <GenerateButton
                            templateId={template.id}
                            label="Generate"
                            className="bg-green-600 hover:bg-green-700 text-white border-green-600 text-sm px-3 py-1"
                          />
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(template.id)}
                            disabled={deleteTemplate.isPending}
                            className="px-3"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
                <Card key={program.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">
                        {program.template?.title || 'Program Instance'}
                      </CardTitle>
                      <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                        {program.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      {program.template?.goal && (
                        <>Goal: {program.template.goal} • </>
                      )}
                      {new Date(program.start_date).toLocaleDateString()} - {new Date(program.end_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Source</p>
                        <p className="font-medium capitalize">{program.source}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Created</p>
                        <p className="font-medium">{new Date(program.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
          <div className="bg-gray-900 rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] m-4 overflow-hidden border border-gray-700">
            <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800">
              <h2 className="text-xl font-semibold text-white">
                {selectedTemplateId ? 'Edit Template' : 'Create New Template'}
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTemplateBuilder(false)}
                className="text-white hover:bg-gray-700"
              >
                ✕
              </Button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)] bg-gray-900">
              <NewTemplateBuilder
                templateId={selectedTemplateId || undefined}
                onSave={() => setShowTemplateBuilder(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot be undone and will permanently remove the template and all its associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleteTemplate.isPending}
            >
              {deleteTemplate.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TrainingObjectsPage;
