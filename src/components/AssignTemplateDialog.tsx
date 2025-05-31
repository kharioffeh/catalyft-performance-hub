
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

interface AssignTemplateDialogProps {
  template: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AssignTemplateDialog: React.FC<AssignTemplateDialogProps> = ({
  template,
  open,
  onOpenChange,
}) => {
  const { user } = useAuth();
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const queryClient = useQueryClient();

  // Get current coach
  const { data: coach } = useQuery({
    queryKey: ['current-coach'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', user?.email)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.email,
  });

  // Get athletes for the current coach
  const { data: athletes = [], isLoading } = useQuery({
    queryKey: ['coach-athletes', coach?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .eq('coach_uuid', coach.id);

      if (error) throw error;
      return data;
    },
    enabled: !!coach?.id,
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('assign_template', {
        body: {
          template_id: template.id,
          athlete_ids: selectedAthletes,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workout-blocks'] });
      toast({
        title: "Templates Assigned",
        description: `Successfully assigned template to ${data.count} athletes`,
      });
      onOpenChange(false);
      setSelectedAthletes([]);
    },
    onError: (error) => {
      toast({
        title: "Assignment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAthleteToggle = (athleteId: string) => {
    setSelectedAthletes(prev => 
      prev.includes(athleteId)
        ? prev.filter(id => id !== athleteId)
        : [...prev, athleteId]
    );
  };

  const handleConfirm = () => {
    if (selectedAthletes.length === 0) {
      toast({
        title: "No Athletes Selected",
        description: "Please select at least one athlete to assign the template to",
        variant: "destructive",
      });
      return;
    }
    assignMutation.mutate();
  };

  if (!template) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign Template: {template.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Select athletes to assign this template to:
          </p>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : athletes.length > 0 ? (
            <div className="max-h-60 overflow-auto space-y-2">
              {athletes.map((athlete) => (
                <div key={athlete.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={athlete.id}
                    checked={selectedAthletes.includes(athlete.id)}
                    onCheckedChange={() => handleAthleteToggle(athlete.id)}
                  />
                  <label
                    htmlFor={athlete.id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {athlete.name}
                  </label>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No athletes found</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={selectedAthletes.length === 0 || assignMutation.isPending}
          >
            {assignMutation.isPending ? 'Assigning...' : 'Assign Template'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
