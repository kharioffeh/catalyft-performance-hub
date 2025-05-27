
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AthleteFormData } from '@/types/athlete';

interface AthleteFormProps {
  formData: AthleteFormData;
  onFormDataChange: (data: AthleteFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  isEditing: boolean;
}

export const AthleteForm: React.FC<AthleteFormProps> = ({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  isSubmitting,
  isEditing
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor={isEditing ? "edit-name" : "name"}>Name *</Label>
        <Input
          id={isEditing ? "edit-name" : "name"}
          value={formData.name}
          onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
          placeholder="Enter athlete name"
          required
        />
      </div>
      <div>
        <Label htmlFor={isEditing ? "edit-sex" : "sex"}>Sex</Label>
        <Select 
          value={formData.sex} 
          onValueChange={(value) => onFormDataChange({ ...formData, sex: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select sex" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor={isEditing ? "edit-dob" : "dob"}>Date of Birth</Label>
        <Input
          id={isEditing ? "edit-dob" : "dob"}
          type="date"
          value={formData.dob}
          onChange={(e) => onFormDataChange({ ...formData, dob: e.target.value })}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEditing ? 'Updating...' : 'Adding...') : (isEditing ? 'Update Athlete' : 'Add Athlete')}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
