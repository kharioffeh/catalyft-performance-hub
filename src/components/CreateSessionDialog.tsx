
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { QueryClient } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGlassToast } from '@/hooks/useGlassToast';
import { Calendar } from 'lucide-react';
import { AthleteSelect } from './session-form/AthleteSelect';
import { SessionTypeSelect } from './session-form/SessionTypeSelect';
import { DateInput } from './session-form/DateInput';
import { StartTimeInput } from './session-form/StartTimeInput';
import { EndTimeInput } from './session-form/EndTimeInput';
import { SessionNotesInput } from './session-form/SessionNotesInput';
import { useCreateSessionForm } from '@/hooks/useCreateSessionForm';

interface CreateSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  queryClient: QueryClient;
}

export const CreateSessionDialog: React.FC<CreateSessionDialogProps> = ({
  open,
  onOpenChange,
  queryClient
}) => {
  const { profile } = useAuth();
  const toast = useGlassToast();
  const {
    athletes,
    loading,
    setLoading,
    formData,
    setFormData,
    resetForm,
  } = useCreateSessionForm(open, profile);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.athlete_id || !formData.type || !formData.date || !formData.start_time || !formData.end_time) {
      toast.error("Missing Information", "Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const startDateTime = new Date(`${formData.date}T${formData.start_time}`);
      const endDateTime = new Date(`${formData.date}T${formData.end_time}`);

      if (endDateTime <= startDateTime) {
        toast.error("Invalid Time", "End time must be after start time");
        setLoading(false);
        return;
      }

      const { createSession } = await import("@/lib/api/sessions");
      await createSession({
        athlete_uuid: formData.athlete_id,
        type: formData.type,
        start_ts: startDateTime.toISOString(),
        end_ts: endDateTime.toISOString(),
        notes: formData.notes || null,
      });

      toast.success("Session Scheduled", "Training session scheduled successfully");

      resetForm();
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error creating session:', error);
      toast.error("Failed to Schedule", error?.message ?? "Failed to schedule session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Schedule Training Session
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <AthleteSelect
              athletes={athletes}
              value={formData.athlete_id}
              onChange={(v) => setFormData(prev => ({ ...prev, athlete_id: v }))}
            />
            <SessionTypeSelect
              value={formData.type}
              onChange={(v) => setFormData(prev => ({ ...prev, type: v }))}
            />
            <DateInput
              value={formData.date}
              onChange={(v) => setFormData(prev => ({ ...prev, date: v }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <StartTimeInput
                value={formData.start_time}
                onChange={(v) => setFormData(prev => ({ ...prev, start_time: v }))}
              />
              <EndTimeInput
                value={formData.end_time}
                onChange={(v) => setFormData(prev => ({ ...prev, end_time: v }))}
              />
            </div>
            <SessionNotesInput
              value={formData.notes}
              onChange={(v) => setFormData(prev => ({ ...prev, notes: v }))}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Scheduling...' : 'Schedule Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
