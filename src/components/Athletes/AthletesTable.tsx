
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2, User } from 'lucide-react';
import { Athlete } from '@/types/athlete';

interface AthletesTableProps {
  athletes: Athlete[];
  isLoading: boolean;
  onEdit: (athlete: Athlete) => void;
  onDelete: (id: string) => void;
}

export const AthletesTable: React.FC<AthletesTableProps> = ({
  athletes,
  isLoading,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const calculateAge = (dob: string | null) => {
    if (!dob) return 'Unknown';
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} years`;
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-500">Loading athletes...</p>
      </div>
    );
  }

  if (athletes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No athletes added yet. Click "Add Athlete" to get started.</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Sex</TableHead>
          <TableHead>Age</TableHead>
          <TableHead>Date of Birth</TableHead>
          <TableHead>WHOOP Status</TableHead>
          <TableHead>Added</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {athletes.map((athlete) => (
          <TableRow key={athlete.id}>
            <TableCell className="font-medium">{athlete.name}</TableCell>
            <TableCell>{athlete.sex || 'Not set'}</TableCell>
            <TableCell>{calculateAge(athlete.dob)}</TableCell>
            <TableCell>{formatDate(athlete.dob)}</TableCell>
            <TableCell>
              <Badge variant="secondary">Not Connected</Badge>
            </TableCell>
            <TableCell>{formatDate(athlete.created_at)}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(athlete)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(athlete.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
