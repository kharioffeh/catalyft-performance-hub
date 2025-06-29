
import React from 'react';
import { TemplateCard } from './TemplateCard';
import { useTemplates, useDeleteTemplate } from '@/hooks/useTemplates';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export const TemplateGrid: React.FC = () => {
  const { data: templates = [], isLoading } = useTemplates();
  const deleteTemplate = useDeleteTemplate();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEdit = (templateId: string) => {
    navigate(`/template/${templateId}`);
  };

  const handleDelete = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template? This action cannot be undone.')) {
      try {
        await deleteTemplate.mutateAsync(templateId);
        toast({
          title: "Template Deleted",
          description: "Template has been deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: "Failed to delete template. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDuplicate = (templateId: string) => {
    // TODO: Implement template duplication
    toast({ description: "Duplicate functionality coming soon" });
  };

  const handleAssign = (templateId: string) => {
    // TODO: Implement template assignment
    toast({ description: "Assign functionality coming soon" });
  };

  if (isLoading) {
    return (
      <section className="auto-fill-320 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-t-2xl" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </section>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto h-12 w-12 text-white/30 mb-4">
          <svg fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
            <polyline points="14,2 14,8 20,8" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No templates found</h3>
        <p className="text-white/60 mb-4">Create your first training template to get started</p>
      </div>
    );
  }

  return (
    <section className="auto-fill-320 gap-6">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onAssign={handleAssign}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onDelete={handleDelete}
        />
      ))}
    </section>
  );
};
