
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Stepper, Step } from '@/components/ui/stepper';
import { useTemplateBuilder } from '@/hooks/useTemplateBuilder';
import { useCreateTemplate } from '@/hooks/useTemplates';
import { useToast } from '@/hooks/use-toast';
import { MetaStep } from './MetaStep';
import { BlocksStep } from './BlocksStep';
import { ReviewStep } from './ReviewStep';
import { Template } from '@/types/training';

interface TemplateBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: Template;
}

export const TemplateBuilderModal: React.FC<TemplateBuilderModalProps> = ({
  open,
  onOpenChange,
  template
}) => {
  const builder = useTemplateBuilder(template);
  const createTemplate = useCreateTemplate();
  const { toast } = useToast();

  const steps = [
    {
      label: 'Metadata',
      component: (
        <MetaStep
          meta={builder.meta}
          setMeta={builder.setMeta}
          onNext={() => builder.setCurrentStep(1)}
        />
      )
    },
    {
      label: 'Blocks',
      component: (
        <BlocksStep
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
      label: 'Review',
      component: (
        <ReviewStep
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
      await createTemplate.mutateAsync({
        title: builder.meta.name,
        goal: builder.meta.goal,
        weeks: builder.meta.weeks,
        visibility: 'private'
      });

      toast({
        title: "Template Created",
        description: "Your template has been saved successfully",
      });

      builder.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save template. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex-shrink-0 px-8 pt-8 pb-6 border-b border-white/10">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2">Template Builder</h1>
              <p className="text-white/70">Create your training template in 3 simple steps</p>
            </div>
            <Stepper value={builder.currentStep} className="max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <Step key={index} value={index} label={step.label} />
              ))}
            </Stepper>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {steps[builder.currentStep].component}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
