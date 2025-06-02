
import React from 'react';
import { AthleteDialogs } from '@/components/Athletes/AthleteDialogs';

interface DebugHeaderProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  editingAthlete: any;
  setEditingAthlete: (athlete: any) => void;
  formData: any;
  setFormData: (data: any) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  addAthleteMutation: any;
  updateAthleteMutation: any;
}

export const DebugHeader: React.FC<DebugHeaderProps> = ({
  isAddDialogOpen,
  setIsAddDialogOpen,
  editingAthlete,
  setEditingAthlete,
  formData,
  setFormData,
  handleSubmit,
  resetForm,
  addAthleteMutation,
  updateAthleteMutation
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Athletes (Debug Mode)</h1>
        <p className="text-sm text-gray-500 mt-1">Check browser console for debug logs</p>
      </div>
      <div className="flex gap-2">
        <AthleteDialogs
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          editingAthlete={editingAthlete}
          setEditingAthlete={setEditingAthlete}
          formData={formData}
          setFormData={setFormData}
          handleSubmit={handleSubmit}
          resetForm={resetForm}
          addAthleteMutation={addAthleteMutation}
          updateAthleteMutation={updateAthleteMutation}
        />
      </div>
    </div>
  );
};
