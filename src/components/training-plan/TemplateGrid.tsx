
import React, { useState } from 'react';
import { TemplateCard } from './TemplateCard';
import { useProgramTemplates, useDeleteTemplate } from '@/hooks/useProgramTemplates';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { EnhancedProgramBuilder } from '@/components/program-builder/EnhancedProgramBuilder';
import { Fab } from '@/components/ui/Fab';

export const TemplateGrid: React.FC = () => {
  const { data: programs = [], isLoading } = useProgramTemplates();
  const deleteTemplate = useDeleteTemplate();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [builderOpen, setBuilderOpen] = useState(false);

  const handleEdit = (templateId: string) => {
    navigate(`/program/${templateId}`);
  };

  const handleDelete = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this program? This action cannot be undone.')) {
      try {
        await deleteTemplate.mutateAsync(templateId);
        toast({
          title: "Program Deleted",
          description: "Program has been deleted successfully",
        });
      } catch (error) {
        toast({
          title: "Delete Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  const handleDuplicate = (templateId: string) => {
    toast({ description: "Duplicate functionality coming soon" });
  };

  if (isLoading) {
    return (
      <ul className="grid gap-4 md:[grid-template-columns:repeat(auto-fill,minmax(320px,1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(240px,1fr))] grid-cols-1 pb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <li key={i} className="space-y-3">
            <Skeleton className="h-40 w-full rounded-t-2xl bg-white/10" />
            <div className="p-4 space-y-2">
              <Skeleton className="h-4 w-3/4 bg-white/10" />
              <Skeleton className="h-3 w-1/2 bg-white/10" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (programs.length === 0) {
    return (
      <>
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-white/30 mb-4">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No programs yet</h3>
          <p className="text-white/60 mb-4">Tap <strong>Generate with AI</strong> to build your first plan</p>
        </div>

        {/* FAB for empty state */}
        <Fab 
          onPress={() => setBuilderOpen(true)}
          aria-label="Create new program"
        />

        <EnhancedProgramBuilder
          open={builderOpen}
          onOpenChange={setBuilderOpen}
        />
      </>
    );
  }

  return (
    <>
      <ul className="grid gap-4 md:[grid-template-columns:repeat(auto-fill,minmax(320px,1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(240px,1fr))] grid-cols-1 pb-2">
        {programs.map((program) => (
          <TemplateCard
            key={program.id}
            template={{
              id: program.id,
              title: program.name,
              goal: 'strength', // TODO: Extract from block_json
              weeks: 4, // TODO: Extract from block_json
              visibility: 'private',
              created_at: program.created_at,
              owner_uuid: program.coach_uuid,
              sessions_count: 0 // Calculate from block_json if needed
             }}
             onEdit={handleEdit}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            deleteLoading={deleteTemplate.isPending}
          />
        ))}
      </ul>

      {/* FAB */}
      <Fab 
        onPress={() => setBuilderOpen(true)}
        aria-label="Create new program"
      />

      <EnhancedProgramBuilder
        open={builderOpen}
        onOpenChange={setBuilderOpen}
      />
    </>
  );
};
