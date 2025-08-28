import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Users, 
  UserMinus, 
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
  ArrowLeft,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Following {
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
  followDate: string;
  activityLevel: 'high' | 'medium' | 'low';
  goals?: string[];
}

const FollowingScreen: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActivity, setFilterActivity] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'mutual' | 'not-mutual'>('all');
  const [following, setFollowing] = useState<Following[]>([]);
  const [loading, setLoading] = useState(true);
  const [unfollowLoading, setUnfollowLoading] = useState<string | null>(null);

  // Mock data for demo
  useEffect(() => {
    const generateMockFollowing = () => {
      const mockFollowing: Following[] = Array.from({ length: 32 }, (_, i) => ({
        id: `following-${i + 1}`,
        name: `Following ${i + 1}`,
        username: `following${i + 1}`,
        avatar: undefined,
        bio: Math.random() > 0.3 ? [
          'Elite marathon runner and coach',
          'Professional cyclist and adventure seeker',
          'Triathlon champion and fitness motivator',
          'Ultra-distance specialist and trail runner',
          'CrossFit athlete and strength trainer',
          'Swimming instructor and open water enthusiast',
          'Mountain biker and outdoor explorer',
          'Yoga instructor and wellness advocate'
        ][Math.floor(Math.random() * 8)] : undefined,
        location: Math.random() > 0.2 ? [
          'Boulder, CO',
          'Portland, OR',
          'Austin, TX',
          'San Diego, CA',
          'Nashville, TN',
          'Denver, CO',
          'Seattle, WA',
          'Miami, FL',
          'New York, NY',
          'Chicago, IL'
        ][Math.floor(Math.random() * 10)] : undefined,
        joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        isFollowing: true, // We are following them
        isFollowedBy: Math.random() > 0.4, // Some follow us back
        mutualFriends: Math.floor(Math.random() * 20),
        stats: {
          activities: Math.floor(Math.random() * 500) + 50,
          distance: Math.floor(Math.random() * 10000) + 500,
          streak: Math.floor(Math.random() * 100) + 10,
          achievements: Math.floor(Math.random() * 100) + 20,
          followers: Math.floor(Math.random() * 2000) + 100,
          following: Math.floor(Math.random() * 800) + 50
        },
        recentActivity: Math.random() > 0.2 ? {
          type: ['run', 'ride', 'swim', 'workout', 'hike'][Math.floor(Math.random() * 5)] as any,
          distance: Math.random() > 0.3 ? Math.floor(Math.random() * 100) + 10 : undefined,
          duration: Math.floor(Math.random() * 14400) + 3600,
          date: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString()
        } : undefined,
        badges: Math.random() > 0.4 ? [
          'Elite Athlete',
          '100 Mile Club',
          'Ironman Finisher',
          'Ultra Runner',
          'Speed Demon',
          'Endurance Master',
          'Trail Blazer',
          'Marathon Legend'
        ].slice(0, Math.floor(Math.random() * 4) + 1) : [],
        isVerified: Math.random() > 0.7,
        isPremium: Math.random() > 0.6,
        lastSeen: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000).toISOString(),
        followDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
        activityLevel: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)] as any,
        goals: Math.random() > 0.5 ? [
          'Complete Ironman',
          'Run 100 miles',
          'Bike across country',
          'Swim English Channel',
          'Climb Everest',
          'Ultra marathon series'
        ].slice(0, Math.floor(Math.random() * 2) + 1) : undefined
      }));

      setFollowing(mockFollowing);
      setLoading(false);
    };

    generateMockFollowing();
  }, []);

  const handleUnfollow = async (followingId: string) => {
    setUnfollowLoading(followingId);
    
    // Simulate API call
    setTimeout(() => {
      setFollowing(prev => prev.filter(f => f.id !== followingId));
      setUnfollowLoading(null);
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

  const getActivityLevelColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  const getActivityLevelIcon = (level: string) => {
    switch (level) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💤';
      default: return '⚡';
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

  const filteredFollowing = following.filter(following => {
    if (searchQuery && !following.name.toLowerCase().includes(searchQuery.toLowerCase()) && !following.username.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterActivity !== 'all' && following.activityLevel !== filterActivity) {
      return false;
    }
    if (filterStatus === 'mutual' && !following.isFollowedBy) {
      return false;
    }
    if (filterStatus === 'not-mutual' && following.isFollowedBy) {
      return false;
    }
    return true;
  });

  const mutualCount = following.filter(f => f.isFollowedBy).length;
  const totalFollowing = following.length;
  const highActivityCount = following.filter(f => f.activityLevel === 'high').length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center text-white/90">Loading following...</div>
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
                  <h1 className="text-3xl font-bold text-white">Following</h1>
                  <p className="text-white/60">People you're following</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="backdrop-blur-md bg-white/5 border border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{totalFollowing}</div>
                <div className="text-white/60">Total Following</div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-white/5 border border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{mutualCount}</div>
                <div className="text-white/60">Mutual Follows</div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-white/5 border border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-orange-400 mb-2">{highActivityCount}</div>
                <div className="text-white/60">High Activity</div>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-md bg-white/5 border border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {following.filter(f => f.isVerified).length}
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
                placeholder="Search following..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['all', 'high', 'medium', 'low'] as const).map((level) => (
                <Button
                  key={level}
                  variant={filterActivity === level ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterActivity(level)}
                  className={cn(
                    "whitespace-nowrap",
                    filterActivity === level 
                      ? "bg-blue-600 text-white" 
                      : "border-white/20 text-white hover:bg-white/10"
                  )}
                >
                  {level === 'all' ? 'All Activity' : 
                   level === 'high' ? '🔥 High' : 
                   level === 'medium' ? '⚡ Medium' : '💤 Low'}
                </Button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['all', 'mutual', 'not-mutual'] as const).map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                  className={cn(
                    "whitespace-nowrap",
                    filterStatus === status 
                      ? "bg-green-600 text-white" 
                      : "border-white/20 text-white hover:bg-white/10"
                  )}
                >
                  {status === 'all' ? 'All Following' : 
                   status === 'mutual' ? '🤝 Mutual' : '➡️ Not Mutual'}
                </Button>
              ))}
            </div>
          </div>

          {/* Following List */}
          {filteredFollowing.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-xl font-semibold text-white mb-2">No following found</h2>
              <p className="text-white/60">
                {searchQuery ? 'Try adjusting your search or filters' : 'Start following athletes to see their activities!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredFollowing.map((following, index) => (
                  <motion.div
                    key={following.id}
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
                              <AvatarImage src={following.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-green-600 to-blue-600 text-white font-semibold text-lg">
                                {following.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-white font-semibold text-lg">{following.name}</h3>
                                {following.isVerified && (
                                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                    ✓
                                  </Badge>
                                )}
                                {following.isPremium && (
                                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                    <Star className="w-3 h-3" />
                                  </Badge>
                                )}
                                {following.isFollowedBy && (
                                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                                    🤝
                                  </Badge>
                                )}
                              </div>
                              
                              <p className="text-white/60 text-sm">@{following.username}</p>
                              
                              {following.bio && (
                                <p className="text-white/80 text-sm leading-relaxed">{following.bio}</p>
                              )}
                              
                              {following.location && (
                                <div className="flex items-center text-white/60 text-sm">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  {following.location}
                                </div>
                              )}

                              {/* Activity Level */}
                              <div className="flex items-center space-x-2 text-sm">
                                <span className="text-lg">{getActivityLevelIcon(following.activityLevel)}</span>
                                <span className={cn("font-medium", getActivityLevelColor(following.activityLevel))}>
                                  {following.activityLevel.charAt(0).toUpperCase() + following.activityLevel.slice(1)} Activity
                                </span>
                              </div>

                              {/* Recent Activity */}
                              {following.recentActivity && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <span className="text-lg">{getActivityIcon(following.recentActivity.type)}</span>
                                  <span className={cn("font-medium", getActivityColor(following.recentActivity.type))}>
                                    {following.recentActivity.type.charAt(0).toUpperCase() + following.recentActivity.type.slice(1)}
                                  </span>
                                  {following.recentActivity.distance && (
                                    <span className="text-white/60">
                                      {following.recentActivity.distance}km
                                    </span>
                                  )}
                                  <span className="text-white/40">
                                    {formatTimeAgo(following.recentActivity.date)}
                                  </span>
                                </div>
                              )}

                              {/* Goals */}
                              {following.goals && following.goals.length > 0 && (
                                <div className="flex items-center space-x-2 text-sm">
                                  <Target className="w-4 h-4 text-purple-400" />
                                  <span className="text-white/60">Goals: </span>
                                  <span className="text-white/80">{following.goals.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Stats and Actions */}
                          <div className="flex flex-col items-end space-y-3">
                            {/* Quick Stats */}
                            <div className="grid grid-cols-3 gap-3 text-center">
                              <div>
                                <div className="text-white font-bold text-sm">{following.stats.activities}</div>
                                <div className="text-white/60 text-xs">Activities</div>
                              </div>
                              <div>
                                <div className="text-white font-bold text-sm">{following.stats.distance}km</div>
                                <div className="text-white/60 text-xs">Distance</div>
                              </div>
                              <div>
                                <div className="text-white font-bold text-sm">{following.stats.streak}</div>
                                <div className="text-white/60 text-xs">Streak</div>
                              </div>
                            </div>

                            {/* Unfollow Button */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnfollow(following.id)}
                              disabled={unfollowLoading === following.id}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10 min-w-[100px]"
                            >
                              {unfollowLoading === following.id ? (
                                "Loading..."
                              ) : (
                                <>
                                  <UserMinus className="w-4 h-4 mr-2" />
                                  Unfollow
                                </>
                              )}
                            </Button>

                            {/* Follow Date */}
                            <div className="text-center">
                              <p className="text-white/60 text-xs">
                                Following since {formatTimeAgo(following.followDate)}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Badges */}
                        {following.badges.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <div className="flex flex-wrap gap-2">
                              {following.badges.map((badge, i) => (
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
                            Last seen {formatTimeAgo(following.lastSeen)}
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
              Load More Following
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowingScreen;