
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useGenerateSoloProgram } from '@/hooks/useBlock';
import { Sparkles, Dumbbell, Loader2 } from 'lucide-react';

interface ProgramBuilderModalProps {
  open: boolean;
  onClose: () => void;
}

const goalOptions = [
  { value: 'max_strength', label: 'Maximum Strength' },
  { value: 'hypertrophy', label: 'Muscle Building' },
  { value: 'speed_power', label: 'Speed & Power' },
  { value: 'in-season_maint', label: 'In-Season Maintenance' },
];

const durationOptions = [
  { value: 4, label: '4 weeks' },
  { value: 6, label: '6 weeks' },
  { value: 8, label: '8 weeks' },
  { value: 10, label: '10 weeks' },
  { value: 12, label: '12 weeks' },
];

export const ProgramBuilderModal: React.FC<ProgramBuilderModalProps> = ({
  open,
  onClose,
}) => {
  const [goal, setGoal] = useState('');
  const [weeks, setWeeks] = useState<number>(8);
  const generateProgram = useGenerateSoloProgram();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal) return;

    try {
      await generateProgram.mutateAsync({ goal, weeks });
      onClose();
      // Reset form
      setGoal('');
      setWeeks(8);
    } catch (error) {
      console.error('Failed to generate program:', error);
    }
  };

  const handleClose = () => {
    if (!generateProgram.isPending) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-slate-900/95 via-indigo-900/95 to-slate-900/95 backdrop-blur-md border border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            Create Your Program
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="generate" className="mt-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/10">
            <TabsTrigger 
              value="generate" 
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate with ARIA
            </TabsTrigger>
            <TabsTrigger 
              value="manual"
              className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
              disabled
            >
              <Dumbbell className="w-4 h-4 mr-2" />
              Manual (Coming Soon)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-6">
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal" className="text-white font-medium">
                    Training Goal
                  </Label>
                  <Select value={goal} onValueChange={setGoal} required>
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue placeholder="Select your primary training goal" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      {goalOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value}
                          className="text-white hover:bg-white/10"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration" className="text-white font-medium">
                    Program Duration
                  </Label>
                  <Select 
                    value={weeks.toString()} 
                    onValueChange={(value) => setWeeks(parseInt(value))}
                  >
                    <SelectTrigger className="bg-white/5 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-white/20">
                      {durationOptions.map((option) => (
                        <SelectItem 
                          key={option.value} 
                          value={option.value.toString()}
                          className="text-white hover:bg-white/10"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                <h4 className="text-white font-medium mb-2">What ARIA will create:</h4>
                <ul className="text-white/70 text-sm space-y-1">
                  <li>• Periodized training blocks optimized for your goal</li>
                  <li>• Safe exercises suitable for solo training</li>
                  <li>• Progressive overload built in</li>
                  <li>• Recovery sessions included</li>
                </ul>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  disabled={generateProgram.isPending}
                  className="flex-1 text-white border-white/20 hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!goal || generateProgram.isPending}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {generateProgram.isPending ? (
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
              </div>
            </form>
          </TabsContent>

          <TabsContent value="manual" className="mt-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Dumbbell className="w-8 h-8 text-white/60" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Manual Program Builder</h3>
              <p className="text-white/60">
                Coming soon! Build custom programs week by week with our visual editor.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
