
import { useAthleteQueries } from './athletes/useAthleteQueries';
import { useAthleteMutations } from './athletes/useAthleteMutations';
import { useAthleteForm } from './athletes/useAthleteForm';

export const useAthletes = () => {
  const { athletes, isLoading, coachData, coachError } = useAthleteQueries();
  const { addAthleteMutation, updateAthleteMutation, deleteAthleteMutation } = useAthleteMutations(coachData?.id);
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
  } = useAthleteForm();

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
    deleteAthleteMutation
  };
};
