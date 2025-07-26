import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { Stepper, Step } from '@/components/ui/stepper';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProgramBuilderScreenProps {
  onBack?: () => void;
  onComplete?: (programId: string) => void;
}

const GOALS = [
  { id: 'strength', label: 'Strength' },
  { id: 'power', label: 'Power' },
  { id: 'hypertrophy', label: 'Hypertrophy' },
  { id: 'conditioning', label: 'Conditioning' }
];

const DAYS_OF_WEEK = [
  { id: 'Monday', label: 'Mon' },
  { id: 'Tuesday', label: 'Tue' },
  { id: 'Wednesday', label: 'Wed' },
  { id: 'Thursday', label: 'Thu' },
  { id: 'Friday', label: 'Fri' },
  { id: 'Saturday', label: 'Sat' },
  { id: 'Sunday', label: 'Sun' }
];

const EQUIPMENT_OPTIONS = [
  'Dumbbells', 'Barbell', 'Squat Rack', 'Resistance Bands',
  'Pull-up Bar', 'Bench', 'Cable Machine', 'Kettlebells'
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'New to structured training' },
  { id: 'intermediate', label: 'Intermediate', description: '1-3 years of training experience' },
  { id: 'advanced', label: 'Advanced', description: '3+ years of consistent training' }
];

