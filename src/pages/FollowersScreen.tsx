import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Users, 
  UserPlus, 
  UserCheck, 
  UserX, 
  Star,
  Award,
  Activity,
  Heart,
  MapPin,
  Calendar,
  MoreHorizontal,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Follower {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinDate: string;
  isFollowing: boolean;
  isFollowedBy: boolean;
  mutualFriends: number;
  stats: {
    activities: number;
    distance: number;
    streak: number;
    achievements: number;
    followers: number;
    following: number;
  };
  recentActivity?: {
    type: 'run' | 'ride' | 'swim' | 'workout' | 'hike';
    distance?: number;
    duration?: number;
    date: string;
  };
  badges: string[];
  isVerified: boolean;
  isPremium: boolean;
  lastSeen: string;
}

const FollowersScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'following' | 'not-following'>('all');
  const [followers, setFollowers] = useState<Follower[]>([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState<string | null>(null);

  // Mock data for demo
  useEffect(() => {
    const generateMockFollowers = () => {
      const mockFollowers: Follower[] = Array.from({ length: 24 }, (_, i) => ({
        id: `follower-${i + 1}`,
        name: `Follower ${i + 1}`,
        username: `follower${i + 1}`,
        avatar: undefined,
        bio: Math.random() > 0.3 ? [
          'Passionate runner and fitness enthusiast',
          'Cycling through life, one pedal at a time',
          'Swimming towards my goals',
          'Building strength and endurance',
          'Exploring trails and mountains'
        ][Math.floor(Math.random() * 5)] : undefined,
        location: Math.random() > 0.2 ? [
          'San Francisco, CA',
          'New York, NY',
          'Austin, TX',
          'Seattle, WA',
          'Miami, FL',
          'Denver, CO',
          'Portland, OR',
          'Chicago, IL'
        ][Math.floor(Math.random() * 8)] : undefined,
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        isFollowing: Math.random() > 0.5,
        isFollowedBy: true, // They are following us
        mutualFriends: Math.floor(Math.random() * 15),
        stats: {
          activities: Math.floor(Math.random() * 200) + 10,
          distance: Math.floor(Math.random() * 5000) + 100,
          streak: Math.floor(Math.random() * 30) + 1,
          achievements: Math.floor(Math.random() * 50) + 5,
          followers: Math.floor(Math.random() * 500) + 10,
          following: Math.floor(Math.random() * 300) + 5
        },
        recentActivity: Math.random() > 0.3 ? {
          type: (['run', 'ride', 'swim', 'workout', 'hike'] as const)[Math.floor(Math.random() * 5)],
          distance: Math.random() > 0.5 ? Math.floor(Math.random() * 50) + 5 : undefined,
          duration: Math.floor(Math.random() * 7200) + 1800,
          date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
        } : undefined,
        badges: Math.random() > 0.5 ? [
          'Marathon Finisher',
          '100K Club',
          'Early Bird',
          'Week Warrior',
          'Speed Demon'
        ].slice(0, Math.floor(Math.random() * 3) + 1) : [],
        isVerified: Math.random() > 0.9,
        isPremium: Math.random() > 0.8,
        lastSeen: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString()
      }));

      setFollowers(mockFollowers);
      setLoading(false);
    };

    generateMockFollowers();
  }, []);

  const handleFollowToggle = async (followerId: string, isCurrentlyFollowing: boolean) => {
    setFollowLoading(followerId);
    
    // Simulate API call
    setTimeout(() => {
      setFollowers(prev => prev.map(follower => 
        follower.id === followerId 
          ? { ...follower, isFollowing: !isCurrentlyFollowing }
          : follower
      ));
      setFollowLoading(null);
    }, 500);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'run': return '🏃‍♂️';
      case 'ride': return '🚴‍♂️';
      case 'swim': return '🏊‍♂️';
      case 'workout': return '💪';
      case 'hike': return '🥾';
      default: return '🏃‍♂️';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'run': return 'text-orange-400';
      case 'ride': return 'text-blue-400';
      case 'swim': return 'text-cyan-400';
      case 'workout': return 'text-purple-400';
      case 'hike': return 'text-green-400';
      default: return 'text-orange-400';
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return time.toLocaleDateString();
  };

  const filteredFollowers = followers.filter(follower => {
    if (searchQuery && !follower.name.toLowerCase().includes(searchQuery.toLowerCase()) && !follower.username.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterStatus === 'following' && !follower.isFollowing) {
      return false;
    }
    if (filterStatus === 'not-following' && follower.isFollowing) {
      return false;
    }
    return true;
  });

  const followingCount = followers.filter(f => f.isFollowing).length;
  const totalFollowers = followers.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center text-white/90">Loading followers...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="text-white/70 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-3xl font-bold text-white">Followers</h1>
                  <p className="text-white/60">People who are following you</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="backdrop-blur-md bg-white/5 border border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{totalFollowers}</div>
                <div className="text-white/60">Total Followers</div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-white/5 border border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{followingCount}</div>
                <div className="text-white/60">Mutual Follows</div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-white/5 border border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {followers.filter(f => f.isVerified).length}
                </div>
                <div className="text-white/60">Verified Users</div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Search followers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['all', 'following', 'not-following'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "whitespace-nowrap",
                    filterStatus === status 
                      ? "bg-blue-600 text-white" 
                      : "border-white/20 text-white hover:bg-white/10"
                  )}
                >
                  {status === 'all' ? 'All Followers' : 
                   status === 'following' ? 'Mutual Follows' : 'Not Following Back'}
                </Button>
              ))}
            </div>
          </div>

          {/* Followers List */}
          {filteredFollowers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-xl font-semibold text-white mb-2">No followers found</h2>
              <p className="text-white/60">
                {searchQuery ? 'Try adjusting your search or filters' : 'Start sharing your workouts to gain followers!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredFollowers.map((follower, index) => (
                  <motion.div
                    key={follower.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className="backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          {/* User Info */}
                          <div className="flex items-center space-x-4 flex-1">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={follower.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold text-lg">
                                {follower.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-white font-semibold text-lg">{follower.name}</h3>
                                {follower.isVerified && (
                                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                    ✓
                                  </Badge>
                                )}
                                {follower.isPremium && (
                                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                    <Star className="w-3 h-3" />
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-white/60 text-sm">@{follower.username}</p>
                              
                              {follower.bio && (
                                <p className="text-white/80 text-sm leading-relaxed">{follower.bio}</p>
                              )}
                              
                              {follower.location && (
                                <div className="flex items-center text-white/60 text-sm">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  {follower.location}
                                </div>
                              )}

                              {/* Recent Activity */}
                              {follower.recentActivity && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <span className="text-lg">{getActivityIcon(follower.recentActivity.type)}</span>
                                  <span className={cn("font-medium", getActivityColor(follower.recentActivity.type))}>
                                    {follower.recentActivity.type.charAt(0).toUpperCase() + follower.recentActivity.type.slice(1)}
                                  </span>
                                  {follower.recentActivity.distance && (
                                    <span className="text-white/60">
                                      {follower.recentActivity.distance}km
                                    </span>
                                  )}
                                  <span className="text-white/40">
                                    {formatTimeAgo(follower.recentActivity.date)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stats and Actions */}
                          <div className="flex flex-col items-end space-y-3">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                              <div>
                                <div className="text-white font-bold text-sm">{follower.stats.activities}</div>
                                <div className="text-white/60 text-xs">Activities</div>
                              </div>
                              <div>
                                <div className="text-white font-bold text-sm">{follower.stats.distance}km</div>
                                <div className="text-white/60 text-xs">Distance</div>
                              </div>
                              <div>
                                <div className="text-white font-bold text-sm">{follower.stats.streak}</div>
                                <div className="text-white/60 text-xs">Streak</div>
                              </div>
                            </div>

                            {/* Follow Button */}
                            <Button
                              variant={follower.isFollowing ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleFollowToggle(follower.id, follower.isFollowing)}
                              disabled={followLoading === follower.id}
                              className={cn(
                                "min-w-[100px]",
                                follower.isFollowing 
                                  ? "border-white/20 text-white hover:bg-white/10" 
                                  : "bg-blue-600 hover:bg-blue-700"
                              )}
                            >
                              {followLoading === follower.id ? (
                                "Loading..."
                              ) : follower.isFollowing ? (
                                <>
                                  <UserCheck className="w-4 h-4 mr-2" />
                                  Following
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-4 h-4 mr-2" />
                                  Follow Back
                                </>
                              )}
                            </Button>

                            {/* Mutual Friends */}
                            {follower.mutualFriends > 0 && (
                              <div className="text-center">
                                <p className="text-white/60 text-xs">
                                  {follower.mutualFriends} mutual friend{follower.mutualFriends !== 1 ? 's' : ''}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Badges */}
                        {follower.badges.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex flex-wrap gap-2">
                              {follower.badges.map((badge, i) => (
                                <Badge key={i} variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                  <Award className="w-3 h-3 mr-1" />
                                  {badge}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Last Seen */}
                        <div className="mt-3 text-right">
                          <p className="text-white/40 text-xs">
                            Last seen {formatTimeAgo(follower.lastSeen)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Load More */}
          <div className="mt-8 text-center">
            <Button variant="ghost" className="text-white/70 hover:text-white">
              Load More Followers
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowersScreen;