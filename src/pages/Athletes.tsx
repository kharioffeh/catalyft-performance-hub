import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, User } from 'lucide-react';
import AthleteAddGuard from '@/components/AthleteAddGuard';

interface Athlete {
  id: string;
  name: string;
  sex: string | null;
  dob: string | null;
  coach_uuid: string;
  created_at: string;
  updated_at: string;
}

interface AthleteFormData {
  name: string;
  sex: string;
  dob: string;
}

const Athletes: React.FC = () => {
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null);
  const [formData, setFormData] = useState<AthleteFormData>({
    name: '',
    sex: '',
    dob: ''
  });

  // Fetch coach ID for the current user
  const { data: coachData } = useQuery({
    queryKey: ['coach', profile?.id],
    queryFn: async () => {
      if (!profile?.email) throw new Error('No profile email found');
      
      const { data, error } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', profile.email)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.email && profile.role === 'coach'
  });

  // Fetch athletes
  const { data: athletes = [], isLoading } = useQuery({
    queryKey: ['athletes'],
    queryFn: async () => {
      if (!coachData?.id) throw new Error('No coach ID found');
      
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .eq('coach_uuid', coachData.id)
        .order('name');

      if (error) throw error;
      return data as Athlete[];
    },
    enabled: !!coachData?.id && profile?.role === 'coach'
  });

  // Add athlete mutation
  const addAthleteMutation = useMutation({
    mutationFn: async (data: AthleteFormData) => {
      if (!coachData?.id) throw new Error('No coach ID found');

      const { data: result, error } = await supabase
        .from('athletes')
        .insert({
          name: data.name,
          sex: data.sex || null,
          dob: data.dob || null,
          coach_uuid: coachData.id
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Athlete added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add athlete: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Update athlete mutation
  const updateAthleteMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AthleteFormData }) => {
      const { data: result, error } = await supabase
        .from('athletes')
        .update({
          name: data.name,
          sex: data.sex || null,
          dob: data.dob || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      setEditingAthlete(null);
      resetForm();
      toast({
        title: "Success",
        description: "Athlete updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update athlete: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Delete athlete mutation
  const deleteAthleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('athletes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['athletes'] });
      toast({
        title: "Success",
        description: "Athlete deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete athlete: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({ name: '', sex: '', dob: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Athlete name is required",
        variant: "destructive",
      });
      return;
    }

    if (editingAthlete) {
      updateAthleteMutation.mutate({ id: editingAthlete.id, data: formData });
    } else {
      addAthleteMutation.mutate(formData);
    }
  };

  const handleEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete);
    setFormData({
      name: athlete.name,
      sex: athlete.sex || '',
      dob: athlete.dob || ''
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this athlete?')) {
      deleteAthleteMutation.mutate(id);
    }
  };

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
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter athlete name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sex">Sex</Label>
                  <Select value={formData.sex} onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}>
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
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={addAthleteMutation.isPending}>
                    {addAthleteMutation.isPending ? 'Adding...' : 'Add Athlete'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </AthleteAddGuard>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAthlete} onOpenChange={(open) => !open && setEditingAthlete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Athlete</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter athlete name"
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-sex">Sex</Label>
              <Select value={formData.sex} onValueChange={(value) => setFormData(prev => ({ ...prev, sex: value }))}>
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
              <Label htmlFor="edit-dob">Date of Birth</Label>
              <Input
                id="edit-dob"
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={updateAthleteMutation.isPending}>
                {updateAthleteMutation.isPending ? 'Updating...' : 'Update Athlete'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingAthlete(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Your Athletes ({athletes.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Loading athletes...</p>
            </div>
          ) : athletes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No athletes added yet. Click "Add Athlete" to get started.</p>
            </div>
          ) : (
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
                          onClick={() => handleEdit(athlete)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(athlete.id)}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Athletes;
