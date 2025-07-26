
import React from 'react';
import { NewTemplateBuilder } from '@/components/NewTemplateBuilder';
import ProgramBuilder from '@/components/ProgramBuilder';

import { Template } from '@/types/training';

interface TrainingProgramsModalsProps {
  showTemplateBuilder: boolean;
  showProgramBuilder: boolean;
  selectedTemplate: any;
  showAssignDialog: boolean;
  onCloseTemplate: (refresh?: boolean) => void;
  onCloseProgram: (refresh?: boolean) => void;
  onCloseAssignDialog: () => void;
}

export const TrainingProgramsModals: React.FC<TrainingProgramsModalsProps> = ({
  showTemplateBuilder,
  showProgramBuilder,
  selectedTemplate,
  showAssignDialog,
  onCloseTemplate,
  onCloseProgram,
  onCloseAssignDialog,
}) => {
  const handleTemplateSave = (template: Template) => {
    onCloseTemplate(true); // Close with refresh
  };

  return (
    <>
      {showTemplateBuilder && (
        <NewTemplateBuilder
          onSave={handleTemplateSave}
        />
      )}

      <ProgramBuilder
        isOpen={showProgramBuilder}
        onClose={onCloseProgram}
      />

      {/* AssignTemplateDialog removed for solo pivot */}
    </>
  );
};