export const ProgramBuilderScreen: React.FC<ProgramBuilderScreenProps> = ({ 
  onBack, 
  onComplete 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Step 1: Goals
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  // Step 2: Availability & Equipment
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  
  // Step 3: Experience Level
  const [experienceLevel, setExperienceLevel] = useState<string>('');

  const steps = [
    { label: 'Goals' },
    { label: 'Schedule' },
    { label: 'Experience' },
    { label: 'Review' }
  ];

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(prev => 
      prev.includes(goalId) 
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const handleDayToggle = (dayId: string) => {
    setSelectedDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  const handleEquipmentToggle = (equipment: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment) 
        ? prev.filter(e => e !== equipment)
        : [...prev, equipment]
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return selectedGoals.length > 0;
      case 1: return selectedDays.length > 0 && selectedEquipment.length > 0;
      case 2: return experienceLevel !== '';
      case 3: return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      onBack ? onBack() : navigate(-1);
    }
  };

  const generateProgram = async () => {
    try {
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('ariaGenerateProgram', {
        body: {
          goal: selectedGoals.join(', '),
          daysPerWeek: selectedDays.map(day => DAYS_OF_WEEK.findIndex(d => d.id === day)),
          equipment: selectedEquipment,
          experience: experienceLevel
        }
      });

      if (error) throw error;

      toast({
        title: "Program Generated!",
        description: "Your training program has been created successfully.",
      });

      if (onComplete) {
        onComplete(data.programId);
      } else {
        navigate(`/program/${data.programId}`);
      }
    } catch (error) {
      console.error('Error generating program:', error);
      toast({
        title: "Error",
        description: "Failed to generate program. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const renderGoalsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Training Goals</h2>
        <p className="text-white/70">Select one or more training goals</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {GOALS.map((goal) => (
          <div key={goal.id} className="flex items-center space-x-3">
            <Checkbox 
              id={goal.id}
              checked={selectedGoals.includes(goal.id)}
              onCheckedChange={() => handleGoalToggle(goal.id)}
              className="border-white/30 text-brand-blue"
            />
            <Label 
              htmlFor={goal.id}
              className="text-white cursor-pointer font-medium"
            >
              {goal.label}
            </Label>
          </div>
        ))}
      </div>

      {selectedGoals.length > 0 && (
        <div className="mt-6">
          <p className="text-white/70 text-sm mb-2">Selected goals:</p>
          <div className="flex flex-wrap gap-2">
            {selectedGoals.map((goalId) => {
              const goal = GOALS.find(g => g.id === goalId);
              return (
                <Badge key={goalId} variant="secondary" className="bg-brand-blue/20 text-brand-blue">
                  {goal?.label}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const renderScheduleStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Schedule & Equipment</h2>
        <p className="text-white/70">Select workout days and available equipment</p>
      </div>

      {/* Days Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Workout Days</h3>
        <div className="grid grid-cols-7 gap-2">
          {DAYS_OF_WEEK.map((day) => (
            <button
              key={day.id}
              onClick={() => handleDayToggle(day.id)}
              className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                selectedDays.includes(day.id)
                  ? 'bg-brand-blue text-brand-charcoal'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Selection */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Available Equipment</h3>
        <div className="grid grid-cols-2 gap-3">
          {EQUIPMENT_OPTIONS.map((equipment) => (
            <div key={equipment} className="flex items-center space-x-3">
              <Checkbox 
                id={equipment}
                checked={selectedEquipment.includes(equipment)}
                onCheckedChange={() => handleEquipmentToggle(equipment)}
                className="border-white/30 text-brand-blue"
              />
              <Label 
                htmlFor={equipment}
                className="text-white cursor-pointer text-sm"
              >
                {equipment}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderExperienceStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Experience Level</h2>
        <p className="text-white/70">Help us tailor the program complexity</p>
      </div>
      
      <RadioGroup value={experienceLevel} onValueChange={setExperienceLevel}>
        <div className="space-y-4">
          {EXPERIENCE_LEVELS.map((level) => (
            <div key={level.id} className="relative">
              <RadioGroupItem value={level.id} id={level.id} className="sr-only" />
              <Label 
                htmlFor={level.id}
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                  experienceLevel === level.id 
                    ? 'border-brand-blue bg-brand-blue/20 text-brand-blue' 
                    : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                <div className="flex-1">
                  <span className="font-semibold block">{level.label}</span>
                  <span className="text-sm opacity-70">{level.description}</span>
                </div>
              </Label>
            </div>
          ))}
        </div>
      </RadioGroup>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <Sparkles className="w-12 h-12 text-brand-blue mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Ready to Generate!</h2>
        <p className="text-white/70">Review your selections below</p>
      </div>

      <div className="bg-white/5 rounded-lg p-4 space-y-4">
        <div className="flex justify-between">
          <span className="text-white/70">Goals:</span>
          <span className="text-white font-medium">
            {selectedGoals.map(id => GOALS.find(g => g.id === id)?.label).join(', ')}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Days:</span>
          <span className="text-white font-medium">{selectedDays.length} days/week</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Equipment:</span>
          <span className="text-white font-medium">{selectedEquipment.length} items</span>
        </div>
        <div className="flex justify-between">
          <span className="text-white/70">Experience:</span>
          <span className="text-white font-medium capitalize">{experienceLevel}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-brand-charcoal">
      <div className="min-h-screen bg-white/5 backdrop-blur-md rounded-3xl m-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <button 
            onClick={handleBack}
            disabled={isGenerating}
            className="w-10 h-10 rounded-full bg-white/10 border-none flex justify-center items-center cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <h1 className="text-white text-2xl font-bold text-center m-0">Program Builder</h1>
          <div className="w-10" />
        </div>

        {/* Stepper */}
        <div className="px-6 py-4">
          <Stepper value={currentStep} className="max-w-md mx-auto">
            {steps.map((step, index) => (
              <Step key={index} value={index} label={step.label} />
            ))}
          </Stepper>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[70vh] px-6 pb-6">
          <div className="py-6">
            {currentStep === 0 && renderGoalsStep()}
            {currentStep === 1 && renderScheduleStep()}
            {currentStep === 2 && renderExperienceStep()}
            {currentStep === 3 && renderReviewStep()}
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-6 border-t border-white/10 flex gap-4">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={isGenerating}
            className="flex-1 border-white/10 text-white hover:bg-white/10"
          >
            Back
          </Button>
          
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isGenerating}
              className="flex-1 bg-brand-blue text-brand-charcoal hover:bg-brand-blue/80"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={generateProgram}
              disabled={isGenerating}
              className="flex-1 bg-brand-blue text-brand-charcoal hover:bg-brand-blue/80"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Program'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};