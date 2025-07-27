
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { generateProgramWithAria } from '@catalyft/core/dist/api/aria-program';
import { Loader2, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AriaGenerateWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProgramGenerated: (data: { template_id: string; program_instance_id: string }) => void;
}

export const AriaGenerateWizard: React.FC<AriaGenerateWizardProps> = ({
  open,
  onOpenChange,
  onProgramGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [goal, setGoal] = useState('');
  const [weeks, setWeeks] = useState(4);
  const [availableDays, setAvailableDays] = useState<string[]>(['Monday', 'Wednesday', 'Friday']);
  const [equipment, setEquipment] = useState<string[]>(['Dumbbells', 'Barbell']);
  const { toast } = useToast();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const equipmentOptions = [
    'Dumbbells', 'Barbell', 'Kettlebells', 'Resistance Bands', 'Pull-up Bar',
    'Bench', 'Squat Rack', 'Cable Machine', 'Treadmill', 'Bodyweight Only'
  ];

  const handleDayToggle = (day: string) => {
    setAvailableDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleEquipmentToggle = (item: string) => {
    setEquipment(prev => 
      prev.includes(item) 
        ? prev.filter(e => e !== item)
        : [...prev, item]
    );
  };

  const handleGenerate = async () => {
    if (!goal.trim()) {
      toast({
        title: "Goal Required",
        description: "Please describe your training goal",
        variant: "destructive"
      });
      return;
    }

    if (availableDays.length === 0) {
      toast({
        title: "Training Days Required",
        description: "Please select at least one training day",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log('Generating program with:', {
        goal,
        weeks,
        available_days: availableDays,
        equipment
      });

      const result = await generateProgramWithAria({
        goal,
        weeks,
        availableDays: availableDays,
        equipment
      });

      console.log('Generation result:', result);

      toast({
        title: "Program Generated!",
        description: "Your personalized training program has been created",
      });

      onProgramGenerated(result);
    } catch (error) {
      console.error('Program generation failed:', error);
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate program",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900/95 backdrop-blur-md border border-white/10 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Generate Program with ARIA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label htmlFor="goal" className="text-white">Training Goal</Label>
            <Textarea
              id="goal"
              placeholder="Describe your training goal (e.g., build strength, lose weight, improve endurance...)"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div>
            <Label htmlFor="weeks" className="text-white">Program Duration (weeks)</Label>
            <Select value={weeks.toString()} onValueChange={(v) => setWeeks(parseInt(v))}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2, 4, 6, 8, 12].map(w => (
                  <SelectItem key={w} value={w.toString()}>{w} weeks</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-white">Available Training Days</Label>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {daysOfWeek.map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={availableDays.includes(day)}
                    onCheckedChange={() => handleDayToggle(day)}
                  />
                  <Label htmlFor={day} className="text-white/80 text-sm">{day.slice(0, 3)}</Label>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-white">Available Equipment</Label>
            <div className="grid grid-cols-2 gap-2 mt-2 max-h-32 overflow-y-auto">
              {equipmentOptions.map(item => (
                <div key={item} className="flex items-center space-x-2">
                  <Checkbox
                    id={item}
                    checked={equipment.includes(item)}
                    onCheckedChange={() => handleEquipmentToggle(item)}
                  />
                  <Label htmlFor={item} className="text-white/80 text-sm">{item}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isGenerating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isGenerating ? 'Generating...' : 'Generate Program'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
