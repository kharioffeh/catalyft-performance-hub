import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Challenge {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  joinCount: number;
  userProgress: number | null;
  isJoined: boolean;
}

const ChallengesScreen: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningChallenge, setJoiningChallenge] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('getChallenges');
      
      if (error) {
        console.error('Error fetching challenges:', error);
        toast({
          title: "Error",
          description: "Failed to load challenges",
          variant: "destructive"
        });
        return;
      }

      setChallenges(data?.challenges || []);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error", 
        description: "Failed to load challenges",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChallenge = async (challengeId: string, isCurrentlyJoined: boolean) => {
    setJoiningChallenge(challengeId);
    
    try {
      if (isCurrentlyJoined) {
        // For now, we don't have a leave endpoint, so just show a message
        toast({
          title: "Not implemented",
          description: "Leave challenge functionality coming soon",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase.functions.invoke('joinChallenge', {
        body: { challenge_id: challengeId }
      });

      if (error) {
        console.error('Error joining challenge:', error);
        toast({
          title: "Error",
          description: "Failed to join challenge",
          variant: "destructive"
        });
        return;
      }

      // Optimistically update UI
      setChallenges(prev => prev.map(challenge => 
        challenge.id === challengeId 
          ? { 
              ...challenge, 
              isJoined: true, 
              joinCount: challenge.joinCount + 1,
              userProgress: 0
            }
          : challenge
      ));

      toast({
        title: "Success",
        description: "Successfully joined challenge!",
        variant: "default"
      });

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to join challenge", 
        variant: "destructive"
      });
    } finally {
      setJoiningChallenge(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = (challenge: Challenge) => {
    if (!challenge.isJoined || challenge.userProgress === null) return 0;
    
    // For now, assume max progress of 100, but this could be dynamic
    return Math.min(challenge.userProgress, 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  useEffect(() => {
    fetchChallenges();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-cosmic p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center text-white-90">Loading challenges...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cosmic p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="pt-8 pb-6">
          <h1 className="text-2xl font-bold text-white-95 mb-2">Challenges</h1>
          <p className="text-white-70">Join challenges and track your progress</p>
        </div>

        {/* Challenges List */}
        <div className="space-y-4">
          {challenges.map((challenge) => {
            const progress = calculateProgress(challenge);
            const daysRemaining = getDaysRemaining(challenge.end_date);
            
            return (
              <GlassCard key={challenge.id} className="p-4">
                <div className="space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white-95 mb-1">
                        {challenge.title}
                      </h3>
                      <p className="text-sm text-white-70 line-clamp-2">
                        {challenge.description}
                      </p>
                    </div>
                    <div className="ml-3">
                      <Button
                        variant={challenge.isJoined ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleJoinChallenge(challenge.id, challenge.isJoined)}
                        disabled={joiningChallenge === challenge.id}
                        className="min-w-[70px]"
                      >
                        {joiningChallenge === challenge.id ? "..." : challenge.isJoined ? "Joined" : "Join"}
                      </Button>
                    </div>
                  </div>

                  {/* Dates & Stats */}
                  <div className="flex items-center gap-4 text-sm text-white-70">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>{formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{challenge.joinCount}</span>
                    </div>
                    {daysRemaining > 0 && (
                      <div className="flex items-center gap-1 text-brand-blue">
                        <Trophy size={14} />
                        <span>{daysRemaining}d left</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar (only if joined) */}
                  {challenge.isJoined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-white-70">Your Progress</span>
                        <span className="text-brand-blue font-medium">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Load More Placeholder */}
        <div className="mt-6 text-center">
          <Button variant="ghost" className="text-white-70">
            Load More Challenges
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChallengesScreen;