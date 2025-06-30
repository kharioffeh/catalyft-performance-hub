
import React from 'react';
import { useAthletesRealtime } from '@/hooks/useAthletesRealtime';
import { AthletesList } from '@/components/Athletes/AthletesList';
import { AthleteDialogs } from '@/components/Athletes/AthleteDialogs';
import { FloatingInviteButton } from '@/components/Athletes/FloatingInviteButton';

const Athletes: React.FC = () => {
  const {
    athletes,
    isLoading,
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
    updateAthleteMutation
  } = useAthletesRealtime();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="container mx-auto px-0">
        {/* Athletes List */}
        <AthletesList
          athletes={athletes}
          isLoading={isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Floating Invite Button */}
        <FloatingInviteButton
          onClick={() => setIsAddDialogOpen(true)}
        />

        {/* Dialogs */}
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

export default Athletes;
