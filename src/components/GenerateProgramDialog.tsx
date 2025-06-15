
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useGenerateProgram } from '@/hooks/useProgramTemplates';

interface GenerateProgramDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  athlete_uuid: string;
  weeks: number;
  focus: string;
}

export const GenerateProgramDialog: React.FC<GenerateProgramDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { profile } = useAuth();
  const generateProgram = useGenerateProgram();
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>();

  // Fetch available athletes for the coach
  const { data: athletes = [] } = useQuery({
    queryKey: ['coach-athletes', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      const { data, error } = await supabase
        .from('athletes')
        .select('id, name')
        .eq('coach_uuid', profile.id);

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.id && open,
  });

  const onSubmit = async (data: FormData) => {
    try {
      await generateProgram.mutateAsync({
        athlete_uuid: data.athlete_uuid,
        weeks: Number(data.weeks),
        focus: data.focus || undefined,
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating program:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Generate Program with ARIA</DialogTitle>
          <DialogDescription>
            Let ARIA create a personalized training program based on athlete data and your preferences.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="athlete">Select Athlete</Label>
            <Select onValueChange={(value) => setValue('athlete_uuid', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an athlete" />
              </SelectTrigger>
              <SelectContent>
                {athletes.map((athlete) => (
                  <SelectItem key={athlete.id} value={athlete.id}>
                    {athlete.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weeks">Program Duration</Label>
            <Select onValueChange={(value) => setValue('weeks', Number(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select weeks" />
              </SelectTrigger>
              <SelectContent>
                {[4, 6, 8, 10, 12].map((week) => (
                  <SelectItem key={week} value={week.toString()}>
                    {week} weeks
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="focus">Training Focus (Optional)</Label>
            <Input
              id="focus"
              {...register('focus')}
              placeholder="e.g., Strength, Power, Endurance, Sport-specific"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={generateProgram.isPending}>
              {generateProgram.isPending ? 'Generating...' : 'Generate Program'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
