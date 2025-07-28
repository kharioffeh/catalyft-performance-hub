import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Play, Edit, Calendar, Clock, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

interface ProgramSession {
  id: string;
  name: string;
  description?: string;
  day: number;
  week: number;
  estimated_duration_minutes?: number;
  exercise_count?: number;
}

export const ProgramScreen: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [program, setProgram] = useState<Program | null>(null);
  const [sessions, setSessions] = useState<ProgramSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchProgram();
    }
  }, [id, user]);

  const fetchProgram = async () => {
    if (!user || !id) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch program details
      const { data: programData, error: programError } = await supabase
        .from('programs')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (programError) {
        throw programError;
      }

      setProgram(programData);

      // Fetch program sessions (simplified - assuming we have a sessions table)
      // This is a placeholder structure - adjust based on your actual database schema
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('program_sessions')
        .select('*')
        .eq('program_id', id)
        .order('week', { ascending: true })
        .order('day', { ascending: true });

      if (sessionsError && sessionsError.code !== 'PGRST116') {
        // Ignore table not found errors for now
        console.warn('Sessions table not found:', sessionsError);
      }

      setSessions(sessionsData || []);
    } catch (err) {
      console.error('Error fetching program:', err);
      setError('Failed to load program');
      toast({
        title: "Error",
        description: "Failed to load program. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/training-plan/programs');
  };

  const handleEdit = () => {
    navigate(`/program/${id}/edit`);
  };

  const handleStartSession = (sessionId: string) => {
    navigate(`/training/session/${sessionId}`);
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
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-8 w-8 bg-white/10 rounded" />
            <div className="flex-1">
              <Skeleton className="h-8 w-64 mb-2 bg-white/10" />
              <Skeleton className="h-4 w-48 bg-white/10" />
            </div>
            <Skeleton className="h-10 w-20 bg-white/10" />
          </div>

          {/* Program Info Skeleton */}
          <Card className="bg-white/5 border-white/10 mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 bg-white/10" />
              <Skeleton className="h-4 w-full bg-white/10" />
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16 bg-white/10" />
                <Skeleton className="h-6 w-20 bg-white/10" />
                <Skeleton className="h-6 w-24 bg-white/10" />
              </div>
            </CardContent>
          </Card>

          {/* Sessions List Skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Skeleton className="h-5 w-48 mb-2 bg-white/10" />
                      <Skeleton className="h-4 w-32 bg-white/10" />
                    </div>
                    <Skeleton className="h-8 w-8 bg-white/10 rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="min-h-screen w-full bg-brand-charcoal p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="text-red-400 mb-2 text-lg font-semibold">
              {error || 'Program not found'}
            </div>
            <p className="text-white/60 mb-4">
              {error || 'The program you are looking for does not exist.'}
            </p>
            <Button onClick={handleBack} variant="outline" className="border-white/20 text-white hover:bg-white/10">
              Back to Programs
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
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="text-white/70 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">{program.title}</h1>
            <p className="text-white/70">Solo Program View</p>
          </div>
          <Button 
            onClick={handleEdit}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        {/* Program Info Card */}
        <Card className="bg-white/5 border-white/10 mb-8">
          <CardHeader>
            <CardTitle className="text-white text-xl">{program.title}</CardTitle>
            {program.description && (
              <p className="text-white/60">{program.description}</p>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap mb-4">
              {program.duration_weeks && (
                <Badge variant="outline" className="border-white/20 text-white/80">
                  <Calendar className="w-3 h-3 mr-1" />
                  {program.duration_weeks} weeks
                </Badge>
              )}
              {program.difficulty_level && (
                <Badge 
                  variant="outline" 
                  className={getDifficultyColor(program.difficulty_level)}
                >
                  <Target className="w-3 h-3 mr-1" />
                  {program.difficulty_level}
                </Badge>
              )}
              {program.status && (
                <Badge variant="outline" className="border-white/20 text-white/80">
                  {program.status}
                </Badge>
              )}
            </div>
            <p className="text-white/60 text-sm">
              Created {formatDate(program.created_at)}
            </p>
          </CardContent>
        </Card>

        {/* Sessions List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Training Sessions</h2>
          
          {sessions.length === 0 ? (
            <Card className="bg-white/5 border-white/10">
              <CardContent className="p-8 text-center">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-white/40" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Sessions Yet</h3>
                <p className="text-white/60">
                  This program doesn't have any training sessions configured yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session) => (
              <Card 
                key={session.id}
                className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-white font-medium mb-1">{session.name}</h3>
                      <div className="flex items-center gap-4 text-white/60 text-sm">
                        <span>Week {session.week}, Day {session.day}</span>
                        {session.estimated_duration_minutes && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {session.estimated_duration_minutes} min
                          </span>
                        )}
                        {session.exercise_count && (
                          <span>{session.exercise_count} exercises</span>
                        )}
                      </div>
                      {session.description && (
                        <p className="text-white/60 text-sm mt-1">{session.description}</p>
                      )}
                    </div>
                    <Button 
                      onClick={() => handleStartSession(session.id)}
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};