
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, User } from 'lucide-react';
import WhoopIntegration from '@/components/WhoopIntegration';

interface Athlete {
  id: string;
  name: string;
  dob: string | null;
  sex: string | null;
  created_at: string;
}

const Athletes = () => {
  const { user, profile, loading } = useAuth();
  const [athletes, setAthletes] = useState<Athlete[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAthlete, setNewAthlete] = useState({
    name: '',
    dob: '',
    sex: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.role === 'coach') {
      fetchAthletes();
    }
  }, [profile]);

  const fetchAthletes = async () => {
    try {
      const { data, error } = await supabase
        .from('athletes')
        .select('*')
        .order('name');

      if (error) throw error;
      setAthletes(data || []);
    } catch (error) {
      console.error('Error fetching athletes:', error);
      toast({
        title: "Error",
        description: "Failed to load athletes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addAthlete = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: coachData } = await supabase
        .from('coaches')
        .select('id')
        .eq('email', user?.email)
        .single();

      if (!coachData) {
        throw new Error('Coach not found');
      }

      const { error } = await supabase
        .from('athletes')
        .insert({
          name: newAthlete.name,
          dob: newAthlete.dob || null,
          sex: newAthlete.sex || null,
          coach_uuid: coachData.id,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Athlete added successfully.",
      });

      setNewAthlete({ name: '', dob: '', sex: '' });
      setShowAddForm(false);
      fetchAthletes();
    } catch (error) {
      console.error('Error adding athlete:', error);
      toast({
        title: "Error",
        description: "Failed to add athlete.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profile?.role !== 'coach') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">Athletes</h1>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Athlete
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Add New Athlete</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addAthlete} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newAthlete.name}
                    onChange={(e) => setNewAthlete({ ...newAthlete, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={newAthlete.dob}
                    onChange={(e) => setNewAthlete({ ...newAthlete, dob: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="sex">Sex</Label>
                  <select
                    id="sex"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={newAthlete.sex}
                    onChange={(e) => setNewAthlete({ ...newAthlete, sex: e.target.value })}
                  >
                    <option value="">Select...</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Athlete</Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading athletes...</p>
          </div>
        ) : athletes.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No athletes found. Add your first athlete to get started.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {athletes.map((athlete) => (
              <Card key={athlete.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {athlete.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {athlete.dob && (
                    <p className="text-sm text-gray-600">
                      DOB: {new Date(athlete.dob).toLocaleDateString()}
                    </p>
                  )}
                  {athlete.sex && (
                    <p className="text-sm text-gray-600">
                      Sex: {athlete.sex}
                    </p>
                  )}
                  <WhoopIntegration 
                    athleteId={athlete.id} 
                    athleteName={athlete.name}
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Athletes;
