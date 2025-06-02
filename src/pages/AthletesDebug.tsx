
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { AthletesTable } from '@/components/Athletes/AthletesTable';
import { useAthleteQueriesFixed } from '@/hooks/athletes/useAthleteQueriesFixed';
import { useAthleteMutationsRealtime } from '@/hooks/athletes/useAthleteMutationsRealtime';
import { useAthleteFormRealtime } from '@/hooks/athletes/useAthleteFormRealtime';
import { AccessControl } from '@/components/AthletesDebug/AccessControl';
import { DebugHeader } from '@/components/AthletesDebug/DebugHeader';
import { DebugInfoCards } from '@/components/AthletesDebug/DebugInfoCards';

const AthletesDebug: React.FC = () => {
  const { profile } = useAuth();
  const {
    athletes,
    isLoading,
    coachData,
    coachError,
    refetch
  } = useAthleteQueriesFixed();

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

  // Check access control first
  const accessControlResult = AccessControl({
    profile,
    coachError,
    isLoading,
    coachData
  });

  if (accessControlResult) {
    return accessControlResult;
  }

  return (
    <div className="space-y-6">
      <DebugHeader
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

      <DebugInfoCards
        profile={profile}
        coachData={coachData}
        athletes={athletes}
        isLoading={isLoading}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Your Athletes ({athletes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AthletesTable
            athletes={athletes}
            isLoading={false}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AthletesDebug;
