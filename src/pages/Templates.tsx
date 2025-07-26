
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Calendar, Users, Eye, Dumbbell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useProgramTemplates } from '@/hooks/useProgramTemplates';
import { GenerateProgramDialog } from '@/components/GenerateProgramDialog';
import { ProgramPreviewDialog } from '@/components/ProgramPreviewDialog';


const Templates: React.FC = () => {
  const { profile } = useAuth();
  const { data: templates = [], isLoading } = useProgramTemplates();
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);


  // Templates page disabled for solo users
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">Program templates are not available for solo users.</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Dumbbell className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900">KAI (Kinetic Adaptive Instructor)</h1>
        </div>
        <Button 
          onClick={() => setIsGenerateOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Generate with KAI
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : templates.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {template.block_json.weeks?.length || 0} weeks
                    </CardDescription>
                  </div>
                  <Badge variant="outline">
                    <Calendar className="w-3 h-3 mr-1" />
                    Program
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span>Created: {new Date(template.created_at).toLocaleDateString()}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewTemplate(template)}
                    className="flex-1"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </Button>
                  {/* Assign functionality removed for solo pivot */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <Dumbbell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Program Templates</h3>
            <p className="text-gray-500 mb-4">
              Generate your first AI-powered training program with KAI
            </p>
            <Button onClick={() => setIsGenerateOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Generate with KAI
            </Button>
          </CardContent>
        </Card>
      )}

      <GenerateProgramDialog
        open={isGenerateOpen}
        onOpenChange={setIsGenerateOpen}
      />

      <ProgramPreviewDialog
        template={previewTemplate}
        open={!!previewTemplate}
        onOpenChange={(open) => !open && setPreviewTemplate(null)}
      />


    </div>
  );
};

export default Templates;
