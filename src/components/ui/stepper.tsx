
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepperProps {
  value: number;
  children: React.ReactNode;
  className?: string;
}

interface StepProps {
  value: number;
  label: string;
  description?: string;
}

const StepperContext = React.createContext<{ currentStep: number }>({ currentStep: 0 });

export const Stepper: React.FC<StepperProps> = ({ value, children, className }) => {
  return (
    <StepperContext.Provider value={{ currentStep: value }}>
      <div className={cn('flex items-center justify-between', className)}>
        {children}
      </div>
    </StepperContext.Provider>
  );
};

export const Step: React.FC<StepProps> = ({ value, label, description }) => {
  const { currentStep } = React.useContext(StepperContext);
  
  const isActive = currentStep === value;
  const isCompleted = currentStep > value;
  const isUpcoming = currentStep < value;

  return (
    <div className="flex items-center">
      <div className="flex items-center">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
            isCompleted && 'border-indigo-500 bg-indigo-500 text-white',
            isActive && 'border-indigo-500 bg-indigo-500/10 text-indigo-400',
            isUpcoming && 'border-white/20 text-white/40'
          )}
        >
          {isCompleted ? (
            <Check className="h-4 w-4" />
          ) : (
            <span>{value + 1}</span>
          )}
        </div>
        <div className="ml-3">
          <p
            className={cn(
              'text-sm font-medium transition-colors',
              isActive && 'text-white',
              isCompleted && 'text-white/90',
              isUpcoming && 'text-white/40'
            )}
          >
            {label}
          </p>
          {description && (
            <p
              className={cn(
                'text-xs transition-colors',
                isActive && 'text-white/70',
                isCompleted && 'text-white/60',
                isUpcoming && 'text-white/30'
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
