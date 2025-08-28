import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Award, 
  Star, 
  Search, 
  Filter, 
  Target, 
  TrendingUp,
  Zap,
  Flame,
  Mountain,
  Heart,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  Lock,
  Unlock,
  Crown,
  Medal,
  Gift,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'distance' | 'speed' | 'streak' | 'social' | 'challenge' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedDate?: string;
  reward?: string;
  xpReward: number;
  isSecret?: boolean;
  color: string;
  gradient: string;
}

const AchievementsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked' | 'recent'>('all');
  const [filterCategory, setFilterCategory] = useState<'all' | 'distance' | 'speed' | 'streak' | 'social' | 'challenge' | 'special'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demo
  useEffect(() => {
    const generateMockAchievements = () => {
      const mockAchievements: Achievement[] = [
        // Distance Achievements
        {
          id: '1',
          name: 'First Steps',
          description: 'Complete your first 5K run',
          icon: '🏃‍♂️',
          category: 'distance',
          rarity: 'common',
          unlocked: true,
          progress: 5,
          maxProgress: 5,
          unlockedDate: '2024-01-15',
          reward: '5K Runner Badge',
          xpReward: 100,
          color: 'text-blue-400',
          gradient: 'from-blue-500 to-cyan-500'
        },
        {
          id: '2',
          name: 'Marathon Dreamer',
          description: 'Run a total of 42.2km',
          icon: '🏃‍♂️',
          category: 'distance',
          rarity: 'rare',
          unlocked: false,
          progress: 28.5,
          maxProgress: 42.2,
          reward: 'Marathon Badge',
          xpReward: 500,
          color: 'text-blue-400',
          gradient: 'from-blue-500 to-cyan-500'
        },
        {
          id: '3',
          name: 'Century Rider',
          description: 'Complete a 100km bike ride',
          icon: '🚴‍♂️',
          category: 'distance',
          rarity: 'epic',
          unlocked: false,
          progress: 0,
          maxProgress: 100,
          reward: 'Century Badge',
          xpReward: 1000,
          color: 'text-blue-400',
          gradient: 'from-blue-500 to-cyan-500'
        },

        // Speed Achievements
        {
          id: '4',
          name: 'Speed Demon',
          description: 'Run 5K in under 20 minutes',
          icon: '⚡',
          category: 'speed',
          rarity: 'rare',
          unlocked: true,
          progress: 20,
          maxProgress: 20,
          unlockedDate: '2024-01-20',
          reward: 'Speed Badge',
          xpReward: 300,
          color: 'text-yellow-400',
          gradient: 'from-yellow-500 to-orange-500'
        },
        {
          id: '5',
          name: 'Sub-4 Marathon',
          description: 'Complete a marathon in under 4 hours',
          icon: '⚡',
          category: 'speed',
          rarity: 'legendary',
          unlocked: false,
          progress: 0,
          maxProgress: 4,
          reward: 'Elite Runner Badge',
          xpReward: 2000,
          color: 'text-yellow-400',
          gradient: 'from-yellow-500 to-orange-500'
        },

        // Streak Achievements
        {
          id: '6',
          name: 'Week Warrior',
          description: 'Work out 7 days in a row',
          icon: '🔥',
          category: 'streak',
          rarity: 'common',
          unlocked: true,
          progress: 7,
          maxProgress: 7,
          unlockedDate: '2024-01-25',
          reward: 'Streak Badge',
          xpReward: 150,
          color: 'text-orange-400',
          gradient: 'from-orange-500 to-red-500'
        },
        {
          id: '7',
          name: 'Month Master',
          description: 'Work out 30 days in a row',
          icon: '🔥',
          category: 'streak',
          rarity: 'epic',
          unlocked: false,
          progress: 12,
          maxProgress: 30,
          reward: 'Consistency Badge',
          xpReward: 800,
          color: 'text-orange-400',
          gradient: 'from-orange-500 to-red-500'
        },

        // Social Achievements
        {
          id: '8',
          name: 'Social Butterfly',
          description: 'Join 5 group activities',
          icon: '👥',
          category: 'social',
          rarity: 'common',
          unlocked: false,
          progress: 3,
          maxProgress: 5,
          reward: 'Social Badge',
          xpReward: 200,
          color: 'text-green-400',
          gradient: 'from-green-500 to-teal-500'
        },
        {
          id: '9',
          name: 'Community Leader',
          description: 'Organize 3 group events',
          icon: '👥',
          category: 'social',
          rarity: 'rare',
          unlocked: false,
          progress: 1,
          maxProgress: 3,
          reward: 'Leader Badge',
          xpReward: 400,
          color: 'text-green-400',
          gradient: 'from-green-500 to-teal-500'
        },

        // Challenge Achievements
        {
          id: '10',
          name: 'Challenge Champion',
          description: 'Win 3 monthly challenges',
          icon: '🏆',
          category: 'challenge',
          rarity: 'epic',
          unlocked: false,
          progress: 1,
          maxProgress: 3,
          reward: 'Champion Badge',
          xpReward: 1200,
          color: 'text-purple-400',
          gradient: 'from-purple-500 to-pink-500'
        },

        // Special Achievements
        {
          id: '11',
          name: 'Early Bird',
          description: 'Complete 5 workouts before 6 AM',
          icon: '🌅',
          category: 'special',
          rarity: 'rare',
          unlocked: true,
          progress: 5,
          maxProgress: 5,
          unlockedDate: '2024-01-30',
          reward: 'Early Bird Badge',
          xpReward: 250,
          color: 'text-pink-400',
          gradient: 'from-pink-500 to-rose-500'
        },
        {
          id: '12',
          name: 'Mountain Goat',
          description: 'Climb 10,000 feet in elevation',
          icon: '⛰️',
          category: 'special',
          rarity: 'legendary',
          unlocked: false,
          progress: 0,
          maxProgress: 10000,
          reward: 'Mountain Badge',
          xpReward: 1500,
          color: 'text-pink-400',
          gradient: 'from-pink-500 to-rose-500'
        }
      ];

      setAchievements(mockAchievements);
      setLoading(false);
    };

    generateMockAchievements();
  }, []);

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-400';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-white';
    }
  };

  const getRarityBadgeColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      case 'rare': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'epic': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'legendary': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'distance': return '🏃‍♂️';
      case 'speed': return '⚡';
      case 'streak': return '🔥';
      case 'social': return '👥';
      case 'challenge': return '🏆';
      case 'special': return '⭐';
      default: return '🎯';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'distance': return 'text-blue-400';
      case 'speed': return 'text-yellow-400';
      case 'streak': return 'text-orange-400';
      case 'social': return 'text-green-400';
      case 'challenge': return 'text-purple-400';
      case 'special': return 'text-pink-400';
      default: return 'text-white';
    }
  };

  const filteredAchievements = achievements.filter(achievement => {
    if (searchQuery && !achievement.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (filterCategory !== 'all' && achievement.category !== filterCategory) {
      return false;
    }
    if (activeTab === 'unlocked' && !achievement.unlocked) {
      return false;
    }
    if (activeTab === 'locked' && achievement.unlocked) {
      return false;
    }
    if (activeTab === 'recent' && (!achievement.unlocked || !achievement.unlockedDate)) {
      return false;
    }
    return true;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const totalXP = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xpReward, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center text-white/90">Loading achievements...</div>
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
                <h1 className="text-3xl font-bold text-white mb-2">Achievements</h1>
                <p className="text-white/60">Unlock badges and track your progress</p>
              </div>
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <Gift className="w-4 h-4 mr-2" />
                View Rewards
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="backdrop-blur-md bg-white/5 border border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{unlockedCount}/{totalCount}</div>
                <div className="text-white/60">Achievements Unlocked</div>
                <Progress value={(unlockedCount / totalCount) * 100} className="mt-3" />
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-white/5 border border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{totalXP}</div>
                <div className="text-white/60">Total XP Earned</div>
                <div className="text-green-400 text-sm mt-1">+150 this week</div>
              </CardContent>
            </Card>
            
            <Card className="backdrop-blur-md bg-white/5 border border-white/10">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">
                  {achievements.filter(a => a.rarity === 'legendary' && a.unlocked).length}
                </div>
                <div className="text-white/60">Legendary Badges</div>
                <div className="text-purple-400 text-sm mt-1">Rarest of the rare</div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/10">
              <TabsTrigger value="all" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                All ({totalCount})
              </TabsTrigger>
              <TabsTrigger value="unlocked" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Unlocked ({unlockedCount})
              </TabsTrigger>
              <TabsTrigger value="locked" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Locked ({totalCount - unlockedCount})
              </TabsTrigger>
              <TabsTrigger value="recent" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Recent
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search and Filter */}
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Search achievements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['all', 'distance', 'speed', 'streak', 'social', 'challenge', 'special'] as const).map((category) => (
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

          {/* Achievements Grid */}
          {filteredAchievements.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-xl font-semibold text-white mb-2">No achievements found</h2>
              <p className="text-white/60">
                {searchQuery ? 'Try adjusting your search or filters' : 'Start working out to unlock achievements!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "backdrop-blur-md border overflow-hidden transition-all duration-300 group hover:border-white/20",
                      achievement.unlocked 
                        ? "bg-white/5 border-white/10" 
                        : "bg-white/5 border-white/5 opacity-80"
                    )}>
                      <CardContent className="p-6 text-center">
                        {/* Achievement Icon */}
                        <div className={cn(
                          "text-5xl mb-4 transition-transform duration-300 group-hover:scale-110",
                          achievement.unlocked ? "opacity-100" : "opacity-40"
                        )}>
                          {achievement.icon}
                        </div>
                        
                        {/* Achievement Info */}
                        <h4 className={cn(
                          "font-semibold mb-2 text-lg",
                          achievement.unlocked ? "text-white" : "text-white/60"
                        )}>
                          {achievement.name}
                        </div>
                        
                        <p className={cn(
                          "text-sm mb-4 leading-relaxed",
                          achievement.unlocked ? "text-white/80" : "text-white/40"
                        )}>
                          {achievement.description}
                        </p>
                        
                        {/* Category and Rarity */}
                        <div className="flex items-center justify-center space-x-2 mb-4">
                          <Badge variant="secondary" className={cn("text-xs", getCategoryColor(achievement.category))}>
                            {getCategoryIcon(achievement.category)} {achievement.category.charAt(0).toUpperCase() + achievement.category.slice(1)}
                          </Badge>
                          <Badge variant="secondary" className={cn("text-xs", getRarityBadgeColor(achievement.rarity))}>
                            {achievement.rarity.charAt(0).toUpperCase() + achievement.rarity.slice(1)}
                          </Badge>
                        </div>
                        
                        {/* Progress or Unlocked Status */}
                        {achievement.unlocked ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-center space-x-2 text-green-400">
                              <Unlock className="w-4 h-4" />
                              <span className="text-sm font-medium">Unlocked!</span>
                            </div>
                            
                            {achievement.reward && (
                              <div className="text-yellow-400 text-sm">
                                <Gift className="w-4 h-4 inline mr-1" />
                                {achievement.reward}
                              </div>
                            )}
                            
                            <div className="text-blue-400 text-sm">
                              +{achievement.xpReward} XP
                            </div>
                            
                            {achievement.unlockedDate && (
                              <div className="text-white/60 text-xs">
                                {new Date(achievement.unlockedDate).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="flex items-center justify-center space-x-2 text-white/40">
                              <Lock className="w-4 h-4" />
                              <span className="text-sm">Locked</span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-xs text-white/60">
                                <span>Progress</span>
                                <span>{achievement.progress}/{achievement.maxProgress}</span>
                              </div>
                              <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                            </div>
                            
                            {achievement.reward && (
                              <div className="text-yellow-400 text-sm">
                                <Gift className="w-4 h-4 inline mr-1" />
                                {achievement.reward}
                              </div>
                            )}
                            
                            <div className="text-blue-400 text-sm">
                              +{achievement.xpReward} XP
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Achievement Tips */}
          <div className="mt-12">
            <Card className="backdrop-blur-md bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">💡</div>
                  <div>
                    <h3 className="text-white font-semibold mb-2">Pro Tips</h3>
                    <p className="text-white/80 text-sm">
                      Focus on consistency and gradually increase your goals. Many achievements build upon each other, 
                      so every workout counts toward multiple badges!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AchievementsScreen;