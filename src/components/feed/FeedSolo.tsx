import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/ui/glass-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, Trophy, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface MyClub {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  joined_at: string;
}

interface MyChallenge {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  joinCount: number;
  userProgress: number | null;
}

interface MyMeet {
  id: string;
  title: string;
  start_ts: string;
  end_ts: string;
  host_name?: string;
  rsvp_counts: {
    total: number;
    yes: number;
    no: number;
    maybe: number;
  };
}

export const FeedSolo: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clubs' | 'challenges' | 'meets'>('clubs');

  // Fetch my clubs
  const { data: myClubs = [], isLoading: loadingClubs } = useQuery({
    queryKey: ['clubs', 'my'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('getMyClubs');
      if (error) throw error;
      return data.clubs as MyClub[];
    },
  });

  // Fetch my challenges
  const { data: myChallenges = [], isLoading: loadingChallenges } = useQuery({
    queryKey: ['challenges', 'my'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('getChallenges');
      if (error) throw error;
      // Filter only joined challenges
      return (data?.challenges || []).filter((challenge: any) => challenge.isJoined) as MyChallenge[];
    },
  });

  // Fetch my meets
  const { data: myMeets = [], isLoading: loadingMeets } = useQuery({
    queryKey: ['meets', 'my'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('getMeets');
      if (error) throw error;
      // For now, show all meets as we don't have a separate "my meets" endpoint
      // In a real implementation, this would filter by user's RSVP status
      return data?.meets || [] as MyMeet[];
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateProgress = (challenge: MyChallenge) => {
    if (challenge.userProgress === null) return 0;
    return Math.min(challenge.userProgress, 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const isLoading = (activeTab === 'clubs' && loadingClubs) || 
                   (activeTab === 'challenges' && loadingChallenges) || 
                   (activeTab === 'meets' && loadingMeets);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Solo</h2>
        <p className="text-white/70">Your personal fitness community</p>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'clubs' | 'challenges' | 'meets')} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white/10">
          <TabsTrigger 
            value="clubs"
            className={cn(
              "data-[state=active]:bg-brand-blue data-[state=active]:text-brand-charcoal",
              "text-white/70 hover:text-white"
            )}
          >
            My Clubs
          </TabsTrigger>
          <TabsTrigger 
            value="challenges"
            className={cn(
              "data-[state=active]:bg-brand-blue data-[state=active]:text-brand-charcoal",
              "text-white/70 hover:text-white"
            )}
          >
            My Challenges
          </TabsTrigger>
          <TabsTrigger 
            value="meets"
            className={cn(
              "data-[state=active]:bg-brand-blue data-[state=active]:text-brand-charcoal",
              "text-white/70 hover:text-white"
            )}
          >
            My Meets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clubs" className="mt-6">
          {loadingClubs ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <GlassCard key={i} className="p-4 animate-pulse">
                  <div className="h-6 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded mb-3"></div>
                  <div className="h-4 bg-white/10 rounded w-20"></div>
                </GlassCard>
              ))}
            </div>
          ) : myClubs.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <Users className="w-12 h-12 text-white/50 mx-auto mb-3" />
              <p className="text-white/70">You haven't joined any clubs yet</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {myClubs.map((club) => (
                <GlassCard key={club.id} className="p-4">
                  <div className="mb-3">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {club.name}
                    </h3>
                    <p className="text-white/70 text-sm line-clamp-2">
                      {club.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-white/60 text-sm">
                    <Users className="w-4 h-4" />
                    <span>{club.memberCount} members</span>
                    <span className="ml-4 text-brand-blue">
                      Joined {formatDate(club.joined_at)}
                    </span>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          {loadingChallenges ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <GlassCard key={i} className="p-4 animate-pulse">
                  <div className="h-6 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded mb-3"></div>
                  <div className="h-2 bg-white/10 rounded w-full"></div>
                </GlassCard>
              ))}
            </div>
          ) : myChallenges.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <Trophy className="w-12 h-12 text-white/50 mx-auto mb-3" />
              <p className="text-white/70">You haven't joined any challenges yet</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {myChallenges.map((challenge) => {
                const progress = calculateProgress(challenge);
                const daysRemaining = getDaysRemaining(challenge.end_date);
                
                return (
                  <GlassCard key={challenge.id} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white mb-1">
                          {challenge.title}
                        </h3>
                        <p className="text-sm text-white/70 line-clamp-2">
                          {challenge.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-white/70">
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

                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/70">Your Progress</span>
                          <span className="text-brand-blue font-medium">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="meets" className="mt-6">
          {loadingMeets ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <GlassCard key={i} className="p-4 animate-pulse">
                  <div className="h-6 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded mb-3"></div>
                  <div className="h-4 bg-white/10 rounded w-32"></div>
                </GlassCard>
              ))}
            </div>
          ) : myMeets.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <Calendar className="w-12 h-12 text-white/50 mx-auto mb-3" />
              <p className="text-white/70">No upcoming meets</p>
            </GlassCard>
          ) : (
            <div className="space-y-4">
              {myMeets.map((meet) => (
                <GlassCard key={meet.id} className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{meet.title}</h3>
                      {meet.host_name && (
                        <p className="text-sm text-white/60">Hosted by {meet.host_name}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-white/70">
                      <Clock className="w-4 h-4" />
                      <span>
                        {format(new Date(meet.start_ts), 'MMM d, yyyy • h:mm a')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-white/60">
                      <div className="flex gap-4">
                        <span>👍 {meet.rsvp_counts.yes} yes</span>
                        <span>❓ {meet.rsvp_counts.maybe} maybe</span>
                        <span>👎 {meet.rsvp_counts.no} no</span>
                      </div>
                      <span>{meet.rsvp_counts.total} total</span>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};