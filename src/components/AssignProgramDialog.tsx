
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAssignTemplate } from '@/hooks/useProgramTemplates';

interface AssignProgramDialogProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  athlete_id: string;
}

export const AssignProgramDialog: React.FC<AssignProgramDialogProps> = ({
  template,
  open,
  onOpenChange,
}) => {
  const { profile } = useAuth();
  const assignTemplate = useAssignTemplate();
  const { handleSubmit, setValue } = useForm<FormData>();

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
    if (!template) return;

    try {
      await assignTemplate.mutateAsync({
        template_id: template.id,
        athlete_id: data.athlete_id,
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error assigning template:', error);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Program</DialogTitle>
          <DialogDescription>
            Assign "{template.name}" to an athlete. This will copy the program to their workout blocks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="athlete">Select Athlete</Label>
            <Select onValueChange={(value) => setValue('athlete_id', value)}>
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

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={assignTemplate.isPending}>
              {assignTemplate.isPending ? 'Assigning...' : 'Assign Program'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
