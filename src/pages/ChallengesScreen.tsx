import React, { useState, useEffect } from 'react';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Users, 
  Trophy, 
  Target,
  Search,
  Filter,
  TrendingUp,
  Award,
  Clock,
  MapPin,
  Zap,
  Flame,
  Mountain,
  Heart,
  Star,
  Plus,
  ChevronRight,
  Play,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface Challenge {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  joinCount: number;
  userProgress: number | null;
  isJoined: boolean;
  category: 'distance' | 'streak' | 'social' | 'speed' | 'elevation';
  goal: string;
  reward?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  image?: string;
  color: string;
  icon: string;
}

const ChallengesScreen: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningChallenge, setJoiningChallenge] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'distance' | 'streak' | 'social' | 'speed' | 'elevation'>('all');
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

      // Enhance challenges with mock data for demo
      const enhancedChallenges: Challenge[] = (data?.challenges || []).map((challenge: any) => ({
        ...challenge,
        category: (['distance', 'streak', 'social', 'speed', 'elevation'] as const)[Math.floor(Math.random() * 5)],
        goal: Math.random() > 0.5 ? 'Run 100km this month' : 'Work out 20 days in a row',
        reward: Math.random() > 0.7 ? 'Special Badge' : undefined,
        difficulty: (['easy', 'medium', 'hard'] as const)[Math.floor(Math.random() * 3)],
        color: ['from-blue-600 to-purple-600', 'from-green-600 to-teal-600', 'from-orange-600 to-red-600', 'from-purple-600 to-pink-600'][Math.floor(Math.random() * 4)],
        icon: ['🏃‍♂️', '🔥', '👥', '⚡', '⛰️'][Math.floor(Math.random() * 5)]
      }));

      setChallenges(enhancedChallenges);
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'hard': return 'text-red-400 bg-red-500/20 border-red-500/30';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'distance': return '🏃‍♂️';
      case 'streak': return '🔥';
      case 'social': return '👥';
      case 'speed': return '⚡';
      case 'elevation': return '⛰️';
      default: return '🎯';
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (searchQuery && !challenge.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterCategory !== 'all' && challenge.category !== filterCategory) {
      return false;
    }
    if (activeTab === 'joined' && !challenge.isJoined) {
      return false;
    }
    if (activeTab === 'completed' && challenge.userProgress !== 100) {
      return false;
    }
    return true;
  });

  useEffect(() => {
    fetchChallenges();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto pt-8">
          <div className="text-center text-white/90">Loading challenges...</div>
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
                <h1 className="text-3xl font-bold text-white mb-2">Challenges</h1>
                <p className="text-white/60">Push your limits and compete with friends</p>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Challenge
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Search challenges..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['all', 'distance', 'streak', 'social', 'speed', 'elevation'] as const).map((category) => (
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
              <TabsTrigger value="all" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                All Challenges
              </TabsTrigger>
              <TabsTrigger value="joined" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                My Challenges
              </TabsTrigger>
              <TabsTrigger value="completed" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Challenges Grid */}
          {filteredChallenges.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-xl font-semibold text-white mb-2">No challenges found</h2>
              <p className="text-white/60">
                {searchQuery ? 'Try adjusting your search or filters' : 'Be the first to create a challenge!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredChallenges.map((challenge, index) => {
                  const progress = calculateProgress(challenge);
                  const daysRemaining = getDaysRemaining(challenge.end_date);
                  
                  return (
                    <motion.div
                      key={challenge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <Card className="backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden group hover:border-white/20 transition-all duration-300">
                        {/* Challenge Banner */}
                        <div className={cn(
                          "relative h-32 bg-gradient-to-r overflow-hidden",
                          challenge.color
                        )}>
                          <div className="absolute inset-0 bg-black/20" />
                          <div className="absolute top-4 left-4">
                            <Badge variant="secondary" className={cn("text-xs", getDifficultyColor(challenge.difficulty))}>
                              {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                            </Badge>
                          </div>
                          <div className="absolute top-4 right-4">
                            <span className="text-3xl">{challenge.icon}</span>
                          </div>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-white font-bold text-lg mb-1">{challenge.title}</h3>
                            <p className="text-white/90 text-sm line-clamp-2">{challenge.description}</p>
                          </div>
                        </div>

                        <CardContent className="p-6 space-y-4">
                          {/* Goal and Reward */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 text-white/80 text-sm">
                              <Target className="w-4 h-4" />
                              <span>{challenge.goal}</span>
                            </div>
                            {challenge.reward && (
                              <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                                <Award className="w-4 h-4" />
                                <span>{challenge.reward}</span>
                              </div>
                            )}
                          </div>

                          {/* Dates & Stats */}
                          <div className="flex items-center justify-between text-sm text-white/60">
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{formatDate(challenge.start_date)} - {formatDate(challenge.end_date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Users size={14} />
                              <span>{challenge.joinCount}</span>
                            </div>
                          </div>

                          {/* Progress Section */}
                          {challenge.isJoined ? (
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm">
                                <span className="text-white/70">Your Progress</span>
                                <span className="text-blue-400 font-medium">{progress.toFixed(0)}%</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                              
                              {daysRemaining > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-white/60">Time remaining</span>
                                  <span className="text-orange-400 font-medium">{daysRemaining}d left</span>
                                </div>
                              )}
                            </div>
                          ) : (
                            daysRemaining > 0 && (
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-white/60">Time remaining</span>
                                <span className="text-orange-400 font-medium">{daysRemaining}d left</span>
                              </div>
                            )
                          )}

                          {/* Action Button */}
                          <div className="pt-2">
                            <Button
                              variant={challenge.isJoined ? "outline" : "default"}
                              size="sm"
                              onClick={() => handleJoinChallenge(challenge.id, challenge.isJoined)}
                              disabled={joiningChallenge === challenge.id}
                              className={cn(
                                "w-full",
                                challenge.isJoined 
                                  ? "border-white/20 text-white hover:bg-white/10" 
                                  : "bg-blue-600 hover:bg-blue-700"
                              )}
                            >
                              {joiningChallenge === challenge.id ? (
                                "Loading..."
                              ) : challenge.isJoined ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Joined
                                </>
                              ) : (
                                <>
                                  <Play className="w-4 h-4 mr-2" />
                                  Join Challenge
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Load More Placeholder */}
          <div className="mt-8 text-center">
            <Button variant="ghost" className="text-white/70 hover:text-white">
              Load More Challenges
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesScreen;