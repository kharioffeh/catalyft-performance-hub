
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { Athlete, AthleteFormData } from '@/types/athlete';

export const useAthletes = () => {
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
  const { data: coachData } = useQuery({
    queryKey: ['coach', profile?.id],
    queryFn: async () => {
      if (!profile?.email) throw new Error('No profile email found');
      
      const { data, error } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', profile.email)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.email && profile.role === 'coach'
  });

  // Fetch athletes
  const { data: athletes = [], isLoading } = useQuery({
    queryKey: ['athletes'],
    queryFn: async () => {
      if (!coachData?.id) throw new Error('No coach ID found');
      
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .eq('coach_uuid', coachData.id)
        .order('name');

      if (error) throw error;
      return data as Athlete[];
    },
    enabled: !!coachData?.id && profile?.role === 'coach'
  });

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
    deleteAthleteMutation
  };
};
