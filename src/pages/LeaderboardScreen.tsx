import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { 
  Trophy, 
  Medal, 
  TrendingUp, 
  Search, 
  Filter, 
  Calendar, 
  Users, 
  Target,
  Star,
  Zap,
  Flame,
  Mountain,
  Award,
  Crown,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  metric: string;
  change: 'up' | 'down' | 'same';
  changeAmount: number;
  isCurrentUser: boolean;
  achievements: string[];
  streak: number;
  totalActivities: number;
}

interface LeaderboardCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  metric: string;
  period: 'week' | 'month' | 'year' | 'all-time';
}

const LeaderboardScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'distance' | 'activities' | 'streak' | 'points'>('distance');
  const [period, setPeriod] = useState<'week' | 'month' | 'year' | 'all-time'>('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demo
  useEffect(() => {
    const generateMockData = () => {
      const mockData: LeaderboardEntry[] = Array.from({ length: 50 }, (_, i) => ({
        id: `user-${i + 1}`,
        rank: i + 1,
        name: `User ${i + 1}`,
        avatar: undefined,
        score: Math.floor(Math.random() * 1000) + 100,
        metric: activeTab === 'distance' ? 'km' : activeTab === 'activities' ? 'activities' : activeTab === 'streak' ? 'days' : 'points',
        change: Math.random() > 0.5 ? (Math.random() > 0.5 ? 'up' : 'down') : 'same',
        changeAmount: Math.floor(Math.random() * 10) + 1,
        isCurrentUser: i === 24, // Current user at rank 25
        achievements: Math.random() > 0.7 ? ['Personal Best', 'New Route'] : [],
        streak: Math.floor(Math.random() * 30) + 1,
        totalActivities: Math.floor(Math.random() * 200) + 10
      }));

      // Sort by score (descending)
      mockData.sort((a, b) => b.score - a.score);
      
      // Update ranks
      mockData.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setLeaderboardData(mockData);
      setLoading(false);
    };

    generateMockData();
  }, [activeTab, period]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'distance': return '🏃‍♂️';
      case 'activities': return '💪';
      case 'streak': return '🔥';
      case 'points': return '⭐';
      default: return '🎯';
    }
  };

  const getCategoryDescription = (category: string) => {
    switch (category) {
      case 'distance': return 'Total distance covered in activities';
      case 'activities': return 'Number of completed activities';
      case 'streak': return 'Longest consecutive day streak';
      case 'points': return 'Total points earned from activities';
      default: return '';
    }
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    if (rank <= 10) return 'text-blue-400';
    if (rank <= 25) return 'text-green-400';
    return 'text-white/60';
  };

  const getChangeIcon = (change: string) => {
    switch (change) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-400" />;
      case 'same': return <Minus className="w-4 h-4 text-white/40" />;
      default: return null;
    }
  };

  const getChangeColor = (change: string) => {
    switch (change) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      case 'same': return 'text-white/40';
      default: return 'text-white/60';
    }
  };

  const filteredData = leaderboardData.filter(entry => 
    entry.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center text-white/90">Loading leaderboard...</div>
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
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Leaderboard</h1>
                <p className="text-white/60">Compete with friends and track your progress</p>
              </div>
              <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                <Trophy className="w-4 h-4 mr-2" />
                View Rewards
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full mb-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/10">
              <TabsTrigger value="distance" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                🏃‍♂️ Distance
              </TabsTrigger>
              <TabsTrigger value="activities" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                💪 Activities
              </TabsTrigger>
              <TabsTrigger value="streak" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                🔥 Streak
              </TabsTrigger>
              <TabsTrigger value="points" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                ⭐ Points
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Category Info */}
          <Card className="backdrop-blur-md bg-white/5 border border-white/10 mb-6">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{getCategoryIcon(activeTab)}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Leaderboard
                  </h3>
                  <p className="text-white/60">{getCategoryDescription(activeTab)}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">
                    {leaderboardData.find(entry => entry.isCurrentUser)?.rank || 'N/A'}
                  </div>
                  <div className="text-white/60 text-sm">Your Rank</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Period Selector and Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex gap-2">
              {(['week', 'month', 'year', 'all-time'] as const).map((p) => (
                <Button
                  key={p}
                  variant={period === p ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "whitespace-nowrap",
                    period === p 
                      ? "bg-blue-600 text-white" 
                      : "border-white/20 text-white hover:bg-white/10"
                  )}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </Button>
              ))}
            </div>
            
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40"
              />
            </div>
          </div>

          {/* Top 3 Podium */}
          {filteredData.length >= 3 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Top Performers</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {filteredData.slice(0, 3).map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card className={cn(
                      "backdrop-blur-md border overflow-hidden transition-all duration-300",
                      entry.isCurrentUser 
                        ? "bg-blue-600/20 border-blue-500/30" 
                        : "bg-white/5 border-white/10"
                    )}>
                      <CardContent className="p-6 text-center">
                        <div className="relative mb-4">
                          <Avatar className={cn(
                            "mx-auto",
                            index === 0 ? "h-20 w-20" : index === 1 ? "h-16 w-16" : "h-14 w-14"
                          )}>
                            <AvatarImage src={entry.avatar} />
                            <AvatarFallback className={cn(
                              "text-lg font-bold",
                              index === 0 ? "bg-yellow-500 text-white" : 
                              index === 1 ? "bg-gray-400 text-white" : 
                              "bg-amber-600 text-white"
                            )}>
                              {entry.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          
                          {getMedalIcon(entry.rank) && (
                            <div className="absolute -top-2 -right-2 text-2xl">
                              {getMedalIcon(entry.rank)}
                            </div>
                          )}
                        </div>
                        
                        <h4 className={cn(
                          "font-semibold mb-1",
                          entry.isCurrentUser ? "text-blue-400" : "text-white"
                        )}>
                          {entry.name}
                        </h4>
                        
                        <div className={cn(
                          "text-2xl font-bold mb-2",
                          getRankColor(entry.rank)
                        )}>
                          {entry.score} {entry.metric}
                        </div>
                        
                        <div className="text-white/60 text-sm">
                          Rank #{entry.rank}
                        </div>
                        
                        {entry.isCurrentUser && (
                          <Badge variant="secondary" className="mt-2 bg-blue-500/20 text-blue-400 border-blue-500/30">
                            You
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          <Card className="backdrop-blur-md bg-white/5 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Full Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-1">
                <AnimatePresence>
                  {filteredData.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                    >
                      <div className={cn(
                        "flex items-center p-4 hover:bg-white/5 transition-colors duration-200",
                        entry.isCurrentUser && "bg-blue-600/20 border-l-4 border-blue-500"
                      )}>
                        {/* Rank */}
                        <div className="flex items-center justify-center w-12">
                          <div className={cn(
                            "text-lg font-bold",
                            getRankColor(entry.rank)
                          )}>
                            {entry.rank}
                          </div>
                        </div>

                        {/* Avatar and Name */}
                        <div className="flex items-center space-x-3 flex-1">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={entry.avatar} />
                            <AvatarFallback className="bg-white/10 text-white">
                              {entry.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className={cn(
                              "font-medium",
                              entry.isCurrentUser ? "text-blue-400" : "text-white"
                            )}>
                              {entry.name}
                            </div>
                            <div className="text-white/60 text-sm">
                              {entry.totalActivities} activities • {entry.streak} day streak
                            </div>
                          </div>
                        </div>

                        {/* Score */}
                        <div className="text-right mr-4">
                          <div className="text-white font-semibold">
                            {entry.score} {entry.metric}
                          </div>
                          <div className="flex items-center justify-end space-x-1 text-sm">
                            {getChangeIcon(entry.change)}
                            <span className={getChangeColor(entry.change)}>
                              {entry.change === 'same' ? 'No change' : `${entry.changeAmount}`}
                            </span>
                          </div>
                        </div>

                        {/* Achievements */}
                        {entry.achievements.length > 0 && (
                          <div className="flex space-x-1">
                            {entry.achievements.map((achievement, i) => (
                              <Badge key={i} variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                <Award className="w-3 h-3 mr-1" />
                                {achievement}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          {/* Current User Highlight */}
          {leaderboardData.find(entry => entry.isCurrentUser) && (
            <div className="mt-6">
              <Card className="backdrop-blur-md bg-blue-600/20 border border-blue-500/30">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl">🎯</div>
                      <div>
                        <h3 className="text-white font-semibold">Your Performance</h3>
                        <p className="text-blue-200 text-sm">
                          Keep pushing to improve your rank!
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-blue-400">
                        #{leaderboardData.find(entry => entry.isCurrentUser)?.rank}
                      </div>
                      <div className="text-blue-200 text-sm">Current Rank</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardScreen;