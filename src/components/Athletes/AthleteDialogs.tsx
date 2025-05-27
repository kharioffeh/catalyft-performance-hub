
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { AthleteForm } from './AthleteForm';
import { AthleteFormData, Athlete } from '@/types/athlete';
import AthleteAddGuard from '@/components/AthleteAddGuard';

interface AthleteDialogsProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  editingAthlete: Athlete | null;
  setEditingAthlete: (athlete: Athlete | null) => void;
  formData: AthleteFormData;
  setFormData: (data: AthleteFormData) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  addAthleteMutation: any;
  updateAthleteMutation: any;
}

export const AthleteDialogs: React.FC<AthleteDialogsProps> = ({
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
    <>
      {/* Add Dialog */}
      <AthleteAddGuard>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { resetForm(); setEditingAthlete(null); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Athlete
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Athlete</DialogTitle>
            </DialogHeader>
            <AthleteForm
              formData={formData}
              onFormDataChange={setFormData}
              onSubmit={handleSubmit}
              onCancel={() => setIsAddDialogOpen(false)}
              isSubmitting={addAthleteMutation.isPending}
              isEditing={false}
            />
          </DialogContent>
        </Dialog>
      </AthleteAddGuard>

      {/* Edit Dialog */}
      <Dialog open={!!editingAthlete} onOpenChange={(open) => !open && setEditingAthlete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Athlete</DialogTitle>
          </DialogHeader>
          <AthleteForm
            formData={formData}
            onFormDataChange={setFormData}
            onSubmit={handleSubmit}
            onCancel={() => setEditingAthlete(null)}
            isSubmitting={updateAthleteMutation.isPending}
            isEditing={true}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
