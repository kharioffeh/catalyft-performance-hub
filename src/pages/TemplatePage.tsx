
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Users, ArrowLeft, Save } from 'lucide-react';
import { WeekSlider } from '@/components/WeekSlider';
import { AssignTemplateDialog } from '@/components/AssignTemplateDialog';
import { useAuth } from '@/contexts/AuthContext';
import { useUpdateTemplate } from '@/hooks/useUpdateTemplate';
import { useState } from 'react';

const TemplatePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [assignTemplate, setAssignTemplate] = useState(null);
  const [localBlockJson, setLocalBlockJson] = useState<any>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const updateTemplate = useUpdateTemplate();

  const { data: template, isLoading, error } = useQuery({
    queryKey: ['program-template', id],
    queryFn: async () => {
      if (!id) throw new Error('Template ID is required');
      
      const { data, error } = await supabase
        .from('program_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Initialize local state when template loads
  React.useEffect(() => {
    if (template && !localBlockJson) {
      let blockJson: any = {};
      try {
        blockJson = typeof template.block_json === 'string' 
          ? JSON.parse(template.block_json) 
          : template.block_json || {};
      } catch (e) {
        console.error('Failed to parse block_json:', e);
        blockJson = {};
      }
      setLocalBlockJson(blockJson);
    }
  }, [template, localBlockJson]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Template Not Found</h1>
        <p className="text-gray-600 mb-4">The template you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/templates')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Templates
        </Button>
      </div>
    );
  }

  const isKAI = template.origin === 'KAI';
  const isCoach = profile?.role === 'coach';
  const totalWeeks = localBlockJson?.weeks?.length || 0;

  const handleBlockJsonUpdate = (updatedBlockJson: any) => {
    setLocalBlockJson(updatedBlockJson);
    setHasChanges(true);
  };

  const handleSaveChanges = () => {
    if (!hasChanges || !localBlockJson) return;
    
    updateTemplate.mutate({
      id: template.id,
      block_json: localBlockJson
    }, {
      onSuccess: () => {
        setHasChanges(false);
      }
    });
  };

  const openAssignDialog = (template: any) => {
    setAssignTemplate(template);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/templates">Templates</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{template.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">{template.name}</h1>
          <Badge 
            className={`text-white ${
              isKAI ? 'bg-badge-kai' : 'bg-badge-coach'
            }`}
          >
            {template.origin}
          </Badge>
          <Badge variant="outline">
            {totalWeeks} Weeks
          </Badge>
          {hasChanges && (
            <Badge variant="secondary">
              Unsaved Changes
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isCoach && hasChanges && (
            <Button 
              onClick={handleSaveChanges}
              disabled={updateTemplate.isPending}
              variant="default"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateTemplate.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          )}
          
          {isCoach && (
            <Button 
              onClick={() => openAssignDialog(template)}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Users className="w-4 h-4" />
              Assign
            </Button>
          )}
        </div>
      </div>

      {localBlockJson?.weeks && (
        <WeekSlider 
          blockJson={localBlockJson} 
          editable={isCoach}
          onBlockJsonUpdate={handleBlockJsonUpdate}
        />
      )}

      <AssignTemplateDialog
        template={assignTemplate}
        open={!!assignTemplate}
        onOpenChange={(open) => !open && setAssignTemplate(null)}
      />
    </div>
  );
};

export default TemplatePage;
