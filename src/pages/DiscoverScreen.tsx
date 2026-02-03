import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  TrendingUp, 
  MapPin, 
  Clock, 
  Flame,
  Trophy,
  Users,
  Star,
  Heart,
  Share2,
  Map,
  Route,
  Calendar,
  Award,
  Zap,
  Mountain,
  Filter,
  Compass,
  TrendingDown,
  Eye,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TrendingPost {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar?: string;
    verified: boolean;
    premium: boolean;
  };
  stats: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  type: 'route' | 'workout' | 'achievement' | 'challenge';
  category: 'running' | 'cycling' | 'swimming' | 'workout' | 'hiking';
  image?: string;
  location?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  trending: 'up' | 'down' | 'stable';
  isBookmarked: boolean;
}

interface PopularRoute {
  id: string;
  name: string;
  description: string;
  distance: number;
  elevation: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: 'running' | 'cycling' | 'hiking';
  location: string;
  rating: number;
  reviewCount: number;
  completionCount: number;
  image?: string;
  tags: string[];
  isBookmarked: boolean;
}

interface TrendingChallenge {
  id: string;
  name: string;
  description: string;
  participants: number;
  daysLeft: number;
  category: 'distance' | 'streak' | 'social' | 'speed';
  difficulty: 'easy' | 'medium' | 'hard';
  reward?: string;
  image?: string;
  isJoined: boolean;
}

const DiscoverScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trending' | 'routes' | 'challenges'>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'running' | 'cycling' | 'swimming' | 'workout' | 'hiking'>('all');
  const [trendingPosts, setTrendingPosts] = useState<TrendingPost[]>([]);
  const [popularRoutes, setPopularRoutes] = useState<PopularRoute[]>([]);
  const [trendingChallenges, setTrendingChallenges] = useState<TrendingChallenge[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demo
  useEffect(() => {
    const generateMockData = () => {
      // Generate trending posts
      const mockTrendingPosts: TrendingPost[] = Array.from({ length: 12 }, (_, i) => ({
        id: `post-${i + 1}`,
        title: [
          'Amazing Morning Run in Central Park',
          'New Personal Best on the Golden Gate Bridge Route',
          'Epic Mountain Biking Adventure in Marin',
          'Swimming with Dolphins in Hawaii',
          'Intense HIIT Workout Routine',
          'Scenic Hiking Trail in Yosemite'
        ][i % 6],
        description: [
          'Just discovered this incredible route that takes you through the heart of Central Park with stunning views of the city skyline.',
          'Managed to shave off 2 minutes from my previous best time on this iconic route. The weather was perfect!',
          'Tackled some of the most challenging trails in Marin County. The views were absolutely worth the effort.',
          'Swam alongside dolphins in crystal clear waters. This was a once-in-a-lifetime experience!',
          'This 30-minute HIIT routine will push your limits and help you build strength and endurance.',
          'Hiked through some of the most beautiful landscapes I\'ve ever seen. Nature at its finest!'
        ][i % 6],
        author: {
          name: `User ${i + 1}`,
          avatar: undefined,
          verified: Math.random() > 0.7,
          premium: Math.random() > 0.8
        },
        stats: {
          views: Math.floor(Math.random() * 10000) + 1000,
          likes: Math.floor(Math.random() * 500) + 50,
          shares: Math.floor(Math.random() * 100) + 10,
          comments: Math.floor(Math.random() * 200) + 20
        },
        type: (['route', 'workout', 'achievement', 'challenge'] as const)[Math.floor(Math.random() * 4)],
        category: (['running', 'cycling', 'swimming', 'workout', 'hiking'] as const)[Math.floor(Math.random() * 5)],
        image: undefined,
        location: [
          'Central Park, NYC',
          'Golden Gate Bridge, SF',
          'Marin County, CA',
          'Hawaii',
          'Home Gym',
          'Yosemite National Park'
        ][i % 6],
        difficulty: (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)],
        trending: Math.random() > 0.5 ? (Math.random() > 0.5 ? 'up' : 'down') : 'stable',
        isBookmarked: Math.random() > 0.7
      }));

      // Generate popular routes
      const mockPopularRoutes: PopularRoute[] = Array.from({ length: 8 }, (_, i) => ({
        id: `route-${i + 1}`,
        name: [
          'Central Park Loop',
          'Golden Gate Bridge Run',
          'Marin Headlands Trail',
          'Lake Michigan Shoreline',
          'Rocky Mountain Path',
          'Pacific Coast Highway',
          'Appalachian Trail Section',
          'Desert Canyon Route'
        ][i],
        description: [
          'A scenic 10K loop through the heart of Manhattan\'s most famous park.',
          'Iconic route across the Golden Gate Bridge with stunning bay views.',
          'Challenging mountain biking trails with panoramic ocean vistas.',
          'Peaceful running path along the beautiful Lake Michigan shoreline.',
          'High-altitude hiking trail with breathtaking mountain views.',
          'Coastal route with endless ocean views and fresh sea air.',
          'Historic trail section through dense forests and rolling hills.',
          'Desert landscape route with unique rock formations and cacti.'
        ][i],
        distance: [6.2, 8.5, 15.3, 12.1, 18.7, 22.4, 9.8, 14.2][i],
        elevation: [45, 125, 450, 89, 1200, 234, 567, 890][i],
        difficulty: (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)],
        category: (['running', 'cycling', 'hiking'] as const)[Math.floor(Math.random() * 3)],
        location: [
          'New York, NY',
          'San Francisco, CA',
          'Marin County, CA',
          'Chicago, IL',
          'Denver, CO',
          'Los Angeles, CA',
          'Virginia',
          'Arizona'
        ][i],
        rating: Math.floor(Math.random() * 20 + 80) / 10,
        reviewCount: Math.floor(Math.random() * 500) + 50,
        completionCount: Math.floor(Math.random() * 2000) + 200,
        image: undefined,
        tags: [
          ['scenic', 'urban', 'popular'],
          ['iconic', 'coastal', 'challenging'],
          ['mountain', 'trail', 'advanced'],
          ['lakeside', 'flat', 'peaceful'],
          ['mountain', 'high-altitude', 'challenging'],
          ['coastal', 'long-distance', 'scenic'],
          ['forest', 'historic', 'moderate'],
          ['desert', 'unique', 'challenging']
        ][i],
        isBookmarked: Math.random() > 0.6
      }));

      // Generate trending challenges
      const mockTrendingChallenges: TrendingChallenge[] = Array.from({ length: 6 }, (_, i) => ({
        id: `challenge-${i + 1}`,
        name: [
          '100K in 30 Days',
          '7-Day Streak Challenge',
          'Speed Demon Sprint',
          'Social Butterfly',
          'Mountain Goat',
          'Early Bird Special'
        ][i],
        description: [
          'Run, cycle, or swim 100 kilometers in 30 days. Perfect for building endurance!',
          'Complete a workout every day for 7 consecutive days. Consistency is key!',
          'Improve your 5K time by 10% in 2 weeks. Push your limits!',
          'Join 5 group activities and make new fitness friends.',
          'Climb a total of 10,000 feet in elevation this month.',
          'Complete 5 workouts before 6 AM. Rise and shine!'
        ][i],
        participants: Math.floor(Math.random() * 5000) + 500,
        daysLeft: Math.floor(Math.random() * 30) + 1,
        category: (['distance', 'streak', 'speed', 'social'] as const)[Math.floor(Math.random() * 4)],
        difficulty: (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)],
        reward: Math.random() > 0.5 ? 'Special Badge' : undefined,
        image: undefined,
        isJoined: Math.random() > 0.7
      }));

      setTrendingPosts(mockTrendingPosts);
      setPopularRoutes(mockPopularRoutes);
      setTrendingChallenges(mockTrendingChallenges);
      setLoading(false);
    };

    generateMockData();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'running': return '🏃‍♂️';
      case 'cycling': return '🚴‍♂️';
      case 'swimming': return '🏊‍♂️';
      case 'workout': return '💪';
      case 'hiking': return '🥾';
      default: return '🎯';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'running': return 'text-orange-400';
      case 'cycling': return 'text-blue-400';
      case 'swimming': return 'text-cyan-400';
      case 'workout': return 'text-purple-400';
      case 'hiking': return 'text-green-400';
      default: return 'text-white';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'hard': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getTrendingIcon = (trending: string) => {
    switch (trending) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-400" />;
      case 'stable': return <TrendingUp className="w-4 h-4 text-blue-400" />;
      default: return null;
    }
  };

  const filteredTrendingPosts = trendingPosts.filter(post => {
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase()) && !post.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterCategory !== 'all' && post.category !== filterCategory) {
      return false;
    }
    return true;
  });

  const filteredRoutes = popularRoutes.filter(route => {
    if (searchQuery && !route.name.toLowerCase().includes(searchQuery.toLowerCase()) && !route.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterCategory !== 'all' && route.category !== filterCategory) {
      return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center text-white/90">Loading discover content...</div>
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
                <h1 className="text-3xl font-bold text-white mb-2">Discover</h1>
                <p className="text-white/60">Explore trending content, popular routes, and new challenges</p>
              </div>
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <Compass className="w-4 h-4 mr-2" />
                Explore
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Search for routes, workouts, or challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['all', 'running', 'cycling', 'swimming', 'workout', 'hiking'] as const).map((category) => (
                <Button
                  key={category}
                  variant={filterCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterCategory(category)}
                  className={cn(
                    "whitespace-nowrap",
                    filterCategory === category 
                      ? "bg-blue-600 text-white" 
                      : "border-white/20 text-white hover:bg-white/10"
                  )}
                >
                  {category === 'all' ? 'All' : getCategoryIcon(category) + ' ' + category.charAt(0).toUpperCase() + category.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/10">
              <TabsTrigger value="trending" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trending
              </TabsTrigger>
              <TabsTrigger value="routes" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Route className="w-4 h-4 mr-2" />
                Popular Routes
              </TabsTrigger>
              <TabsTrigger value="challenges" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                <Trophy className="w-4 h-4 mr-2" />
                Challenges
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Trending Tab */}
          <TabsContent value="trending" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredTrendingPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300">
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={post.author.avatar} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                                {post.author.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-white font-semibold text-sm">{post.author.name}</span>
                                {post.author.verified && (
                                  <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                    ✓
                                  </Badge>
                                )}
                                {post.author.premium && (
                                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                    <Star className="w-3 h-3" />
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center text-white/60 text-xs">
                                {getTrendingIcon(post.trending)}
                                <span className="ml-1">Trending</span>
                              </div>
                            </div>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "text-white/60 hover:text-white",
                              post.isBookmarked && "text-yellow-400"
                            )}
                          >
                            <Bookmark className={cn("w-4 h-4", post.isBookmarked && "fill-current")} />
                          </Button>
                        </div>

                        {/* Content */}
                        <div className="space-y-3">
                          <h3 className="text-white font-semibold text-lg leading-tight">
                            {post.title}
                          </h3>
                          
                          <p className="text-white/80 text-sm leading-relaxed line-clamp-3">
                            {post.description}
                          </p>
                          
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className={cn("text-xs", getCategoryColor(post.category))}>
                              {getCategoryIcon(post.category)} {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
                            </Badge>
                            <Badge variant="secondary" className={cn("text-xs", getDifficultyColor(post.difficulty))}>
                              {post.difficulty.charAt(0).toUpperCase() + post.difficulty.slice(1)}
                            </Badge>
                          </div>
                          
                          {post.location && (
                            <div className="flex items-center text-white/60 text-sm">
                              <MapPin className="w-4 h-4 mr-2" />
                              {post.location}
                            </div>
                          )}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                          <div className="flex items-center space-x-4 text-sm text-white/60">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{post.stats.views.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Heart className="w-4 h-4" />
                              <span>{post.stats.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Share2 className="w-4 h-4" />
                              <span>{post.stats.shares}</span>
                            </div>
                          </div>
                          
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Routes Tab */}
          <TabsContent value="routes" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence>
                {filteredRoutes.map((route, index) => (
                  <motion.div
                    key={route.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-xl mb-2">{route.name}</h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-3">
                              {route.description}
                            </p>
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "text-white/60 hover:text-white",
                              route.isBookmarked && "text-yellow-400"
                            )}
                          >
                            <Bookmark className={cn("w-4 h-4", route.isBookmarked && "fill-current")} />
                          </Button>
                        </div>

                        {/* Route Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-white font-bold text-lg">{route.distance}km</div>
                            <div className="text-white/60 text-xs">Distance</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-bold text-lg">{route.elevation}m</div>
                            <div className="text-white/60 text-xs">Elevation</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-bold text-lg">{route.rating}</div>
                            <div className="text-white/60 text-xs">Rating</div>
                          </div>
                        </div>

                        {/* Tags and Location */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {route.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="bg-white/10 text-white/80 border-white/20 text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-white/60 text-sm">
                              <MapPin className="w-4 h-4 mr-2" />
                              {route.location}
                            </div>
                            <Badge variant="secondary" className={cn("text-xs", getDifficultyColor(route.difficulty))}>
                              {route.difficulty.charAt(0).toUpperCase() + route.difficulty.slice(1)}
                            </Badge>
                          </div>
                        </div>

                        {/* Action */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                          <div className="text-white/60 text-sm">
                            {route.completionCount.toLocaleString()} completions
                          </div>
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            View Route
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          {/* Challenges Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {trendingChallenges.map((challenge, index) => (
                  <motion.div
                    key={challenge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className="backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="text-center mb-4">
                          <div className="text-4xl mb-2">🏆</div>
                          <h3 className="text-white font-semibold text-lg mb-2">{challenge.name}</h3>
                          <p className="text-white/80 text-sm leading-relaxed">
                            {challenge.description}
                          </p>
                        </div>

                        {/* Challenge Stats */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <div className="text-white font-bold text-lg">{challenge.participants.toLocaleString()}</div>
                            <div className="text-white/60 text-xs">Participants</div>
                          </div>
                          <div className="text-center">
                            <div className="text-white font-bold text-lg">{challenge.daysLeft}</div>
                            <div className="text-white/60 text-xs">Days Left</div>
                          </div>
                        </div>

                        {/* Challenge Info */}
                        <div className="space-y-3 mb-4">
                          <div className="flex items-center justify-between">
                            <Badge variant="secondary" className={cn("text-xs", getCategoryColor(challenge.category))}>
                              {getCategoryIcon(challenge.category)} {challenge.category.charAt(0).toUpperCase() + challenge.category.slice(1)}
                            </Badge>
                            <Badge variant="secondary" className={cn("text-xs", getDifficultyColor(challenge.difficulty))}>
                              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                            </Badge>
                          </div>
                          
                          {challenge.reward && (
                            <div className="text-center">
                              <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                                <Award className="w-3 h-3 mr-1" />
                                {challenge.reward}
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Action */}
                        <Button
                          variant={challenge.isJoined ? "outline" : "default"}
                          className={cn(
                            "w-full",
                            challenge.isJoined 
                              ? "border-white/20 text-white hover:bg-white/10" 
                              : "bg-blue-600 hover:bg-blue-700"
                          )}
                        >
                          {challenge.isJoined ? 'Joined' : 'Join Challenge'}
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>
        </div>
      </div>
    </div>
  );
};

export default DiscoverScreen;