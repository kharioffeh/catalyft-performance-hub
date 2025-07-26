import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Target, User, Dumbbell, Sparkles, Loader2 } from 'lucide-react';
import { generateProgramWithAria } from '@/lib/api/aria-program';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  goal: string;
  experience: string;
  equipment: string[];
}

const TRAINING_GOALS = [
  { id: 'strength', label: 'Strength', description: 'Build maximum strength and power', icon: '💪' },
  { id: 'hypertrophy', label: 'Hypertrophy', description: 'Increase muscle size and mass', icon: '🏋️' },
  { id: 'power', label: 'Power', description: 'Develop explosive strength', icon: '⚡' },
  { id: 'conditioning', label: 'Conditioning', description: 'Improve cardiovascular fitness', icon: '❤️' }
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', description: 'New to structured training' },
  { id: 'intermediate', label: 'Intermediate', description: '1-3 years of training experience' },
  { id: 'advanced', label: 'Advanced', description: '3+ years of consistent training' }
];

const EQUIPMENT_OPTIONS = [
  { id: 'barbell', label: 'Barbell' },
  { id: 'dumbbells', label: 'Dumbbells' },
  { id: 'rack', label: 'Squat Rack' },
  { id: 'cable', label: 'Cable Machine' },
  { id: 'bands', label: 'Resistance Bands' },
  { id: 'bodyweight', label: 'Bodyweight' }
];

