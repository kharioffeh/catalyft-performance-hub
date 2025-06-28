
import React from 'react';
import { NewTemplateBuilder } from '@/components/NewTemplateBuilder';
import ProgramBuilder from '@/components/ProgramBuilder';
import { AssignTemplateDialog } from '@/components/AssignTemplateDialog';

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
  return (
    <>
      {showTemplateBuilder && (
        <NewTemplateBuilder
          onClose={onCloseTemplate}
        />
      )}

      <ProgramBuilder
        isOpen={showProgramBuilder}
        onClose={onCloseProgram}
      />

      {selectedTemplate && (
        <AssignTemplateDialog
          open={showAssignDialog}
          onOpenChange={onCloseAssignDialog}
          template={selectedTemplate}
        />
      )}
    </>
  );
};
