
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Athlete, AthleteFormData } from '@/types/athlete';

export const useAthletesRealtime = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [formData, setFormData] = useState<AthleteFormData>({
    name: '',
    sex: '',
    dob: ''
  });

  // Fetch coach ID for the current user
  const { data: coachData, isLoading: isCoachLoading, error: coachError } = useQuery({
    queryKey: ['coach', profile?.id],
    queryFn: async () => {
      if (!profile?.email) {
        console.log('No profile email found for coach lookup');
        throw new Error('No profile email found');
      }
      
      console.log('Looking up coach for email:', profile.email);
      
      const { data, error } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', profile.email)
        .maybeSingle();

      if (error) {
        console.error('Coach lookup error:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No coach record found for email:', profile.email);
        return null;
      }
      
      console.log('Coach found:', data);
      return data;
    },
    enabled: !!profile?.email && profile.role === 'coach',
    retry: (failureCount, error) => {
      if (!error || error.message === 'No profile email found') {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Fetch athletes using the new view - only run if we have coach data
  const { data: athletes = [], isLoading: isAthletesLoading, refetch } = useQuery({
    queryKey: ['athletes', coachData?.id],
    queryFn: async () => {
      if (!coachData?.id) {
        console.log('No coach ID available for athletes query');
        return [];
      }
      
      console.log('Fetching athletes for coach:', coachData.id);
      
      const { data, error } = await supabase
        .from('vw_coach_athletes')
        .select('*')
        .eq('coach_uuid', coachData.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Athletes fetch error:', error);
        throw error;
      }
      
      console.log('Athletes fetched:', data?.length || 0);
      return data as Athlete[];
    },
    enabled: !!coachData?.id && profile?.role === 'coach'
  });

  // Set up realtime subscription for athlete changes
  useEffect(() => {
    if (!coachData?.id) return;

    console.log('Setting up realtime subscription for coach:', coachData.id);

    const channel = supabase
      .channel(`coach_${coachData.id}_athletes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'athletes',
          filter: `coach_uuid=eq.${coachData.id}`
        },
        (payload) => {
          console.log('Realtime athlete change:', payload);
          refetch();
        }
      )
      .on('broadcast', { event: 'athlete_added' }, (payload) => {
        console.log('Athlete added broadcast:', payload);
        refetch();
      })
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [coachData?.id, refetch]);

  // Combined loading state
  const isLoading = isCoachLoading || (coachData && isAthletesLoading);

  // Add athlete mutation
  const addAthleteMutation = useMutation({
    mutationFn: async (data: AthleteFormData) => {
      if (!coachData?.id) throw new Error('No coach ID found');

      const { data: result, error } = await supabase
        .from('athletes')
        .insert({
          name: data.name,
          sex: data.sex || null,
          dob: data.dob || null,
          coach_uuid: coachData.id
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Athlete added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add athlete: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update athlete mutation
  const updateAthleteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AthleteFormData }) => {
      const { data: result, error } = await supabase
        .from('athletes')
        .update({
          name: data.name,
          sex: data.sex || null,
          dob: data.dob || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      setEditingAthlete(null);
      resetForm();
      toast({
        title: "Success",
        description: "Athlete updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update athlete: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete athlete mutation
  const deleteAthleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('athletes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      toast({
        title: "Success",
        description: "Athlete deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete athlete: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({ name: '', sex: '', dob: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Athlete name is required",
        variant: "destructive",
      });
      return;
    }

    if (editingAthlete) {
      updateAthleteMutation.mutate({ id: editingAthlete.id, data: formData });
    } else {
      addAthleteMutation.mutate(formData);
    }
  };

  const handleEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setFormData({
      name: athlete.name,
      sex: athlete.sex || '',
      dob: athlete.dob || ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this athlete?')) {
      deleteAthleteMutation.mutate(id);
    }
  };

  return {
    athletes,
    isLoading,
    coachData,
    coachError,
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingAthlete,
    setEditingAthlete,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    resetForm,
    addAthleteMutation,
    updateAthleteMutation,
    deleteAthleteMutation,
    refetch
  };
};