export const SoloWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    goal: '',
    experience: '',
    equipment: []
  });
  
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleEquipmentChange = (equipmentId: string, checked: boolean) => {
    setData(prev => ({
      ...prev,
      equipment: checked 
        ? [...prev.equipment, equipmentId]
        : prev.equipment.filter(id => id !== equipmentId)
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    if (!profile) return;
    
    setIsLoading(true);
    
    try {
      // Generate program with ARIA
      const result = await generateProgramWithAria({
        goal: data.goal,
        weeks: 8, // Default 8-week program
        availableDays: ['Monday', 'Wednesday', 'Friday'], // Default schedule
        equipment: data.equipment,
        prompt: `Create a ${data.experience} level ${data.goal} training program with available equipment: ${data.equipment.join(', ')}`
      });

      // Mark onboarding as completed
      await supabase
        .from('profiles')
        .update({ has_completed_onboarding: true })
        .eq('id', profile.id);

      toast({
        title: "Welcome to Catalyft!",
        description: "Your personalized training program has been created.",
      });

      // Navigate to training plan
      navigate('/training-plan');
    } catch (error) {
      console.error('Error creating program:', error);
      toast({
        title: "Error",
        description: "Failed to create your program. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.goal !== '';
      case 2: return data.experience !== '';
      case 3: return data.equipment.length > 0;
      case 4: return true;
      default: return false;
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-2 mb-8">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${
            step === currentStep 
              ? 'bg-brand-blue' 
              : step < currentStep 
                ? 'bg-brand-blue/60' 
                : 'bg-white/20'
          }`} />
          {step < 4 && <div className="w-8 h-px bg-white/20 mx-2" />}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader className="text-center">
        <Target className="w-12 h-12 text-brand-blue mx-auto mb-4" />
        <CardTitle className="text-2xl text-white">What's your training goal?</CardTitle>
        <p className="text-white/70">Choose your primary focus</p>
      </CardHeader>
      <CardContent>
        <RadioGroup value={data.goal} onValueChange={(value) => setData(prev => ({ ...prev, goal: value }))}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {TRAINING_GOALS.map((goal) => (
              <div key={goal.id} className="relative">
                <RadioGroupItem value={goal.id} id={goal.id} className="sr-only" />
                <Label 
                  htmlFor={goal.id}
                  className={`flex flex-col p-4 rounded-lg border cursor-pointer transition-all ${
                    data.goal === goal.id 
                      ? 'border-brand-blue bg-brand-blue/20 text-brand-blue' 
                      : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl mb-2">{goal.icon}</span>
                  <span className="font-semibold">{goal.label}</span>
                  <span className="text-sm opacity-70">{goal.description}</span>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );

  const renderStep2 = () => (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader className="text-center">
        <User className="w-12 h-12 text-brand-blue mx-auto mb-4" />
        <CardTitle className="text-2xl text-white">What's your experience level?</CardTitle>
        <p className="text-white/70">Help us tailor the program complexity</p>
      </CardHeader>
      <CardContent>
        <RadioGroup value={data.experience} onValueChange={(value) => setData(prev => ({ ...prev, experience: value }))}>
          <div className="space-y-4">
            {EXPERIENCE_LEVELS.map((level) => (
              <div key={level.id} className="relative">
                <RadioGroupItem value={level.id} id={level.id} className="sr-only" />
                <Label 
                  htmlFor={level.id}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    data.experience === level.id 
                      ? 'border-brand-blue bg-brand-blue/20 text-brand-blue' 
                      : 'border-white/20 bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex-1">
                    <span className="font-semibold block">{level.label}</span>
                    <span className="text-sm opacity-70">{level.description}</span>
                  </div>
                  {data.experience === level.id && <CheckCircle className="w-5 h-5 ml-4" />}
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );

  const renderStep3 = () => (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader className="text-center">
        <Dumbbell className="w-12 h-12 text-brand-blue mx-auto mb-4" />
        <CardTitle className="text-2xl text-white">Available equipment</CardTitle>
        <p className="text-white/70">Select all equipment you have access to</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {EQUIPMENT_OPTIONS.map((equipment) => (
            <div key={equipment.id} className="flex items-center space-x-3">
              <Checkbox 
                id={equipment.id}
                checked={data.equipment.includes(equipment.id)}
                onCheckedChange={(checked) => handleEquipmentChange(equipment.id, checked as boolean)}
                className="border-white/30 text-brand-blue"
              />
              <Label 
                htmlFor={equipment.id}
                className="text-white cursor-pointer"
              >
                {equipment.label}
              </Label>
            </div>
          ))}
        </div>
        {data.equipment.length > 0 && (
          <div className="mt-6">
            <p className="text-white/70 text-sm mb-2">Selected equipment:</p>
            <div className="flex flex-wrap gap-2">
              {data.equipment.map((equipmentId) => {
                const equipment = EQUIPMENT_OPTIONS.find(e => e.id === equipmentId);
                return (
                  <Badge key={equipmentId} variant="secondary" className="bg-brand-blue/20 text-brand-blue">
                    {equipment?.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderStep4 = () => (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader className="text-center">
        <Sparkles className="w-12 h-12 text-brand-blue mx-auto mb-4" />
        <CardTitle className="text-2xl text-white">Ready to start training!</CardTitle>
        <p className="text-white/70">We'll create your personalized program</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-white/70">Goal:</span>
            <span className="text-white font-medium">
              {TRAINING_GOALS.find(g => g.id === data.goal)?.label}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/70">Experience:</span>
            <span className="text-white font-medium">
              {EXPERIENCE_LEVELS.find(e => e.id === data.experience)?.label}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-white/70">Equipment:</span>
            <div className="flex flex-wrap gap-1 max-w-xs">
              {data.equipment.map((equipmentId) => {
                const equipment = EQUIPMENT_OPTIONS.find(e => e.id === equipmentId);
                return (
                  <Badge key={equipmentId} variant="outline" className="text-xs">
                    {equipment?.label}
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-charcoal via-brand-charcoal/90 to-brand-charcoal flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {renderStepIndicator()}
        
        <div className="mb-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isLoading}
            className="bg-transparent border-white/20 text-white hover:bg-white/10"
          >
            Back
          </Button>
          
          {currentStep < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="bg-brand-blue text-brand-charcoal hover:bg-brand-blue/80"
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={isLoading}
              className="bg-brand-blue text-brand-charcoal hover:bg-brand-blue/80"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating Program...
                </>
              ) : (
                'Create My Program'
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};