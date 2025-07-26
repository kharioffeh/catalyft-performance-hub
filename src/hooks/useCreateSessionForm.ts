
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Athlete {
  id: string;
  name: string;
}
export interface FormData {
  athlete_id: string;
  type: string;
  date: string;
  start_time: string;
  end_time: string;
  notes: string;
}

export function useCreateSessionForm(open: boolean, profile: any) {
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    athlete_id: '',
    type: '',
    date: '',
    start_time: '',
    end_time: '',
    notes: '',
  });

  useEffect(() => {
    if (open && false) { // Disabled for solo users
      fetchAthletes();
    }
    // eslint-disable-next-line
  }, [open, profile]);

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from('athletes')
        .select('id, name')
        .order('name');
      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error('Error fetching athletes:', error);
      toast({
        title: "Error",
        description: "Failed to load athletes",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      athlete_id: '',
      type: '',
      date: '',
      start_time: '',
      end_time: '',
      notes: '',
    });
  };

  return {
    athletes,
    loading,
    setLoading,
    formData,
    setFormData,
    resetForm,
  };
}
