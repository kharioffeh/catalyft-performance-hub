
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { AthleteDialogs } from '@/components/Athletes/AthleteDialogs';
import { AthletesTable } from '@/components/Athletes/AthletesTable';
import { useAthletes } from '@/hooks/useAthletes';

const Athletes: React.FC = () => {
  const { profile } = useAuth();
  const {
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
    updateAthleteMutation
  } = useAthletes();

  if (profile?.role !== 'coach') {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              This page is only available to coaches.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading state while fetching coach data
  if (!coachData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Athletes</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading coach data...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Athletes</h1>
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
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Athletes;
