
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GlassCard } from '@/components/ui';
import { 
  User, 
  Mail, 
  Calendar, 
  Edit3, 
  MapPin, 
  Trophy, 
  Target, 
  TrendingUp,
  Activity,
  Heart,
  Zap,
  Mountain,
  Clock,
  Flame,
  Award,
  Star,
  Users,
  Settings,
  Share2,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Workout {
  id: string;
  type: 'run' | 'ride' | 'swim' | 'workout' | 'hike';
  distance: number;
  duration: number;
  calories: number;
  date: string;
  location?: string;
  route?: string;
  achievements?: string[];
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'distance' | 'speed' | 'streak' | 'social' | 'challenge';
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  unlockedDate?: string;
}

const Profile: React.FC = () => {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'workouts' | 'achievements' | 'stats'>('overview');
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: 'Passionate runner and fitness enthusiast. Always pushing my limits and exploring new routes.',
    location: 'San Francisco, CA',
    website: 'https://strava.com/athletes/12345',
  });

  // Mock data for demo
  const [recentWorkouts] = useState<Workout[]>([
    {
      id: '1',
      type: 'run',
      distance: 10.5,
      duration: 3600,
      calories: 750,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      location: 'Golden Gate Park',
      achievements: ['Personal Best']
    },
    {
      id: '2',
      type: 'ride',
      distance: 45.2,
      duration: 7200,
      calories: 1200,
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Marin Headlands',
      route: 'Coastal Loop'
    },
    {
      id: '3',
      type: 'workout',
      distance: 0,
      duration: 1800,
      calories: 400,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Home Gym'
    }
  ]);

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      name: 'First 10K',
      description: 'Complete your first 10K run',
      icon: '🏃‍♂️',
      category: 'distance',
      unlocked: true,
      progress: 10,
      maxProgress: 10,
      unlockedDate: '2024-01-15'
    },
    {
      id: '2',
      name: 'Speed Demon',
      description: 'Run 5K in under 20 minutes',
      icon: '⚡',
      category: 'speed',
      unlocked: false,
      progress: 18.5,
      maxProgress: 20
    },
    {
      id: '3',
      name: 'Week Warrior',
      description: 'Work out 7 days in a row',
      icon: '🔥',
      category: 'streak',
      unlocked: true,
      progress: 7,
      maxProgress: 7,
      unlockedDate: '2024-01-20'
    },
    {
      id: '4',
      name: 'Social Butterfly',
      description: 'Join 5 group activities',
      icon: '🦋',
      category: 'social',
      unlocked: false,
      progress: 3,
      maxProgress: 5
    }
  ]);

  const handleSave = async () => {
    if (!profile?.id) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', profile.id);

      if (error) throw error;

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been saved successfully.',
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Profile update error:', err);
      toast({
        title: 'Update Failed',
        description: 'Could not save profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      full_name: profile?.full_name || '',
      bio: 'Passionate runner and fitness enthusiast. Always pushing my limits and exploring new routes.',
      location: 'San Francisco, CA',
      website: 'https://strava.com/athletes/12345',
    });
    setIsEditing(false);
  };

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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">Profile</h1>
              <div className="flex items-center space-x-3">
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Profile
                </Button>
                <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Button>
              </div>
            </div>
          </div>

          {/* Profile Header Card */}
          <GlassCard className="p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
              {/* Avatar Section */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-white/20">
                    <AvatarImage src={profile?.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white text-4xl font-bold">
                      {profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="sm"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
                <div className="text-center">
                  <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                    <Star className="w-3 h-3 mr-1" />
                    Premium Member
                  </Badge>
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  {isEditing ? (
                    <Input
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="text-2xl font-bold bg-white/10 border-white/20 text-white"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-white">{formData.full_name || profile?.full_name || 'User'}</h2>
                  )}
                  
                  {isEditing ? (
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="text-white/70 bg-white/10 border-white/20"
                      placeholder="Location"
                    />
                  ) : (
                    <p className="text-white/70 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      {formData.location}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  {isEditing ? (
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-md text-white resize-none"
                      rows={3}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-white/90 leading-relaxed">{formData.bio}</p>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">156</div>
                    <div className="text-white/60 text-sm">Activities</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">1,247</div>
                    <div className="text-white/60 text-sm">km</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">89</div>
                    <div className="text-white/60 text-sm">Days</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-3 pt-4">
                  {isEditing ? (
                    <>
                      <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 text-white">
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button onClick={handleCancel} disabled={isSaving} variant="outline" className="border-white/20 text-white hover:bg-white/10">
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button onClick={() => setIsEditing(true)} className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/10 mb-8">
              <TabsTrigger value="overview" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Overview
              </TabsTrigger>
              <TabsTrigger value="workouts" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Recent Workouts
              </TabsTrigger>
              <TabsTrigger value="achievements" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Achievements
              </TabsTrigger>
              <TabsTrigger value="stats" className="text-white/70 hover:text-white data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                Stats
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Streak */}
                <GlassCard className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-500/20 rounded-full">
                      <Flame className="w-8 h-8 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Current Streak</h3>
                      <p className="text-3xl font-bold text-orange-400">7 days</p>
                      <p className="text-white/60 text-sm">Keep it going!</p>
                    </div>
                  </div>
                </GlassCard>

                {/* This Week's Goal */}
                <GlassCard className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/20 rounded-full">
                      <Target className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">Weekly Goal</h3>
                      <p className="text-3xl font-bold text-blue-400">85%</p>
                      <Progress value={85} className="mt-2" />
                    </div>
                  </div>
                </GlassCard>
              </div>

              {/* Recent Activity */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                  <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {recentWorkouts.slice(0, 3).map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getWorkoutIcon(workout.type)}</span>
                        <div>
                          <p className="text-white font-medium">{workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}</p>
                          <p className="text-white/60 text-sm">{workout.location}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-medium">{workout.distance > 0 ? `${workout.distance}km` : formatDuration(workout.duration)}</p>
                        <p className="text-white/60 text-sm">{format(new Date(workout.date), 'MMM dd')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </TabsContent>

            {/* Recent Workouts Tab */}
            <TabsContent value="workouts" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Recent Workouts</h3>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Workout
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentWorkouts.map((workout) => (
                  <motion.div
                    key={workout.id}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <span className="text-3xl">{getWorkoutIcon(workout.type)}</span>
                          <Badge variant="secondary" className={cn("text-xs", getWorkoutColor(workout.type))}>
                            {workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div>
                            <div className="text-white font-bold text-lg">
                              {workout.distance > 0 ? `${workout.distance}km` : formatDuration(workout.duration)}
                            </div>
                            <div className="text-white/60 text-xs">
                              {workout.distance > 0 ? 'Distance' : 'Duration'}
                            </div>
                          </div>
                          <div>
                            <div className="text-white font-bold text-lg">{workout.calories}</div>
                            <div className="text-white/60 text-xs">Calories</div>
                          </div>
                        </div>
                        
                        {workout.location && (
                          <div className="flex items-center text-white/60 text-sm">
                            <MapPin className="w-4 h-4 mr-2" />
                            {workout.location}
                          </div>
                        )}
                        
                        <div className="text-white/60 text-sm">
                          {format(new Date(workout.date), 'MMM dd, yyyy')}
                        </div>
                        
                        {workout.achievements && workout.achievements.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {workout.achievements.map((achievement, i) => (
                              <Badge key={i} variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                                <Trophy className="w-3 h-3 mr-1" />
                                {achievement}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Achievements Tab */}
            <TabsContent value="achievements" className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Achievements</h3>
                <div className="text-white/60">
                  {achievements.filter(a => a.unlocked).length} of {achievements.length} unlocked
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <motion.div
                    key={achievement.id}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className={cn(
                      "backdrop-blur-md border overflow-hidden transition-all duration-300",
                      achievement.unlocked 
                        ? "bg-white/5 border-white/10" 
                        : "bg-white/5 border-white/5 opacity-60"
                    )}>
                      <CardContent className="p-6 text-center">
                        <div className={cn(
                          "text-4xl mb-3",
                          achievement.unlocked ? "opacity-100" : "opacity-40"
                        )}>
                          {achievement.icon}
                        </div>
                        
                        <h4 className={cn(
                          "font-semibold mb-2",
                          achievement.unlocked ? "text-white" : "text-white/60"
                        )}>
                          {achievement.name}
                        </h4>
                        
                        <p className={cn(
                          "text-sm mb-4",
                          achievement.unlocked ? "text-white/80" : "text-white/40"
                        )}>
                          {achievement.description}
                        </p>
                        
                        {achievement.unlocked ? (
                          <div className="space-y-2">
                            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                              <Award className="w-3 h-3 mr-1" />
                              Unlocked
                            </Badge>
                            {achievement.unlockedDate && (
                              <div className="text-white/60 text-xs">
                                {format(new Date(achievement.unlockedDate), 'MMM dd, yyyy')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <div className="text-white/60 text-sm">
                              Progress: {achievement.progress}/{achievement.maxProgress}
                            </div>
                            <Progress value={(achievement.progress / achievement.maxProgress) * 100} className="h-2" />
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Stats Tab */}
            <TabsContent value="stats" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <GlassCard className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-400 mb-2">1,247</div>
                    <div className="text-white/60">Total Distance (km)</div>
                    <div className="text-green-400 text-sm mt-1">+12% this month</div>
                  </div>
                </GlassCard>
                
                <GlassCard className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 mb-2">156</div>
                    <div className="text-white/60">Total Activities</div>
                    <div className="text-green-400 text-sm mt-1">+8% this month</div>
                  </div>
                </GlassCard>
                
                <GlassCard className="p-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 mb-2">89</div>
                    <div className="text-white/60">Active Days</div>
                    <div className="text-green-400 text-sm mt-1">+5% this month</div>
                  </div>
                </GlassCard>
              </div>
              
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Monthly Progress</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Distance Goal</span>
                    <span className="text-white font-medium">85%</span>
                  </div>
                  <Progress value={85} className="h-3" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Activity Goal</span>
                    <span className="text-white font-medium">92%</span>
                  </div>
                  <Progress value={92} className="h-3" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Calorie Goal</span>
                    <span className="text-white font-medium">78%</span>
                  </div>
                  <Progress value={78} className="h-3" />
                </div>
              </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
