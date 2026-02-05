import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Camera, 
  Image, 
  Video, 
  MapPin, 
  Clock, 
  Target, 
  Flame,
  Trophy,
  Users,
  ArrowLeft,
  Send,
  X,
  Plus,
  Upload,
  Activity,
  Heart,
  Zap,
  Mountain,
  Route,
  Calendar,
  Star,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface WorkoutStats {
  type: 'run' | 'ride' | 'swim' | 'workout' | 'hike';
  distance?: number;
  duration: number;
  calories: number;
  pace?: string;
  elevation?: number;
  heartRate?: {
    avg: number;
    max: number;
  };
  power?: {
    avg: number;
    max: number;
  };
  temperature?: number;
  weather?: string;
}

interface PostDraft {
  content: string;
  workoutStats: WorkoutStats;
  location?: string;
  route?: string;
  privacy: 'public' | 'followers' | 'private';
  achievements: string[];
  media: File[];
  tags: string[];
}

const CreatePostScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [postDraft, setPostDraft] = useState<PostDraft>({
    content: '',
    workoutStats: {
      type: 'run',
      distance: 0,
      duration: 0,
      calories: 0,
      pace: '',
      elevation: 0
    },
    location: '',
    route: '',
    privacy: 'public',
    achievements: [],
    media: [],
    tags: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);

  const handleWorkoutTypeChange = (type: string) => {
    setPostDraft(prev => ({
      ...prev,
      workoutStats: {
        ...prev.workoutStats,
        type: type as WorkoutStats['type']
      }
    }));
  };

  const handleStatChange = (field: keyof WorkoutStats, value: string | number) => {
    setPostDraft(prev => ({
      ...prev,
      workoutStats: {
        ...prev.workoutStats,
        [field]: value
      }
    }));
  };

  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setPostDraft(prev => ({
      ...prev,
      media: [...prev.media, ...files]
    }));
  };

  const removeMedia = (index: number) => {
    setPostDraft(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
  };

  const addAchievement = (achievement: string) => {
    if (!postDraft.achievements.includes(achievement)) {
      setPostDraft(prev => ({
        ...prev,
        achievements: [...prev.achievements, achievement]
      }));
    }
  };

  const removeAchievement = (achievement: string) => {
    setPostDraft(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a !== achievement)
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !postDraft.tags.includes(tag.trim())) {
      setPostDraft(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tag: string) => {
    setPostDraft(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async () => {
    if (!postDraft.content.trim()) return;

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/feed');
    }, 2000);
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

  const availableAchievements = [
    'Personal Best',
    'New Route',
    'First Time',
    'Longest Distance',
    'Fastest Pace',
    'Highest Elevation',
    'Perfect Weather',
    'Early Bird',
    'Night Owl',
    'Weekend Warrior'
  ];

  const availableTags = [
    'morning',
    'evening',
    'trail',
    'road',
    'indoor',
    'outdoor',
    'group',
    'solo',
    'challenge',
    'recovery'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
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
                <h1 className="text-3xl font-bold text-white">Create Post</h1>
                <p className="text-white/60">Share your workout with the community</p>
              </div>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !postDraft.content.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                "Posting..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>

          {/* Post Content */}
          <Card className="backdrop-blur-md bg-white/5 border border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white">What's on your mind?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Share your workout experience, thoughts, or motivation..."
                  value={postDraft.content}
                  onChange={(e) => setPostDraft(prev => ({ ...prev, content: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
                  rows={4}
                />
                
                {/* Media Upload */}
                <div className="space-y-3">
                  <Label className="text-white">Add Photos or Videos</Label>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Media
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={handleMediaUpload}
                      className="hidden"
                    />
                    <span className="text-white/60 text-sm">
                      {postDraft.media.length} file{postDraft.media.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  
                  {/* Media Preview */}
                  {postDraft.media.length > 0 && (
                    <div className="grid grid-cols-2 gap-3">
                      {postDraft.media.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Media ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMedia(index)}
                            className="absolute top-2 right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-white"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Workout Stats */}
          <Card className="backdrop-blur-md bg-white/5 border border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                Workout Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Workout Type */}
                <div className="space-y-3">
                  <Label className="text-white">Activity Type</Label>
                  <div className="grid grid-cols-5 gap-2">
                    {(['run', 'ride', 'swim', 'workout', 'hike'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={postDraft.workoutStats.type === type ? "default" : "outline"}
                        onClick={() => handleWorkoutTypeChange(type)}
                        className={cn(
                          "flex flex-col items-center space-y-1 h-20",
                          postDraft.workoutStats.type === type 
                            ? "bg-blue-600 text-white" 
                            : "border-white/20 text-white hover:bg-white/10"
                        )}
                      >
                        <span className="text-2xl">{getWorkoutIcon(type)}</span>
                        <span className="text-xs capitalize">{type}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Basic Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white">Distance (km)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={postDraft.workoutStats.distance || ''}
                      onChange={(e) => handleStatChange('distance', parseFloat(e.target.value) || 0)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="0.0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Duration (minutes)</Label>
                    <Input
                      type="number"
                      value={postDraft.workoutStats.duration || ''}
                      onChange={(e) => handleStatChange('duration', parseInt(e.target.value) || 0)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Calories</Label>
                    <Input
                      type="number"
                      value={postDraft.workoutStats.calories || ''}
                      onChange={(e) => handleStatChange('calories', parseInt(e.target.value) || 0)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-white">Pace (min/km)</Label>
                    <Input
                      type="text"
                      value={postDraft.workoutStats.pace || ''}
                      onChange={(e) => handleStatChange('pace', e.target.value)}
                      className="bg-white/10 border-white/20 text-white"
                      placeholder="5:30"
                    />
                  </div>
                </div>

                {/* Advanced Stats Toggle */}
                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={() => setShowAdvancedStats(!showAdvancedStats)}
                    className="text-blue-400 hover:text-blue-300"
                  >
                    {showAdvancedStats ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Hide Advanced Stats
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        Show Advanced Stats
                      </>
                    )}
                  </Button>
                </div>

                {/* Advanced Stats */}
                <AnimatePresence>
                  {showAdvancedStats && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Elevation (m)</Label>
                          <Input
                            type="number"
                            value={postDraft.workoutStats.elevation || ''}
                            onChange={(e) => handleStatChange('elevation', parseInt(e.target.value) || 0)}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="0"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white">Temperature (°C)</Label>
                          <Input
                            type="number"
                            value={postDraft.workoutStats.temperature || ''}
                            onChange={(e) => handleStatChange('temperature', parseInt(e.target.value) || 0)}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="20"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-white">Avg Heart Rate (bpm)</Label>
                          <Input
                            type="number"
                            value={postDraft.workoutStats.heartRate?.avg || ''}
                            onChange={(e) => handleStatChange('heartRate', {
                              ...postDraft.workoutStats.heartRate,
                              avg: parseInt(e.target.value) || 0
                            })}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="140"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-white">Max Heart Rate (bpm)</Label>
                          <Input
                            type="number"
                            value={postDraft.workoutStats.heartRate?.max || ''}
                            onChange={(e) => handleStatChange('heartRate', {
                              ...postDraft.workoutStats.heartRate,
                              max: parseInt(e.target.value) || 0
                            })}
                            className="bg-white/10 border-white/20 text-white"
                            placeholder="180"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>

          {/* Location and Route */}
          <Card className="backdrop-blur-md bg-white/5 border border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                Location & Route
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Location</Label>
                  <Input
                    value={postDraft.location}
                    onChange={(e) => setPostDraft(prev => ({ ...prev, location: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="e.g., Central Park, NYC"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Route Name</Label>
                  <Input
                    value={postDraft.route}
                    onChange={(e) => setPostDraft(prev => ({ ...prev, route: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white"
                    placeholder="e.g., Morning Loop, Hill Training"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="backdrop-blur-md bg-white/5 border border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {availableAchievements.map((achievement) => (
                    <Button
                      key={achievement}
                      variant={postDraft.achievements.includes(achievement) ? "default" : "outline"}
                      size="sm"
                      onClick={() => postDraft.achievements.includes(achievement) 
                        ? removeAchievement(achievement) 
                        : addAchievement(achievement)
                      }
                      className={cn(
                        "text-xs",
                        postDraft.achievements.includes(achievement)
                          ? "bg-yellow-500 text-white hover:bg-yellow-600"
                          : "border-white/20 text-white hover:bg-white/10"
                      )}
                    >
                      {achievement}
                    </Button>
                  ))}
                </div>
                
                {postDraft.achievements.length > 0 && (
                  <div className="pt-2">
                    <Label className="text-white text-sm">Selected Achievements:</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {postDraft.achievements.map((achievement) => (
                        <Badge key={achievement} variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          {achievement}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAchievement(achievement)}
                            className="h-4 w-4 p-0 ml-1 hover:bg-yellow-500/30"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Privacy and Tags */}
          <Card className="backdrop-blur-md bg-white/5 border border-white/10 mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center space-x-2">
                <Users className="w-5 h-5" />
                Privacy & Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-white">Privacy</Label>
                  <Select
                    value={postDraft.privacy}
                    onValueChange={(value) => setPostDraft(prev => ({ ...prev, privacy: value as PostDraft['privacy'] }))}
                  >
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">🌍 Public - Everyone can see</SelectItem>
                      <SelectItem value="followers">👥 Followers - Only your followers</SelectItem>
                      <SelectItem value="private">🔒 Private - Only you</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-white">Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Button
                        key={tag}
                        variant={postDraft.tags.includes(tag) ? "default" : "outline"}
                        size="sm"
                        onClick={() => postDraft.tags.includes(tag) 
                          ? removeTag(tag) 
                          : addTag(tag)
                        }
                        className={cn(
                          "text-xs",
                          postDraft.tags.includes(tag)
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "border-white/20 text-white hover:bg-white/10"
                        )}
                      >
                        #{tag}
                      </Button>
                    ))}
                  </div>
                  
                  {postDraft.tags.length > 0 && (
                    <div className="pt-2">
                      <Label className="text-white text-sm">Selected Tags:</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {postDraft.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                            #{tag}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeTag(tag)}
                              className="h-4 w-4 p-0 ml-1 hover:bg-blue-500/30"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post Preview */}
          {postDraft.content && (
            <Card className="backdrop-blur-md bg-white/5 border border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-600 text-white">Y</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-white font-semibold">You</div>
                      <div className="text-white/60 text-sm">Just now</div>
                    </div>
                  </div>
                  
                  <p className="text-white/90 text-sm leading-relaxed">
                    {postDraft.content}
                  </p>
                  
                  {postDraft.workoutStats.type && (
                    <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="text-2xl">{getWorkoutIcon(postDraft.workoutStats.type)}</span>
                        <span className={cn("font-semibold text-white", getWorkoutColor(postDraft.workoutStats.type))}>
                          {postDraft.workoutStats.type.charAt(0).toUpperCase() + postDraft.workoutStats.type.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {postDraft.workoutStats.distance && (
                          <div className="text-center">
                            <div className="text-white font-bold text-lg">
                              {postDraft.workoutStats.distance}km
                            </div>
                            <div className="text-white/60 text-xs">Distance</div>
                          </div>
                        )}
                        {postDraft.workoutStats.duration && (
                          <div className="text-center">
                            <div className="text-white font-bold text-lg">
                              {postDraft.workoutStats.duration}m
                            </div>
                            <div className="text-white/60 text-xs">Duration</div>
                          </div>
                        )}
                        {postDraft.workoutStats.calories && (
                          <div className="text-center">
                            <div className="text-white font-bold text-lg">
                              {postDraft.workoutStats.calories}
                            </div>
                            <div className="text-white/60 text-xs">Calories</div>
                          </div>
                        )}
                        {postDraft.workoutStats.pace && (
                          <div className="text-center">
                            <div className="text-white font-bold text-lg">
                              {postDraft.workoutStats.pace}
                            </div>
                            <div className="text-white/60 text-xs">Pace</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {postDraft.achievements.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {postDraft.achievements.map((achievement) => (
                        <Badge key={achievement} variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                          <Trophy className="w-3 h-3 mr-1" />
                          {achievement}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePostScreen;