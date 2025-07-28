import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Plus, Target, Calendar, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

interface Program {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  duration_weeks?: number;
  difficulty_level?: string;
  status?: string;
}

export const ProgramsScreen: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, [user]);

  const fetchPrograms = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setPrograms(data || []);
    } catch (err) {
      console.error('Error fetching programs:', err);
      setError('Failed to load programs');
      toast({
        title: "Error",
        description: "Failed to load programs. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProgram = () => {
    navigate('/mobile/program-builder');
  };

  const handleProgramClick = (programId: string) => {
    navigate(`/program/${programId}`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'intermediate':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'advanced':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-brand-charcoal p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <Skeleton className="h-8 w-48 mb-2 bg-white/10" />
              <Skeleton className="h-4 w-32 bg-white/10" />
            </div>
            <Skeleton className="h-10 w-32 bg-white/10" />
          </div>

          {/* Programs Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-white/10" />
                  <Skeleton className="h-4 w-full bg-white/10" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-1/2 bg-white/10" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-16 bg-white/10" />
                      <Skeleton className="h-6 w-20 bg-white/10" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-brand-charcoal p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-400 mb-2 text-lg font-semibold">Error loading programs</div>
            <p className="text-white/60 mb-4">{error}</p>
            <Button onClick={fetchPrograms} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-brand-charcoal p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">My Programs</h1>
            <p className="text-white/70">Manage your training programs</p>
          </div>
          <Button 
            onClick={handleCreateProgram}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Program
          </Button>
        </div>

        {/* Programs Grid */}
        {programs.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-white/40" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">No Programs Yet</h3>
            <p className="text-white/60 mb-6">
              Create your first training program to get started
            </p>
            <Button 
              onClick={handleCreateProgram}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Program
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => (
              <Card 
                key={program.id}
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => handleProgramClick(program.id)}
              >
                <CardHeader>
                  <CardTitle className="text-white text-lg">{program.title}</CardTitle>
                  {program.description && (
                    <CardDescription className="text-white/60">
                      {program.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span>Created {formatDate(program.created_at)}</span>
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {program.duration_weeks && (
                        <Badge variant="outline" className="border-white/20 text-white/80">
                          {program.duration_weeks} weeks
                        </Badge>
                      )}
                      {program.difficulty_level && (
                        <Badge 
                          variant="outline" 
                          className={getDifficultyColor(program.difficulty_level)}
                        >
                          {program.difficulty_level}
                        </Badge>
                      )}
                      {program.status && (
                        <Badge variant="outline" className="border-white/20 text-white/80">
                          {program.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Floating Action Button for mobile */}
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button 
            onClick={handleCreateProgram}
            size="lg"
            className="rounded-full w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
};