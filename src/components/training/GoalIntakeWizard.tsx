import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Target, 
  Trophy, 
  Zap, 
  Heart, 
  Dumbbell,
  Calendar as CalendarLucide,
  Clock
} from 'lucide-react';

interface GoalIntakeWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface GoalData {
  type: string;
  customGoal?: string;
  targetDate?: Date;
  timeframe?: string;
  weeklyHours: number;
  daysPerWeek: number;
}

const GOAL_TYPES = [
  { id: 'strength', label: 'Build Strength', icon: Dumbbell, description: 'Increase muscle strength and power' },
  { id: 'endurance', label: 'Improve Endurance', icon: Heart, description: 'Enhance cardiovascular fitness' },
  { id: 'weight_loss', label: 'Weight Loss', icon: Zap, description: 'Reduce body weight and fat' },
  { id: 'muscle_gain', label: 'Muscle Gain', icon: Trophy, description: 'Build lean muscle mass' },
  { id: 'performance', label: 'Sport Performance', icon: Target, description: 'Enhance athletic performance' },
  { id: 'custom', label: 'Custom Goal', icon: Target, description: 'Define your own specific goal' }
];

const TIMEFRAMES = [
  { id: '4weeks', label: '4 Weeks', description: 'Quick transformation' },
  { id: '8weeks', label: '8 Weeks', description: 'Standard program' },
  { id: '12weeks', label: '12 Weeks', description: 'Comprehensive plan' },
  { id: '6months', label: '6 Months', description: 'Long-term goal' },
  { id: 'custom', label: 'Custom Date', description: 'Choose specific date' }
];

export const GoalIntakeWizard: React.FC<GoalIntakeWizardProps> = ({
  open,
  onOpenChange
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [goalData, setGoalData] = useState<GoalData>({
    type: '',
    weeklyHours: 4,
    daysPerWeek: 3
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Mock API call to /goals endpoint
    try {
      const response = await fetch('/api/goals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(goalData),
      });
      
      if (response.ok) {
        console.log('Goal submitted successfully:', goalData);
        onOpenChange(false);
        setCurrentStep(1);
        setGoalData({
          type: '',
          weeklyHours: 4,
          daysPerWeek: 3
        });
      }
    } catch (error) {
      console.error('Error submitting goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return goalData.type && (goalData.type !== 'custom' || goalData.customGoal);
      case 2:
        return goalData.timeframe && (goalData.timeframe !== 'custom' || goalData.targetDate);
      case 3:
        return goalData.weeklyHours > 0 && goalData.daysPerWeek > 0;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">What&apos;s your training goal?</h3>
        <p className="text-sm text-muted-foreground">Select the primary goal for your training program</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {GOAL_TYPES.map((goal) => {
          const Icon = goal.icon;
          return (
            <Card
              key={goal.id}
              className={cn(
                "cursor-pointer transition-all hover:bg-accent",
                goalData.type === goal.id && "ring-2 ring-primary bg-accent"
              )}
              onClick={() => setGoalData({ ...goalData, type: goal.id })}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{goal.label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{goal.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goalData.type === 'custom' && (
        <div className="mt-4">
          <Label htmlFor="customGoal">Describe your custom goal</Label>
          <Input
            id="customGoal"
            placeholder="e.g., Train for a marathon, improve flexibility..."
            value={goalData.customGoal || ''}
            onChange={(e) => setGoalData({ ...goalData, customGoal: e.target.value })}
            className="mt-2"
          />
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">When do you want to achieve this?</h3>
        <p className="text-sm text-muted-foreground">Choose your target timeframe</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {TIMEFRAMES.map((timeframe) => (
          <Card
            key={timeframe.id}
            className={cn(
              "cursor-pointer transition-all hover:bg-accent",
              goalData.timeframe === timeframe.id && "ring-2 ring-primary bg-accent"
            )}
            onClick={() => setGoalData({ ...goalData, timeframe: timeframe.id })}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CalendarLucide className="w-5 h-5 text-primary mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{timeframe.label}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{timeframe.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {goalData.timeframe === 'custom' && (
        <div className="mt-4">
          <Label>Target Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-2",
                  !goalData.targetDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {goalData.targetDate ? format(goalData.targetDate, "PPP") : "Select target date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={goalData.targetDate}
                onSelect={(date) => setGoalData({ ...goalData, targetDate: date })}
                disabled={(date) => date < new Date()}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">How much time can you commit?</h3>
        <p className="text-sm text-muted-foreground">Help us create a program that fits your schedule</p>
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Weekly Training Hours</Label>
            <Badge variant="secondary">{goalData.weeklyHours} hours/week</Badge>
          </div>
          <Slider
            value={[goalData.weeklyHours]}
            onValueChange={([value]) => setGoalData({ ...goalData, weeklyHours: value })}
            max={20}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>1 hour</span>
            <span>20 hours</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <Label className="text-sm font-medium">Days Per Week</Label>
            <Badge variant="secondary">{goalData.daysPerWeek} days/week</Badge>
          </div>
          <Slider
            value={[goalData.daysPerWeek]}
            onValueChange={([value]) => setGoalData({ ...goalData, daysPerWeek: value })}
            max={7}
            min={1}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>1 day</span>
            <span>7 days</span>
          </div>
        </div>

        <Card className="bg-accent/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Training Summary</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {goalData.weeklyHours} hours per week across {goalData.daysPerWeek} days
              {goalData.daysPerWeek > 0 && (
                <span className="block mt-1">
                  Average: {Math.round((goalData.weeklyHours / goalData.daysPerWeek) * 60)} minutes per session
                </span>
              )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Set Your Training Goal
          </DialogTitle>
        </DialogHeader>

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "flex-1 h-2 rounded-full transition-colors",
                step <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>

        {/* Step content */}
        <div className="min-h-[400px] overflow-y-auto">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </Button>

          <span className="text-sm text-muted-foreground">
            Step {currentStep} of 3
          </span>

          {currentStep < 3 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="flex items-center gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? 'Creating...' : 'Create Program'}
              <Target className="w-4 h-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};