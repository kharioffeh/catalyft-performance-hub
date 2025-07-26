
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useCreateProgramFromTemplate } from '@/hooks/useCreateProgramFromTemplate';
import { Template } from '@/types/training';

interface CreateProgramFromTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template | null;
}

interface FormData {
  athlete_uuid: string;
  start_date: Date;
}

export const CreateProgramFromTemplateDialog: React.FC<CreateProgramFromTemplateDialogProps> = ({
  open,
  onOpenChange,
  template,
}) => {
  const { profile } = useAuth();
  const createProgram = useCreateProgramFromTemplate();
  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    defaultValues: {
      start_date: new Date(),
    },
  });

  // Fetch available athletes for the coach
  const { data: athletes = [] } = useQuery({
    queryKey: ['coach-athletes', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return []; // Solo users have no athletes
      
      const { data, error } = await supabase
        .from('athletes')
        .select('id, name')
        .eq('coach_uuid', profile.id);

      if (error) throw error;
      return data;
    },
    enabled: false, // Athletes query disabled for solo users
  });

  const onSubmit = async (data: FormData) => {
    if (!template || !profile?.id) return;

    try {
      await createProgram.mutateAsync({
        templateId: template.id,
        athleteUuid: undefined, // Solo users don't assign to athletes
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating program:', error);
    }
  };

  const selectedDate = watch('start_date');
  // All users are solo now
  const isCoach = false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Program from Template</DialogTitle>
          <DialogDescription>
            Create a new training program using "{template?.title}" template.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {isCoach && (
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
          )}

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setValue('start_date', date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {template && (
            <div className="rounded-lg bg-gray-50 p-3 text-sm">
              <p><strong>Template:</strong> {template.title}</p>
              <p><strong>Duration:</strong> {template.weeks} weeks</p>
              <p><strong>Goal:</strong> {template.goal}</p>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createProgram.isPending || (isCoach && !watch('athlete_uuid'))}
            >
              {createProgram.isPending ? 'Creating...' : 'Create Program'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
