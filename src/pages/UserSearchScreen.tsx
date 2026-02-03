import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Users, 
  MapPin, 
  Calendar, 
  Trophy, 
  TrendingUp,
  UserPlus,
  UserCheck,
  UserX,
  Star,
  Award,
  Activity,
  Heart,
  Zap,
  Flame,
  Mountain,
  Plus,
  MoreHorizontal,
  Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface User {
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
}

const UserSearchScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'following' | 'followers' | 'suggestions'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterActivity, setFilterActivity] = useState<'all' | 'run' | 'ride' | 'swim' | 'workout' | 'hike'>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingLoading, setFollowingLoading] = useState<string | null>(null);

  // Mock data for demo
  useEffect(() => {
    const generateMockUsers = () => {
      const mockUsers: User[] = Array.from({ length: 24 }, (_, i) => ({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        username: `user${i + 1}`,
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
        isFollowing: Math.random() > 0.7,
        isFollowedBy: Math.random() > 0.8,
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
        isPremium: Math.random() > 0.8
      }));

      setUsers(mockUsers);
      setLoading(false);
    };

    generateMockUsers();
  }, []);

  const handleFollowToggle = async (userId: string, isCurrentlyFollowing: boolean) => {
    setFollowingLoading(userId);
    
    // Simulate API call
    setTimeout(() => {
      setUsers(prev => prev.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              isFollowing: !isCurrentlyFollowing,
              stats: {
                ...user.stats,
                followers: isCurrentlyFollowing ? user.stats.followers - 1 : user.stats.followers + 1
              }
            }
          : user
      ));
      setFollowingLoading(null);
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

  const filteredUsers = users.filter(user => {
    if (searchQuery && !user.name.toLowerCase().includes(searchQuery.toLowerCase()) && !user.username.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterLocation && user.location && !user.location.toLowerCase().includes(filterLocation.toLowerCase())) {
      return false;
    }
    if (filterActivity !== 'all' && user.recentActivity?.type !== filterActivity) {
      return false;
    }
    if (activeTab === 'following' && !user.isFollowing) {
      return false;
    }
    if (activeTab === 'followers' && !user.isFollowedBy) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center text-white/90">Loading users...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Discover People</h1>
                <p className="text-white/60">Connect with athletes and fitness enthusiasts</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Invite Friends
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/10">
              <TabsTrigger value="all" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                All Users
              </TabsTrigger>
              <TabsTrigger value="following" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Following
              </TabsTrigger>
              <TabsTrigger value="followers" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Followers
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Suggestions
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <Input
                  placeholder="Search by name or username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                <Input
                  placeholder="Filter by location..."
                  value={filterLocation}
                  onChange={(e) => setFilterLocation(e.target.value)}
                  className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              
              <select
                value={filterActivity}
                onChange={(e) => setFilterActivity(e.target.value as typeof filterActivity)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Activities</option>
                <option value="run">🏃‍♂️ Running</option>
                <option value="ride">🚴‍♂️ Cycling</option>
                <option value="swim">🏊‍♂️ Swimming</option>
                <option value="workout">💪 Workout</option>
                <option value="hike">🥾 Hiking</option>
              </select>
            </div>
          </div>

          {/* Users Grid */}
          {filteredUsers.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-xl font-semibold text-white mb-2">No users found</h2>
              <p className="text-white/60">
                {searchQuery ? 'Try adjusting your search or filters' : 'Start following people to see them here!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300">
                      <CardContent className="p-6">
                        {/* User Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-white font-semibold">{user.name}</h3>
                                {user.isVerified && (
                                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                    ✓
                                  </Badge>
                                )}
                                {user.isPremium && (
                                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                    <Star className="w-3 h-3" />
                                  </Badge>
                                )}
                              </div>
                              <p className="text-white/60 text-sm">@{user.username}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white/60 hover:text-white"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Bio and Location */}
                        {user.bio && (
                          <p className="text-white/80 text-sm mb-4 leading-relaxed">{user.bio}</p>
                        )}
                        
                        {user.location && (
                          <div className="flex items-center text-white/60 text-sm mb-4">
                            <MapPin className="w-4 h-4 mr-2" />
                            {user.location}
                          </div>
                        )}

                        {/* Recent Activity */}
                        {user.recentActivity && (
                          <div className="mb-4 p-3 bg-white/5 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{getActivityIcon(user.recentActivity.type)}</span>
                                <span className={cn("text-sm font-medium", getActivityColor(user.recentActivity.type))}>
                                  {user.recentActivity.type.charAt(0).toUpperCase() + user.recentActivity.type.slice(1)}
                                </span>
                              </div>
                              <div className="text-right text-sm">
                                {user.recentActivity.distance && (
                                  <div className="text-white font-medium">{user.recentActivity.distance}km</div>
                                )}
                                <div className="text-white/60">{formatDuration(user.recentActivity.duration)}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="text-center p-2 bg-white/5 rounded">
                            <div className="text-white font-bold text-sm">{user.stats.activities}</div>
                            <div className="text-white/60 text-xs">Activities</div>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <div className="text-white font-bold text-sm">{user.stats.distance}km</div>
                            <div className="text-white/60 text-xs">Distance</div>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <div className="text-white font-bold text-sm">{user.stats.streak}</div>
                            <div className="text-white/60 text-xs">Day Streak</div>
                          </div>
                          <div className="text-center p-2 bg-white/5 rounded">
                            <div className="text-white font-bold text-sm">{user.stats.achievements}</div>
                            <div className="text-white/60 text-xs">Badges</div>
                          </div>
                        </div>

                        {/* Badges */}
                        {user.badges.length > 0 && (
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-1">
                              {user.badges.slice(0, 3).map((badge, i) => (
                                <Badge key={i} variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                  <Award className="w-3 h-3 mr-1" />
                                  {badge}
                                </Badge>
                              ))}
                              {user.badges.length > 3 && (
                                <Badge variant="secondary" className="bg-white/10 text-white/60 border-white/20 text-xs">
                                  +{user.badges.length - 3} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Follow Button and Stats */}
                        <div className="flex items-center justify-between">
                          <Button
                            variant={user.isFollowing ? "outline" : "default"}
                            size="sm"
                            onClick={() => handleFollowToggle(user.id, user.isFollowing)}
                            disabled={followingLoading === user.id}
                            className={cn(
                              "flex-1 mr-3",
                              user.isFollowing 
                                ? "border-white/20 text-white hover:bg-white/10" 
                                : "bg-blue-600 hover:bg-blue-700"
                            )}
                          >
                            {followingLoading === user.id ? (
                              "Loading..."
                            ) : user.isFollowing ? (
                              <>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Follow
                              </>
                            )}
                          </Button>
                          
                          <div className="text-right text-xs">
                            <div className="text-white/60">Followers</div>
                            <div className="text-white font-medium">{user.stats.followers}</div>
                          </div>
                        </div>

                        {/* Mutual Friends */}
                        {user.mutualFriends > 0 && (
                          <div className="mt-3 text-center">
                            <p className="text-white/60 text-xs">
                              {user.mutualFriends} mutual friend{user.mutualFriends !== 1 ? 's' : ''}
                            </p>
                          </div>
                        )}
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
              Load More Users
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSearchScreen;