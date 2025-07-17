
import React, { useState } from 'react';
import { useAthletesRealtime } from '@/hooks/useAthletesRealtime';
import { AthletesList } from '@/components/Athletes/AthletesList';
import { AthleteDialogs } from '@/components/Athletes/AthleteDialogs';
import { FloatingInviteButton } from '@/components/Athletes/FloatingInviteButton';
import { InviteAthleteModal } from '@/components/Athletes/InviteAthleteModal';

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
    updateAthleteMutation,
    refetch
  } = useAthletesRealtime();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleInviteSuccess = () => {
    // Optimistically refetch the athletes list to show any updates
    refetch();
  };

  return (
    <div className="min-h-screen bg-brand-charcoal">
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
          onClick={() => setIsInviteModalOpen(true)}
        />

        {/* Invite Modal */}
        <InviteAthleteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onSuccess={handleInviteSuccess}
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
