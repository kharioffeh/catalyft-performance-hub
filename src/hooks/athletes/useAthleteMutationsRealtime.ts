
import { useAddAthleteMutation } from './useAddAthleteMutation';
import { useUpdateAthleteMutation } from './useUpdateAthleteMutation';
import { useDeleteAthleteMutation } from './useDeleteAthleteMutation';

export const useAthleteMutationsRealtime = (coachId?: string) => {
  const addAthleteMutation = useAddAthleteMutation(coachId);
  const updateAthleteMutation = useUpdateAthleteMutation();
  const deleteAthleteMutation = useDeleteAthleteMutation();

  return {
    addAthleteMutation,
    updateAthleteMutation,
    deleteAthleteMutation
  };
};
