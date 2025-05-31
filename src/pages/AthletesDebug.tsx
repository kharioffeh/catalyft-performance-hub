
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AthleteDialogs } from '@/components/Athletes/AthleteDialogs';
import { AthletesTable } from '@/components/Athletes/AthletesTable';
import { AthleteInviteForm } from '@/components/Athletes/AthleteInviteForm';
import { useAthleteQueriesFixed } from '@/hooks/athletes/useAthleteQueriesFixed';
import { useAthleteMutationsRealtime } from '@/hooks/athletes/useAthleteMutationsRealtime';
import { useAthleteFormRealtime } from '@/hooks/athletes/useAthleteFormRealtime';

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

  // Check if user has the right role
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

  // Show error if coach lookup failed
  if (coachError) {
    console.error('Coach error in Athletes page:', coachError);
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Athletes (Debug Mode)</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Coach Setup Required</AlertTitle>
          <AlertDescription className="mt-2">
            Your coach profile needs to be set up. Please contact support or try refreshing the page.
            <div className="mt-4">
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Show loading state while fetching coach data
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Athletes (Debug Mode)</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show message if no coach record found
  if (!coachData) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Athletes (Debug Mode)</h1>
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Coach Profile Not Found</AlertTitle>
          <AlertDescription className="mt-2">
            We couldn't find your coach profile. This might be because your account hasn't been set up as a coach yet.
            <div className="mt-4">
              <Button onClick={() => window.location.reload()} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleInviteSent = () => {
    // Refresh athletes list when new invite is sent
    refetch();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Athletes (Debug Mode)</h1>
          <p className="text-sm text-gray-500 mt-1">Check browser console for debug logs</p>
        </div>
        <div className="flex gap-2">
          <AthleteInviteForm onInviteSent={handleInviteSent} />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Email: {profile?.email}</p>
            <p className="text-xs text-gray-600">Role: {profile?.role}</p>
            <p className="text-xs text-gray-600">ID: {profile?.id}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Coach Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Coach ID: {coachData?.id}</p>
            <p className="text-xs text-gray-600">Status: {coachData ? 'Found' : 'Not Found'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Athletes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">Count: {athletes?.length || 0}</p>
            <p className="text-xs text-gray-600">Loading: {isLoading ? 'Yes' : 'No'}</p>
          </CardContent>
        </Card>
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
