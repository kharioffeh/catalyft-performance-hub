import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Stepper, Step } from '@/components/ui/stepper';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { generateProgramWithAria, type AriaGenerateProgramRequest } from '@/lib/api/aria-program';
import { useToast } from '@/hooks/use-toast';

interface AriaGenerateWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProgramGenerated: (templateId: string) => void;
}

interface WizardState {
  goals: string[];
  availableDays: string[];
  equipment: string[];
  weeks: number;
}

const GOALS = [
  { id: 'strength', label: 'Build Strength' },
  { id: 'muscle', label: 'Gain Muscle Mass' },
  { id: 'endurance', label: 'Improve Endurance' },
  { id: 'power', label: 'Develop Power' },
  { id: 'fat_loss', label: 'Fat Loss' },
  { id: 'general_fitness', label: 'General Fitness' },
  { id: 'sport_specific', label: 'Sport-Specific Training' },
  { id: 'rehabilitation', label: 'Rehabilitation' }
];

const DAYS = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' }
];

const EQUIPMENT = [
  { id: 'barbell', label: 'Barbell' },
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'kettlebells', label: 'Kettlebells' },
  { id: 'resistance_bands', label: 'Resistance Bands' },
  { id: 'pull_up_bar', label: 'Pull-up Bar' },
  { id: 'bench', label: 'Bench' },
  { id: 'squat_rack', label: 'Squat Rack' },
  { id: 'cable_machine', label: 'Cable Machine' },
  { id: 'bodyweight', label: 'Bodyweight Only' },
  { id: 'full_gym', label: 'Full Gym Access' }
];

