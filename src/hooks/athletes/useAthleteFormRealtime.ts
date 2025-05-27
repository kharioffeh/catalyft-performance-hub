
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { Athlete, AthleteFormData } from '@/types/athlete';

export const useAthleteFormRealtime = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [formData, setFormData] = useState<AthleteFormData>({
    name: '',
    sex: '',
    dob: ''
  });

  const resetForm = () => {
    setFormData({ name: '', sex: '', dob: '' });
  };

  const handleEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setFormData({
      name: athlete.name,
      sex: athlete.sex || '',
      dob: athlete.dob || ''
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Athlete name is required",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingAthlete,
    setEditingAthlete,
    formData,
    setFormData,
    resetForm,
    handleEdit,
    validateForm
  };
};
