
import React from 'react';
import { TrainingProgramsTemplatesTab } from '@/components/TrainingPrograms/TrainingProgramsTemplatesTab';
import { useTemplates } from '@/hooks/useTemplates';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const TemplatesTab: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { data: templates = [], isLoading } = useTemplates();

  const isCoach = profile?.role === 'coach';
  const isSolo = profile?.role === 'solo';

  const handleView = (templateId: string) => {
    navigate(`/template/${templateId}`);
  };

  const handleEdit = (templateId: string) => {
    navigate(`/template/${templateId}`);
  };

  const handleDelete = (templateId: string) => {
    console.log('Delete template:', templateId);
  };

  const handleCreateTemplate = () => {
    console.log('Create template');
  };

  const handleCreateProgram = () => {
    console.log('Create program');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <TrainingProgramsTemplatesTab
      templates={templates}
      isCoach={isCoach}
      isSolo={isSolo}
      deleteLoading={false}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onCreateTemplate={handleCreateTemplate}
      onCreateProgram={handleCreateProgram}
    />
  );
};
