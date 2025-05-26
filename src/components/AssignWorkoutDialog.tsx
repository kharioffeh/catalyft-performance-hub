
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAssignWorkout } from '@/hooks/useAssignedWorkouts';
import { WorkoutTemplate } from '@/types/workout';

interface AssignWorkoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: WorkoutTemplate | null;
}

interface FormData {
  athlete_uuid: string;
  assigned_date: string;
  due_date: string;
  notes: string;
}

export const AssignWorkoutDialog: React.FC<AssignWorkoutDialogProps> = ({
  open,
  onOpenChange,
  template,
}) => {
  const { profile } = useAuth();
  const assignWorkout = useAssignWorkout();
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

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
    if (!profile?.id || !template?.id) return;

    try {
      await assignWorkout.mutateAsync({
        template_id: template.id,
        athlete_uuid: data.athlete_uuid,
        coach_uuid: profile.id,
        assigned_date: data.assigned_date,
        due_date: data.due_date || undefined,
        status: 'assigned',
        notes: data.notes || undefined,
      });
      reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning workout:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Workout</DialogTitle>
          <DialogDescription>
            Assign "{template?.name}" to an athlete.
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assigned_date">Assigned Date</Label>
              <Input
                id="assigned_date"
                type="date"
                {...register('assigned_date', { required: true })}
                defaultValue={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due Date (Optional)</Label>
              <Input
                id="due_date"
                type="date"
                {...register('due_date')}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any specific instructions or modifications..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={assignWorkout.isPending}>
              {assignWorkout.isPending ? 'Assigning...' : 'Assign Workout'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
