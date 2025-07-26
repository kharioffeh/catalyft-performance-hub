
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Users, Eye, Settings } from 'lucide-react';
import { useTemplate } from '@/hooks/useTemplates';
import { useProgramInstances } from '@/hooks/useProgramInstances';
import { TemplateGridView } from '@/components/TemplateGridView';
import { CreateProgramFromTemplateDialog } from '@/components/CreateProgramFromTemplateDialog';
import { GenerateButton } from '@/components/GenerateButton';
import { useAuth } from '@/contexts/AuthContext';

const TemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const { data: template, isLoading } = useTemplate(id || '');
  const { data: programInstances = [] } = useProgramInstances();
  const [showCreateProgramDialog, setShowCreateProgramDialog] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Template not found</p>
      </div>
    );
  }

  const relatedPrograms = programInstances.filter(p => p.template_id === template.id);
  // All users are solo now
  const isCoach = false;
  const isSolo = true; // All users are solo now

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{template.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{template.goal}</Badge>
              <Badge variant="secondary">{template.weeks} weeks</Badge>
              <Badge variant="outline">{template.visibility}</Badge>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {isSolo && (
            <GenerateButton
              templateId={template.id}
              label="Start This Program"
              className="bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
            />
          )}
          {isCoach && (
            <>
              <GenerateButton
                templateId={template.id}
                label="Quick Generate"
                className="bg-green-600 hover:bg-green-700 text-white border-green-600"
              />
              <Button onClick={() => setShowCreateProgramDialog(true)}>
                <Users className="w-4 h-4 mr-2" />
                Assign to Athlete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Template Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{template.weeks} weeks</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Programs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relatedPrograms.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{template.goal}</div>
          </CardContent>
        </Card>
      </div>

      {/* Template Content */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList>
          <TabsTrigger value="grid">
            <Eye className="w-4 h-4 mr-2" />
            Grid View
          </TabsTrigger>
          <TabsTrigger value="programs">Programs ({relatedPrograms.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          <TemplateGridView templateId={template.id} />
        </TabsContent>

        <TabsContent value="programs" className="space-y-6">
          {relatedPrograms.length > 0 ? (
            <div className="grid gap-4">
              {relatedPrograms.map((program) => (
                <Card key={program.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Program Instance</span>
                      <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                        {program.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Start Date</p>
                        <p className="font-medium">{new Date(program.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">End Date</p>
                        <p className="font-medium">{new Date(program.end_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No programs created from this template yet</p>
              {isCoach && (
                <Button 
                  onClick={() => setShowCreateProgramDialog(true)}
                  className="mt-4"
                >
                  Create First Program
                </Button>
              )}
              {isSolo && (
                <GenerateButton
                  templateId={template.id}
                  label="Start This Program"
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                />
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateProgramFromTemplateDialog
        open={showCreateProgramDialog}
        onOpenChange={setShowCreateProgramDialog}
        template={template}
      />
    </div>
  );
};

export default TemplateDetailPage;
