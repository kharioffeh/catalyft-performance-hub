import React, { useState, useEffect, useCallback } from 'react';
import { FeedCard, FeedPost } from '@/features/feed/FeedCard';
import { FeedSolo } from '@/components/feed/FeedSolo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Flame,
  Trophy,
  Users,
  Filter,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced FeedPost interface for Strava-like experience
interface EnhancedFeedPost extends FeedPost {
  workoutStats?: {
    distance?: number;
    duration?: number;
    calories?: number;
    pace?: string;
    elevation?: number;
    type: 'run' | 'ride' | 'swim' | 'workout' | 'hike';
  };
  location?: string;
  route?: string;
  achievements?: string[];
  kudos?: number;
  comments?: number;
  isLiked?: boolean;
  isFollowing?: boolean;
}

const Feed: React.FC = () => {
  const [posts, setPosts] = useState<EnhancedFeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'feed' | 'solo'>('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'run' | 'ride' | 'swim' | 'workout'>('all');

  const fetchPosts = useCallback(async (loadMore = false) => {
    try {
      if (loadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const queryParams = new URLSearchParams();
      queryParams.append('limit', '50');
      if (loadMore && cursor) {
        queryParams.append('cursor', cursor);
      }

      const { data, error } = await supabase.functions.invoke('getFeed', {
        body: null,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;

      const newPosts = data.posts || [];
      
      // Enhance posts with mock workout data for demo
      const enhancedPosts: EnhancedFeedPost[] = newPosts.map((post: FeedPost) => ({
        ...post,
        workoutStats: {
          distance: Math.floor(Math.random() * 50) + 5,
          duration: Math.floor(Math.random() * 120) + 30,
          calories: Math.floor(Math.random() * 800) + 200,
          pace: `${Math.floor(Math.random() * 8) + 4}:${Math.floor(Math.random() * 59).toString().padStart(2, '0')}`,
          elevation: Math.floor(Math.random() * 500) + 50,
          type: ['run', 'ride', 'swim', 'workout', 'hike'][Math.floor(Math.random() * 5)] as any
        },
        location: ['Central Park, NYC', 'Golden Gate Bridge, SF', 'Lake Michigan, Chicago', 'Mount Rainier, WA'][Math.floor(Math.random() * 4)],
        route: Math.random() > 0.5 ? 'Custom Route' : undefined,
        achievements: Math.random() > 0.7 ? ['Personal Best', 'New Route'] : [],
        kudos: Math.floor(Math.random() * 50) + 5,
        comments: Math.floor(Math.random() * 10),
        isLiked: Math.random() > 0.5,
        isFollowing: Math.random() > 0.3
      }));
      
      if (loadMore) {
        setPosts(prev => [...prev, ...enhancedPosts]);
      } else {
        setPosts(enhancedPosts);
      }

      // Set cursor for next page (last post's created_at)
      if (newPosts.length > 0) {
        setCursor(newPosts[newPosts.length - 1].created_at);
      }

      // Check if we have more posts
      setHasMore(newPosts.length === 50);

    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load posts. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [cursor]);

  // Initial load - only fetch posts when feed tab is active
  useEffect(() => {
    if (activeTab === 'feed') {
      fetchPosts();
    }
  }, [activeTab]);

  // Infinite scroll handler - only for feed tab
  useEffect(() => {
    if (activeTab !== 'feed') return;

    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight * 0.8 &&
        !loadingMore &&
        hasMore
      ) {
        fetchPosts(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchPosts, loadingMore, hasMore, activeTab]);

  const handleReactionUpdate = (postId: string, reactions: { like: number; cheer: number }) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId ? { ...post, reactions } : post
      )
    );
  };

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              kudos: post.isLiked ? post.kudos - 1 : post.kudos + 1
            }
          : post
      )
    );
  };

  const handleFollow = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId 
          ? { ...post, isFollowing: !post.isFollowing }
          : post
      )
    );
  };

  const filteredPosts = posts.filter(post => {
    if (searchQuery && !post.profile.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterType !== 'all' && post.workoutStats?.type !== filterType) {
      return false;
    }
    return true;
  });

  const getWorkoutIcon = (type: string) => {
    switch (type) {
      case 'run': return '🏃‍♂️';
      case 'ride': return '🚴‍♂️';
      case 'swim': return '🏊‍♂️';
      case 'workout': return '💪';
      case 'hike': return '🥾';
      default: return '🏃‍♂️';
    }
  };

  const getWorkoutColor = (type: string) => {
    switch (type) {
      case 'run': return 'text-orange-400';
      case 'ride': return 'text-blue-400';
      case 'swim': return 'text-cyan-400';
      case 'workout': return 'text-purple-400';
      case 'hike': return 'text-green-400';
      default: return 'text-orange-400';
    }
  };

  if (activeTab === 'feed' && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-white mb-8">Activity Feed</h1>
            
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'feed' | 'solo')} className="w-full mb-8">
              <TabsList className="grid w-full grid-cols-2 bg-white/10">
                <TabsTrigger 
                  value="feed"
                  className={cn(
                    "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                    "text-white/70 hover:text-white"
                  )}
                >
                  Social Feed
                </TabsTrigger>
                <TabsTrigger 
                  value="solo"
                  className={cn(
                    "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                    "text-white/70 hover:text-white"
                  )}
                >
                  Solo
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="space-y-6">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 drop-shadow-lg animate-pulse"
                >
                  <div className="flex items-center mb-3">
                    <div className="w-8 h-8 rounded-full bg-white/20 mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-white/20 rounded mb-1"></div>
                      <div className="h-3 bg-white/10 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="h-48 bg-white/10 rounded-xl mb-3"></div>
                  <div className="h-4 bg-white/10 rounded mb-4"></div>
                  <div className="flex gap-3">
                    <div className="h-8 bg-white/10 rounded-full w-16"></div>
                    <div className="h-8 bg-white/10 rounded-full w-16"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Activity Feed</h1>
              <p className="text-white/60">See what your friends are up to</p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'feed' | 'solo')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 mb-6">
              <TabsTrigger 
                value="feed"
                className={cn(
                  "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                  "text-white/70 hover:text-white"
                )}
              >
                Social Feed
              </TabsTrigger>
              <TabsTrigger 
                value="solo"
                className={cn(
                  "data-[state=active]:bg-blue-600 data-[state=active]:text-white",
                  "text-white/70 hover:text-white"
                )}
              >
                Solo
              </TabsTrigger>
            </TabsList>

            <TabsContent value="feed" className="mt-0">
              {/* Search and Filter Bar */}
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <Input
                    placeholder="Search friends and activities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {(['all', 'run', 'ride', 'swim', 'workout'] as const).map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterType(type)}
                      className={cn(
                        "whitespace-nowrap",
                        filterType === type 
                          ? "bg-blue-600 text-white" 
                          : "border-white/20 text-white hover:bg-white/10"
                      )}
                    >
                      {type === 'all' ? 'All' : getWorkoutIcon(type) + ' ' + type.charAt(0).toUpperCase() + type.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              {filteredPosts.length === 0 ? (
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <h2 className="text-xl font-semibold text-white mb-2">No activities found</h2>
                  <p className="text-white/60">
                    {searchQuery ? 'Try adjusting your search or filters' : 'Be the first to share your workout!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <AnimatePresence>
                    {filteredPosts.map((post, index) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden">
                          {/* Header */}
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarImage src={post.profile.avatar} />
                                  <AvatarFallback className="bg-blue-600 text-white">
                                    {post.profile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-white font-semibold">{post.profile.name}</p>
                                  <p className="text-white/60 text-sm">
                                    {new Date(post.created_at).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {post.achievements?.map((achievement, i) => (
                                  <Badge key={i} variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                    <Trophy className="w-3 h-3 mr-1" />
                                    {achievement}
                                  </Badge>
                                ))}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFollow(post.id)}
                                  className={cn(
                                    "text-xs",
                                    post.isFollowing 
                                      ? "text-blue-400 hover:text-blue-300" 
                                      : "text-white/60 hover:text-white"
                                  )}
                                >
                                  {post.isFollowing ? 'Following' : 'Follow'}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>

                          {/* Workout Stats Banner */}
                          {post.workoutStats && (
                            <div className="px-6 pb-4">
                              <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-white/10">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-2xl">{getWorkoutIcon(post.workoutStats.type)}</span>
                                    <span className={cn("font-semibold text-white", getWorkoutColor(post.workoutStats.type))}>
                                      {post.workoutStats.type.charAt(0).toUpperCase() + post.workoutStats.type.slice(1)}
                                    </span>
                                  </div>
                                  {post.location && (
                                    <div className="flex items-center text-white/60 text-sm">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      {post.location}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <div className="text-white font-bold text-lg">
                                      {post.workoutStats.distance}km
                                    </div>
                                    <div className="text-white/60 text-xs">Distance</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-white font-bold text-lg">
                                      {Math.floor(post.workoutStats.duration / 60)}m {post.workoutStats.duration % 60}s
                                    </div>
                                    <div className="text-white/60 text-xs">Duration</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-white font-bold text-lg">
                                      {post.workoutStats.calories}
                                    </div>
                                    <div className="text-white/60 text-xs">Calories</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-white font-bold text-lg">
                                      {post.workoutStats.pace}
                                    </div>
                                    <div className="text-white/60 text-xs">Pace</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Media */}
                          {post.media_url && (
                            <div className="px-6 pb-4">
                              <div className="rounded-xl overflow-hidden">
                                {post.media_url.includes('video') || post.media_url.endsWith('.mp4') || post.media_url.endsWith('.mov') ? (
                                  <video 
                                    src={post.media_url}
                                    className="w-full max-h-[300px] object-cover"
                                    controls
                                    preload="metadata"
                                  />
                                ) : (
                                  <img 
                                    src={post.media_url}
                                    alt="Post media"
                                    className="w-full max-h-[300px] object-cover"
                                  />
                                )}
                              </div>
                            </div>
                          )}

                          {/* Caption */}
                          {post.caption && (
                            <div className="px-6 pb-4">
                              <p className="text-white/90 text-sm leading-relaxed">
                                {post.caption}
                              </p>
                            </div>
                          )}

                          {/* Action Bar */}
                          <CardContent className="pt-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleLike(post.id)}
                                  className={cn(
                                    "flex items-center space-x-2",
                                    post.isLiked 
                                      ? "text-red-400 hover:text-red-300" 
                                      : "text-white/60 hover:text-white"
                                  )}
                                >
                                  <Heart className={cn("w-5 h-5", post.isLiked && "fill-current")} />
                                  <span>{post.kudos}</span>
                                </Button>
                                
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-white/60 hover:text-white flex items-center space-x-2"
                                >
                                  <MessageCircle className="w-5 h-5" />
                                  <span>{post.comments}</span>
                                </Button>
                              </div>
                              
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/60 hover:text-white"
                              >
                                <Share2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {loadingMore && (
                    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 drop-shadow-lg animate-pulse">
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full bg-white/20 mr-3"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-white/20 rounded mb-1"></div>
                          <div className="h-3 bg-white/10 rounded w-20"></div>
                        </div>
                      </div>
                      <div className="h-32 bg-white/10 rounded-xl mb-3"></div>
                      <div className="h-4 bg-white/10 rounded mb-4"></div>
                      <div className="flex gap-3">
                        <div className="h-8 bg-white/10 rounded-full w-16"></div>
                        <div className="h-8 bg-white/10 rounded-full w-16"></div>
                      </div>
                    </div>
                  )}

                  {!hasMore && filteredPosts.length > 0 && (
                    <div className="text-center py-8">
                      <p className="text-white/60">You've reached the end of the feed!</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="solo" className="mt-0">
              <FeedSolo />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Feed;