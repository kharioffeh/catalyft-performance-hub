
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Stepper, Step } from '@/components/ui/stepper';
import { ProgramMetaStep } from './ProgramMetaStep';
import { ProgramBlocksStep } from './ProgramBlocksStep';
import { ProgramReviewStep } from './ProgramReviewStep';
import { useEnhancedProgramBuilder } from '@/hooks/useEnhancedProgramBuilder';
import { useCreateProgramTemplate } from '@/hooks/useProgramTemplates';
import { useToast } from '@/hooks/use-toast';

interface EnhancedProgramBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnhancedProgramBuilder: React.FC<EnhancedProgramBuilderProps> = ({
  open,
  onOpenChange,
}) => {
  const builder = useEnhancedProgramBuilder();
  const createProgram = useCreateProgramTemplate();
  const { toast } = useToast();

  const steps = [
    {
      label: 'Program Details',
      component: (
        <ProgramMetaStep
          meta={builder.meta}
          setMeta={builder.setMeta}
          onNext={() => builder.setCurrentStep(1)}
        />
      )
    },
    {
      label: 'Build Blocks',
      component: (
        <ProgramBlocksStep
          meta={builder.meta}
          sessions={builder.sessions}
          setSessions={builder.setSessions}
          addSession={builder.addSession}
          getSessionsForWeekDay={builder.getSessionsForWeekDay}
          onPrev={() => builder.setCurrentStep(0)}
          onNext={() => builder.setCurrentStep(2)}
        />
      )
    },
    {
      label: 'Review & Save',
      component: (
        <ProgramReviewStep
          meta={builder.meta}
          sessions={builder.sessions}
          isValid={builder.isValid}
          onPrev={() => builder.setCurrentStep(1)}
          onFinish={handleSave}
        />
      )
    }
  ];

  async function handleSave() {
    try {
      await createProgram.mutateAsync({
        name: builder.meta.name,
        block_json: { 
          weeks: Array.from({ length: builder.meta.weeks }, (_, i) => ({
            week: i + 1,
            sessions: builder.sessions.filter(s => s.week === i + 1)
          }))
        },
        origin: 'COACH'
      });

      toast({
        title: "Program Created",
        description: "Your training program has been saved successfully",
      });

      builder.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save program. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col h-full">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-10 flex-shrink-0 px-8 pt-8 pb-6 border-b border-white/10 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Program Builder</h1>
              <p className="text-white/70">Create your training program in 3 simple steps</p>
            </div>
            <Stepper value={builder.currentStep} className="max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <Step key={index} value={index} label={step.label} />
              ))}
            </Stepper>
          </div>

          {/* Content - Scrollable with max height */}
          <div className="overflow-y-auto max-h-[70vh] px-6">
            <div className="py-8">
              {steps[builder.currentStep].component}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