export const AriaGenerateWizard: React.FC<AriaGenerateWizardProps> = ({
  open,
  onOpenChange,
  onProgramGenerated,
}) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [state, setState] = useState<WizardState>({
    goals: [],
    availableDays: [],
    equipment: [],
    weeks: 4
  });

  const updateState = (updates: Partial<WizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const toggleArrayItem = (array: string[], item: string) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Goals
        return state.goals.length > 0;
      case 1: // Days & Duration
        return state.availableDays.length > 0;
      case 2: // Equipment
        return state.equipment.length > 0;
      case 3: // Preview
        return true;
      default:
        return false;
    }
  };

  const generatePrompt = (): string => {
    const goalsText = state.goals.map(g => GOALS.find(goal => goal.id === g)?.label).join(', ');
    const daysText = state.availableDays.map(d => DAYS.find(day => day.id === d)?.label).join(', ');
    const equipmentText = state.equipment.map(e => EQUIPMENT.find(eq => eq.id === e)?.label).join(', ');
    
    return `Create a ${state.weeks}-week training program with the following specifications:

Goals: ${goalsText}
Available training days: ${daysText} (${state.availableDays.length} days per week)
Equipment available: ${equipmentText}

Please create a progressive program that incorporates these goals, fits the available schedule, and uses only the specified equipment.`;
  };

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      
      const request: AriaGenerateProgramRequest = {
        goal: generatePrompt(),
        weeks: state.weeks,
        availableDays: state.availableDays,
        equipment: state.equipment
      };

      const result = await generateProgramWithAria(request);
      
      toast({
        title: "Program Generated Successfully!",
        description: "ARIA has created your personalized training program.",
      });

      onProgramGenerated(result.template_id);
      onOpenChange(false);
      resetWizard();
      
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate program. Please try again.",
        variant: "destructive",
      });
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetWizard = () => {
    setCurrentStep(0);
    setState({
      goals: [],
      availableDays: [],
      equipment: [],
      weeks: 4
    });
  };

  const steps = [
    {
      label: 'Goals',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Training Goals</h2>
            <p className="text-white/70">What do you want to achieve? (Select all that apply)</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {GOALS.map((goal) => (
              <div key={goal.id} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Checkbox
                  id={goal.id}
                  checked={state.goals.includes(goal.id)}
                  onCheckedChange={() => updateState({ 
                    goals: toggleArrayItem(state.goals, goal.id) 
                  })}
                />
                <Label htmlFor={goal.id} className="text-white cursor-pointer flex-1">
                  {goal.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      label: 'Schedule',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Training Schedule</h2>
            <p className="text-white/70">When can you train?</p>
          </div>
          
          <div className="max-w-md mx-auto space-y-4">
            <div>
              <Label className="text-white mb-3 block">Program Duration</Label>
              <Select value={state.weeks.toString()} onValueChange={(value) => updateState({ weeks: parseInt(value) })}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4">4 weeks</SelectItem>
                  <SelectItem value="6">6 weeks</SelectItem>
                  <SelectItem value="8">8 weeks</SelectItem>
                  <SelectItem value="12">12 weeks</SelectItem>
                  <SelectItem value="16">16 weeks</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <Label className="text-white mb-3 block text-center">Available Training Days</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-lg mx-auto">
              {DAYS.map((day) => (
                <div key={day.id} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <Checkbox
                    id={day.id}
                    checked={state.availableDays.includes(day.id)}
                    onCheckedChange={() => updateState({ 
                      availableDays: toggleArrayItem(state.availableDays, day.id) 
                    })}
                  />
                  <Label htmlFor={day.id} className="text-white cursor-pointer flex-1">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      label: 'Equipment',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Available Equipment</h2>
            <p className="text-white/70">What equipment do you have access to?</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {EQUIPMENT.map((equipment) => (
              <div key={equipment.id} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                <Checkbox
                  id={equipment.id}
                  checked={state.equipment.includes(equipment.id)}
                  onCheckedChange={() => updateState({ 
                    equipment: toggleArrayItem(state.equipment, equipment.id) 
                  })}
                />
                <Label htmlFor={equipment.id} className="text-white cursor-pointer flex-1">
                  {equipment.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      label: 'Preview',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-2">Program Preview</h2>
            <p className="text-white/70">Review your program specifications before generation</p>
          </div>
          
          <Card className="bg-white/10 border-white/20 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                ARIA will generate a program with these specifications:
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-white font-semibold mb-2">Goals:</h4>
                <p className="text-white/80">
                  {state.goals.map(g => GOALS.find(goal => goal.id === g)?.label).join(', ')}
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Schedule:</h4>
                <p className="text-white/80">
                  {state.weeks} weeks, {state.availableDays.length} days per week ({state.availableDays.map(d => DAYS.find(day => day.id === d)?.label).join(', ')})
                </p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-2">Equipment:</h4>
                <p className="text-white/80">
                  {state.equipment.map(e => EQUIPMENT.find(eq => eq.id === e)?.label).join(', ')}
                </p>
              </div>
              
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Prompt to ARIA:</h4>
                <p className="text-white/70 text-sm whitespace-pre-wrap">{generatePrompt()}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[90vh] p-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col h-full">
          {/* Header - Sticky */}
          <div className="sticky top-0 z-10 flex-shrink-0 px-8 pt-8 pb-6 border-b border-white/10 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                <Sparkles className="w-8 h-8 text-purple-400" />
                Generate with ARIA
              </h1>
              <p className="text-white/70">Let AI create a personalized training program for you</p>
            </div>
            <Stepper value={currentStep} className="max-w-2xl mx-auto">
              {steps.map((step, index) => (
                <Step key={index} value={index} label={step.label} />
              ))}
            </Stepper>
          </div>

          {/* Content - Scrollable with max height */}
          <div className="overflow-y-auto max-h-[70vh] px-6">
            <div className="py-8">
              {steps[currentStep].content}
            </div>
          </div>

          {/* Footer - Sticky */}
          <div className="sticky bottom-0 z-10 flex-shrink-0 px-8 py-6 border-t border-white/10 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="flex justify-between items-center">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="text-white hover:bg-white/10"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex gap-3">
                {currentStep < steps.length - 1 ? (
                  <Button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    disabled={!canProceed()}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={!canProceed() || isGenerating}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Program
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};