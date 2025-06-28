
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface NotificationPreferences {
  daily_summary: boolean;
  missed_workout: boolean;
  abnormal_readiness: boolean;
}

export interface NotificationThresholds {
  readiness_threshold: number;
  strain_threshold: number;
}

export const useNotificationPreferences = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferences, isLoading: preferencesLoading } = useQuery({
    queryKey: ['notification-preferences', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('notification_prefs')
        .eq('id', profile.id)
        .single();

      if (error) throw error;
      return data?.notification_prefs as NotificationPreferences || {
        daily_summary: true,
        missed_workout: true,
        abnormal_readiness: true
      };
    },
    enabled: !!profile?.id
  });

  const { data: thresholds, isLoading: thresholdsLoading } = useQuery({
    queryKey: ['notification-thresholds', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('notification_thresholds')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || {
        readiness_threshold: 40,
        strain_threshold: 18
      };
    },
    enabled: !!profile?.id
  });

  const updatePreferences = useMutation({
    mutationFn: async (newPreferences: NotificationPreferences) => {
      if (!profile?.id) throw new Error('No user ID');

      const { error } = await supabase
        .from('profiles')
        .update({ notification_prefs: newPreferences })
        .eq('id', profile.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved",
      });
    },
    onError: (error) => {
      console.error('Error updating preferences:', error);
      toast({
        title: "Error",
        description: "Failed to update notification preferences",
        variant: "destructive"
      });
    }
  });

  const updateThresholds = useMutation({
    mutationFn: async (newThresholds: NotificationThresholds) => {
      if (!profile?.id) throw new Error('No user ID');

      const { error } = await supabase
        .from('notification_thresholds')
        .upsert({
          user_id: profile.id,
          ...newThresholds,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-thresholds'] });
      toast({
        title: "Thresholds Updated",
        description: "Your alert thresholds have been saved",
      });
    },
    onError: (error) => {
      console.error('Error updating thresholds:', error);
      toast({
        title: "Error",
        description: "Failed to update alert thresholds",
        variant: "destructive"
      });
    }
  });

  return {
    preferences,
    thresholds,
    isLoading: preferencesLoading || thresholdsLoading,
    updatePreferences: updatePreferences.mutate,
    updateThresholds: updateThresholds.mutate,
    isUpdating: updatePreferences.isPending || updateThresholds.isPending
  };
};
