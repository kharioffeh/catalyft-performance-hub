import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Users, 
  Target, 
  Calendar, 
  MapPin, 
  Award,
  Star,
  TrendingUp,
  Clock,
  Flag,
  Medal,
  ArrowLeft,
  Share2,
  Heart,
  MessageCircle,
  Bookmark,
  MoreHorizontal,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
  Route,
  Mountain,
  Zap,
  Fire
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate, useParams } from 'react-router-dom';

interface ChallengeParticipant {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  rank: number;
  progress: number;
  goal: number;
  current: number;
  unit: string;
  joinedDate: string;
  lastActivity: string;
  isCurrentUser: boolean;
  achievements: string[];
  isVerified: boolean;
  isPremium: boolean;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: string;
  goal: number;
  unit: string;
  startDate: string;
  endDate: string;
  reward: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  image?: string;
  color: string;
  icon: string;
  participants: ChallengeParticipant[];
  maxParticipants?: number;
  isJoined: boolean;
  isCompleted: boolean;
  rules: string[];
  tags: string[];
  creator: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
    isVerified: boolean;
  };
  stats: {
    totalParticipants: number;
    averageProgress: number;
    topPerformers: number;
    completionRate: number;
  };
}

const ChallengeDetailScreen: React.FC = () => {
  const navigate = useNavigate();
  const { challengeId } = useParams<{ challengeId: string }>();
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'leaderboard' | 'rules'>('overview');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Mock data for demo
  useEffect(() => {
    const generateMockChallenge = () => {
      const mockChallenge: Challenge = {
        id: challengeId || 'challenge-1',
        title: 'Summer Running Challenge',
        description: 'Push your limits this summer with our ultimate running challenge! Complete 100km of running over 30 days and join an elite group of athletes. Whether you\'re a beginner or a seasoned runner, this challenge will help you build endurance and achieve your fitness goals.',
        category: 'Running',
        goal: 100,
        unit: 'km',
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString(),
        reward: 'Exclusive Summer Runner Badge + 500 XP',
        difficulty: 'medium',
        color: 'from-orange-500 to-red-500',
        icon: '🏃‍♂️',
        isJoined: true,
        isCompleted: false,
        rules: [
          'All runs must be tracked and verified',
          'Minimum run distance: 1km',
          'Treadmill runs are allowed',
          'Group runs count towards individual goals',
          'No motorized assistance allowed',
          'Submit proof of completion within 24 hours'
        ],
        tags: ['Running', 'Endurance', 'Summer', 'Community', 'Fitness'],
        creator: {
          id: 'creator-1',
          name: 'Sarah Johnson',
          username: 'sarahj',
          avatar: undefined,
          isVerified: true
        },
        stats: {
          totalParticipants: 1247,
          averageProgress: 68,
          topPerformers: 45,
          completionRate: 23
        },
        participants: Array.from({ length: 50 }, (_, i) => ({
          id: `participant-${i + 1}`,
          name: `Participant ${i + 1}`,
          username: `participant${i + 1}`,
          avatar: undefined,
          rank: i + 1,
          progress: Math.floor(Math.random() * 100) + 1,
          goal: 100,
          current: Math.floor(Math.random() * 100) + 1,
          unit: 'km',
          joinedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastActivity: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          isCurrentUser: i === 15, // Current user at rank 16
          achievements: Math.random() > 0.5 ? [
            'First 10km',
            'Week Warrior',
            'Speed Demon'
          ].slice(0, Math.floor(Math.random() * 3) + 1) : [],
          isVerified: Math.random() > 0.8,
          isPremium: Math.random() > 0.7
        }))
      };

      // Sort participants by progress
      mockChallenge.participants.sort((a, b) => b.progress - a.progress);
      
      // Update ranks after sorting
      mockChallenge.participants.forEach((participant, index) => {
        participant.rank = index + 1;
      });

      setChallenge(mockChallenge);
      setLoading(false);
    };

    generateMockChallenge();
  }, [challengeId]);

  const handleJoinChallenge = async () => {
    if (!challenge) return;
    
    setJoining(true);
    
    // Simulate API call
    setTimeout(() => {
      setChallenge(prev => prev ? { ...prev, isJoined: true } : null);
      setJoining(false);
    }, 1000);
  };

  const handleLeaveChallenge = async () => {
    if (!challenge) return;
    
    setLeaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setChallenge(prev => prev ? { ...prev, isJoined: false } : null);
      setLeaving(false);
    }, 1000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-orange-400';
      case 'extreme': return 'text-red-400';
      default: return 'text-white/60';
    }
  };

  const getDifficultyBadgeColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'hard': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'extreme': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-white/20 text-white/60 border-white/30';
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
    if (rank <= 50) return 'text-green-400';
    return 'text-white/60';
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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = () => {
    if (!challenge) return 0;
    const now = new Date();
    const end = new Date(challenge.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center text-white/90">Loading challenge...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center text-white/90">Challenge not found</div>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = challenge.participants.find(p => p.isCurrentUser);
  const daysRemaining = getDaysRemaining();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
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
                  <h1 className="text-3xl font-bold text-white">{challenge.title}</h1>
                  <p className="text-white/60">Challenge Details</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="ghost" size="sm" className="text-white/70 hover:text-white">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          {/* Challenge Hero Card */}
          <Card className="backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden mb-8">
            <div className={`bg-gradient-to-r ${challenge.color} p-8 text-white`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-6xl">{challenge.icon}</span>
                    <div>
                      <Badge variant="secondary" className={cn("text-sm", getDifficultyBadgeColor(challenge.difficulty))}>
                        {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                      </Badge>
                      <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm ml-2">
                        {challenge.category}
                      </Badge>
                    </div>
                  </div>
                  
                  <h2 className="text-4xl font-bold mb-4">{challenge.title}</h2>
                  <p className="text-xl text-white/90 leading-relaxed max-w-3xl">{challenge.description}</p>
                  
                  <div className="flex items-center space-x-8 mt-6">
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5" />
                      <span className="text-lg font-semibold">{challenge.goal} {challenge.unit}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5" />
                      <span className="text-lg font-semibold">{formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5" />
                      <span className="text-lg font-semibold">{challenge.stats.totalParticipants} participants</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-6xl mb-2">🏆</div>
                  <p className="text-lg font-semibold">{challenge.reward}</p>
                </div>
              </div>
            </div>
            
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400 mb-2">{challenge.stats.totalParticipants}</div>
                  <div className="text-white/60">Total Participants</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-2">{challenge.stats.averageProgress}%</div>
                  <div className="text-white/60">Average Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">{challenge.stats.topPerformers}</div>
                  <div className="text-white/60">Top Performers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400 mb-2">{challenge.stats.completionRate}%</div>
                  <div className="text-white/60">Completion Rate</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center space-x-4">
                {challenge.isJoined ? (
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="lg" className="border-green-500/30 text-green-400 hover:bg-green-500/10">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Joined Challenge
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="lg"
                      onClick={handleLeaveChallenge}
                      disabled={leaving}
                    >
                      {leaving ? (
                        "Leaving..."
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 mr-2" />
                          Leave Challenge
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Button 
                    size="lg" 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    onClick={handleJoinChallenge}
                    disabled={joining}
                  >
                    {joining ? (
                      "Joining..."
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Join Challenge
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Current User Progress */}
          {currentUser && (
            <Card className="backdrop-blur-md bg-white/5 border border-white/10 mb-8">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-white mb-2">
                      {currentUser.current} / {currentUser.goal} {currentUser.unit}
                    </div>
                    <div className="text-white/60">
                      Rank #{currentUser.rank} of {challenge.participants.length}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-400 mb-2">{currentUser.progress}%</div>
                    <div className="text-white/60">Complete</div>
                  </div>
                </div>
                <Progress value={currentUser.progress} className="h-3" />
                <div className="flex items-center justify-between mt-4 text-sm text-white/60">
                  <span>{daysRemaining} days remaining</span>
                  <span>Need {currentUser.goal - currentUser.current} more {currentUser.unit}</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mb-8">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 border border-white/20">
              <TabsTrigger value="overview" className="text-white data-[state=active]:bg-blue-600">Overview</TabsTrigger>
              <TabsTrigger value="participants" className="text-white data-[state=active]:bg-blue-600">Participants</TabsTrigger>
              <TabsTrigger value="leaderboard" className="text-white data-[state=active]:bg-blue-600">Leaderboard</TabsTrigger>
              <TabsTrigger value="rules" className="text-white data-[state=active]:bg-blue-600">Rules</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <Info className="w-5 h-5 text-blue-400" />
                      <span>Challenge Info</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Category:</span>
                      <span className="text-white font-medium">{challenge.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Difficulty:</span>
                      <span className={cn("font-medium", getDifficultyColor(challenge.difficulty))}>
                        {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Goal:</span>
                      <span className="text-white font-medium">{challenge.goal} {challenge.unit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Duration:</span>
                      <span className="text-white font-medium">30 days</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Reward:</span>
                      <span className="text-white font-medium">{challenge.reward}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center space-x-2">
                      <BarChart3 className="w-5 h-5 text-green-400" />
                      <span>Statistics</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Total Participants:</span>
                      <span className="text-white font-medium">{challenge.stats.totalParticipants}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Average Progress:</span>
                      <span className="text-white font-medium">{challenge.stats.averageProgress}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Top Performers:</span>
                      <span className="text-white font-medium">{challenge.stats.topPerformers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Completion Rate:</span>
                      <span className="text-white font-medium">{challenge.stats.completionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60">Days Remaining:</span>
                      <span className="text-white font-medium">{daysRemaining}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Route className="w-5 h-5 text-purple-400" />
                    <span>Tags</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {challenge.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Participants Tab */}
            <TabsContent value="participants" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">All Participants</h3>
                <div className="text-white/60">{challenge.participants.length} participants</div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {challenge.participants.slice(0, 12).map((participant) => (
                  <Card key={participant.id} className="backdrop-blur-md bg-white/5 border border-white/10">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={participant.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm">
                            {participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="text-white font-medium text-sm">{participant.name}</h4>
                            {participant.isVerified && (
                              <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                ✓
                              </Badge>
                            )}
                          </div>
                          <p className="text-white/60 text-xs">@{participant.username}</p>
                        </div>
                        <div className="text-right">
                          <div className={cn("text-lg font-bold", getRankColor(participant.rank))}>
                            #{participant.rank}
                          </div>
                          {getMedalIcon(participant.rank) && (
                            <div className="text-2xl">{getMedalIcon(participant.rank)}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Progress:</span>
                          <span className="text-white font-medium">{participant.progress}%</span>
                        </div>
                        <Progress value={participant.progress} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/60">Current:</span>
                          <span className="text-white font-medium">{participant.current} {participant.unit}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="text-center mt-6">
                <Button variant="ghost" className="text-white/70 hover:text-white">
                  View All Participants
                </Button>
              </div>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Top Performers</h3>
                <div className="text-white/60">Updated in real-time</div>
              </div>
              
              <div className="space-y-3">
                {challenge.participants.slice(0, 20).map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <Card className={cn(
                      "backdrop-blur-md border transition-all duration-300",
                      participant.isCurrentUser 
                        ? "bg-blue-500/10 border-blue-500/30" 
                        : "bg-white/5 border-white/10"
                    )}>
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                              participant.rank === 1 ? "bg-yellow-500 text-black" :
                              participant.rank === 2 ? "bg-gray-400 text-black" :
                              participant.rank === 3 ? "bg-amber-600 text-white" :
                              "bg-white/10 text-white"
                            )}>
                              {participant.rank}
                            </div>
                            {getMedalIcon(participant.rank) && (
                              <div className="text-2xl">{getMedalIcon(participant.rank)}</div>
                            )}
                          </div>
                          
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={participant.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                              {participant.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-white font-medium">{participant.name}</h4>
                              {participant.isVerified && (
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                  ✓
                                </Badge>
                              )}
                              {participant.isCurrentUser && (
                                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                                  You
                                </Badge>
                              )}
                            </div>
                            <p className="text-white/60 text-sm">@{participant.username}</p>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{participant.current} {participant.unit}</div>
                            <div className="text-white/60 text-sm">{participant.progress}% complete</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-4">
              <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Flag className="w-5 h-5 text-red-400" />
                    <span>Challenge Rules</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {challenge.rules.map((rule, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-sm flex items-center justify-center font-bold mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-white/80 leading-relaxed">{rule}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Info className="w-5 h-5 text-blue-400" />
                    <span>Important Notes</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-white/80">
                    <p>• All activities must be completed within the challenge timeframe</p>
                    <p>• Progress is updated automatically when you sync your activities</p>
                    <p>• You can leave the challenge at any time</p>
                    <p>• Rewards are distributed after the challenge ends</p>
                    <p>• Contact support if you encounter any issues</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ChallengeDetailScreen;