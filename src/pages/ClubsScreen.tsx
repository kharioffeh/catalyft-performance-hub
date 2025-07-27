import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Club {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  created_by: string;
  created_at: string;
}

interface MyClub extends Club {
  joined_at: string;
}

const ClubsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const queryClient = useQueryClient();

  // Fetch all clubs
  const { data: allClubs = [], isLoading: loadingAllClubs } = useQuery({
    queryKey: ['clubs', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('getClubs');
      if (error) throw error;
      return data.clubs as Club[];
    },
    enabled: activeTab === 'all',
  });

  // Fetch my clubs
  const { data: myClubs = [], isLoading: loadingMyClubs } = useQuery({
    queryKey: ['clubs', 'my'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('getMyClubs');
      if (error) throw error;
      return data.clubs as MyClub[];
    },
    enabled: activeTab === 'my',
  });

  // Join club mutation
  const joinClubMutation = useMutation({
    mutationFn: async (clubId: string) => {
      const { data, error } = await supabase.functions.invoke('joinClub', {
        body: { club_id: clubId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });

  // Leave club mutation
  const leaveClubMutation = useMutation({
    mutationFn: async (clubId: string) => {
      const { data, error } = await supabase.functions.invoke('leaveClub', {
        body: { club_id: clubId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] });
    },
  });

  const handleJoinClub = (clubId: string) => {
    joinClubMutation.mutate(clubId);
  };

  const handleLeaveClub = (clubId: string) => {
    leaveClubMutation.mutate(clubId);
  };

  const isClubMember = (clubId: string) => {
    return myClubs.some(club => club.id === clubId);
  };

  const isLoading = activeTab === 'all' ? loadingAllClubs : loadingMyClubs;
  const clubs = activeTab === 'all' ? allClubs : myClubs;

  return (
    <div className="min-h-screen bg-brand-charcoal p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white mb-2">Clubs</h1>
          <p className="text-white/70 text-sm">
            Discover and join fitness communities
          </p>
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-white/10 rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('all')}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl font-medium transition-all',
              activeTab === 'all'
                ? 'bg-brand-blue text-brand-charcoal'
                : 'text-white/70 hover:text-white'
            )}
          >
            All Clubs
          </button>
          <button
            onClick={() => setActiveTab('my')}
            className={cn(
              'flex-1 py-3 px-4 rounded-xl font-medium transition-all',
              activeTab === 'my'
                ? 'bg-brand-blue text-brand-charcoal'
                : 'text-white/70 hover:text-white'
            )}
          >
            My Clubs
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} className="p-4 animate-pulse">
                <div className="h-6 bg-white/20 rounded mb-2"></div>
                <div className="h-4 bg-white/10 rounded mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-white/10 rounded w-20"></div>
                  <div className="h-9 bg-white/10 rounded w-16"></div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}

        {/* Clubs List */}
        {!isLoading && (
          <div className="space-y-4">
            {clubs.length === 0 ? (
              <GlassCard className="p-6 text-center">
                <Users className="w-12 h-12 text-white/50 mx-auto mb-3" />
                <p className="text-white/70">
                  {activeTab === 'all' 
                    ? 'No clubs available' 
                    : "You haven't joined any clubs yet"
                  }
                </p>
              </GlassCard>
            ) : (
              clubs.map((club) => (
                <GlassCard key={club.id} className="p-4">
                  <div className="mb-3">
                    <h3 className="text-white font-semibold text-lg mb-1">
                      {club.name}
                    </h3>
                    <p className="text-white/70 text-sm line-clamp-2">
                      {club.description}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-white/60 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{club.memberCount} members</span>
                    </div>
                    
                    <div className="flex gap-2">
                      {activeTab === 'all' ? (
                        isClubMember(club.id) ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLeaveClub(club.id)}
                            disabled={leaveClubMutation.isPending}
                            className="text-white border-white/30 hover:bg-white/10"
                          >
                            Leave
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleJoinClub(club.id)}
                            disabled={joinClubMutation.isPending}
                            className="bg-brand-blue hover:bg-brand-blue/80"
                          >
                            Join
                          </Button>
                        )
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleLeaveClub(club.id)}
                          disabled={leaveClubMutation.isPending}
                          className="text-white border-white/30 hover:bg-white/10"
                        >
                          Leave
                        </Button>
                      )}
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClubsScreen;