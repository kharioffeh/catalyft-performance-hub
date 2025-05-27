
import React from 'react';
import { useAthleteQueriesRealtime } from './athletes/useAthleteQueriesRealtime';
import { useAthleteMutationsRealtime } from './athletes/useAthleteMutationsRealtime';
import { useAthleteFormRealtime } from './athletes/useAthleteFormRealtime';

export const useAthletesRealtime = () => {
  const { athletes, isLoading, coachData, coachError, refetch } = useAthleteQueriesRealtime();
  const { addAthleteMutation, updateAthleteMutation, deleteAthleteMutation } = useAthleteMutationsRealtime(coachData?.id);
  const {
    isAddDialogOpen,
    setIsAddDialogOpen,
    editingAthlete,
    setEditingAthlete,
    formData,
    setFormData,
    resetForm,
    handleEdit,
    validateForm
  } = useAthleteFormRealtime();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (editingAthlete) {
      updateAthleteMutation.mutate(
        { id: editingAthlete.id, data: formData },
        {
          onSuccess: () => {
            setEditingAthlete(null);
            resetForm();
          }
        }
      );
    } else {
      addAthleteMutation.mutate(formData, {
        onSuccess: () => {
          setIsAddDialogOpen(false);
          resetForm();
        }
      });
    }
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
