import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  X, 
  Target, 
  Calendar, 
  Users, 
  Trophy, 
  Flag, 
  Tag, 
  Image, 
  ArrowLeft,
  Save,
  Eye,
  Settings,
  Zap,
  Fire,
  Mountain,
  Route,
  Clock,
  Award,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface ChallengeDraft {
  title: string;
  description: string;
  category: string;
  goal: number;
  unit: string;
  startDate: string;
  endDate: string;
  reward: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'extreme';
  maxParticipants?: number;
  rules: string[];
  tags: string[];
  isPublic: boolean;
  allowInvites: boolean;
  requireApproval: boolean;
  image?: string;
  color: string;
  icon: string;
}

const CreateChallengeScreen: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'rules' | 'preview'>('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRule, setNewRule] = useState('');
  const [newTag, setNewTag] = useState('');

  const [challengeDraft, setChallengeDraft] = useState<ChallengeDraft>({
    title: '',
    description: '',
    category: 'Running',
    goal: 100,
    unit: 'km',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 37 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    reward: '',
    difficulty: 'medium',
    maxParticipants: undefined,
    rules: [
      'All activities must be tracked and verified',
      'Submit proof of completion within 24 hours'
    ],
    tags: ['Community', 'Fitness'],
    isPublic: true,
    allowInvites: true,
    requireApproval: false,
    color: 'from-blue-500 to-purple-500',
    icon: '🏃‍♂️'
  });

  const categories = [
    'Running', 'Cycling', 'Swimming', 'Workout', 'Hiking', 'Triathlon', 'Ultra', 'Strength', 'Yoga', 'Other'
  ];

  const units = [
    { value: 'km', label: 'Kilometers' },
    { value: 'mi', label: 'Miles' },
    { value: 'm', label: 'Meters' },
    { value: 'ft', label: 'Feet' },
    { value: 'min', label: 'Minutes' },
    { value: 'hr', label: 'Hours' },
    { value: 'reps', label: 'Repetitions' },
    { value: 'sets', label: 'Sets' }
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy', icon: '😊', color: 'text-green-400' },
    { value: 'medium', label: 'Medium', icon: '😐', color: 'text-yellow-400' },
    { value: 'hard', label: 'Hard', icon: '😰', color: 'text-orange-400' },
    { value: 'extreme', label: 'Extreme', icon: '😱', color: 'text-red-400' }
  ];

  const colors = [
    { value: 'from-blue-500 to-purple-500', label: 'Blue-Purple' },
    { value: 'from-green-500 to-blue-500', label: 'Green-Blue' },
    { value: 'from-orange-500 to-red-500', label: 'Orange-Red' },
    { value: 'from-purple-500 to-pink-500', label: 'Purple-Pink' },
    { value: 'from-yellow-500 to-orange-500', label: 'Yellow-Orange' },
    { value: 'from-cyan-500 to-blue-500', label: 'Cyan-Blue' }
  ];

  const icons = [
    '🏃‍♂️', '🚴‍♂️', '🏊‍♂️', '💪', '🥾', '🏔️', '🎯', '🔥', '⚡', '🌟', '🏆', '💎', '🚀', '🌊', '🌲', '🏋️‍♂️'
  ];

  const handleInputChange = (field: keyof ChallengeDraft, value: any) => {
    setChallengeDraft(prev => ({ ...prev, [field]: value }));
  };

  const handleAddRule = () => {
    if (newRule.trim() && !challengeDraft.rules.includes(newRule.trim())) {
      setChallengeDraft(prev => ({
        ...prev,
        rules: [...prev.rules, newRule.trim()]
      }));
      setNewRule('');
    }
  };

  const handleRemoveRule = (index: number) => {
    setChallengeDraft(prev => ({
      ...prev,
      rules: prev.rules.filter((_, i) => i !== index)
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !challengeDraft.tags.includes(newTag.trim())) {
      setChallengeDraft(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setChallengeDraft(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setChallengeDraft(prev => ({
          ...prev,
          image: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!challengeDraft.title || !challengeDraft.description || !challengeDraft.reward) {
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      navigate('/challenges');
    }, 2000);
  };

  const getDaysDuration = () => {
    const start = new Date(challengeDraft.startDate);
    const end = new Date(challengeDraft.endDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays);
  };

  const isFormValid = challengeDraft.title && challengeDraft.description && challengeDraft.reward;

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
                  <h1 className="text-3xl font-bold text-white">Create Challenge</h1>
                  <p className="text-white/60">Design an engaging challenge for the community</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setActiveTab('preview')}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={!isFormValid || isSubmitting}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isSubmitting ? (
                    "Creating..."
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Create Challenge
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {(['basic', 'details', 'rules', 'preview'] as const).map((tab, index) => (
                <div key={tab} className="flex items-center">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300",
                    activeTab === tab 
                      ? "bg-blue-600 text-white" 
                      : index < ['basic', 'details', 'rules', 'preview'].indexOf(activeTab)
                      ? "bg-green-600 text-white"
                      : "bg-white/10 text-white/60"
                  )}>
                    {index < ['basic', 'details', 'rules', 'preview'].indexOf(activeTab) ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < 3 && (
                    <div className={cn(
                      "w-16 h-1 mx-2 transition-all duration-300",
                      index < ['basic', 'details', 'rules', 'preview'].indexOf(activeTab)
                        ? "bg-green-600"
                        : "bg-white/10"
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex space-x-1 bg-white/10 rounded-lg p-1 border border-white/20">
              {(['basic', 'details', 'rules', 'preview'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-300",
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  {tab === 'basic' && 'Basic Info'}
                  {tab === 'details' && 'Details'}
                  {tab === 'rules' && 'Rules & Tags'}
                  {tab === 'preview' && 'Preview'}
                </button>
              ))}
            </div>
          </div>

          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Target className="w-5 h-5 text-blue-400" />
                    <span>Challenge Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-white">Challenge Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter a compelling challenge title..."
                      value={challengeDraft.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-white">Description *</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe your challenge in detail..."
                      value={challengeDraft.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={4}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-white">Category</Label>
                      <Select value={challengeDraft.category} onValueChange={(value) => handleInputChange('category', value)}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          {categories.map((category) => (
                            <SelectItem key={category} value={category} className="text-white">
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty" className="text-white">Difficulty</Label>
                      <Select value={challengeDraft.difficulty} onValueChange={(value) => handleInputChange('difficulty', value as any)}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          {difficulties.map((difficulty) => (
                            <SelectItem key={difficulty.value} value={difficulty.value} className="text-white">
                              <div className="flex items-center space-x-2">
                                <span>{difficulty.icon}</span>
                                <span>{difficulty.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    <span>Goal & Reward</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="goal" className="text-white">Goal Value</Label>
                      <Input
                        id="goal"
                        type="number"
                        placeholder="100"
                        value={challengeDraft.goal}
                        onChange={(e) => handleInputChange('goal', parseInt(e.target.value) || 0)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit" className="text-white">Unit</Label>
                      <Select value={challengeDraft.unit} onValueChange={(value) => handleInputChange('unit', value)}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          {units.map((unit) => (
                            <SelectItem key={unit.value} value={unit.value} className="text-white">
                              {unit.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reward" className="text-white">Reward *</Label>
                      <Input
                        id="reward"
                        placeholder="Exclusive Badge + 500 XP"
                        value={challengeDraft.reward}
                        onChange={(e) => handleInputChange('reward', e.target.value)}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Details Tab */}
          {activeTab === 'details' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-green-400" />
                    <span>Timeline</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-white">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={challengeDraft.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-white">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={challengeDraft.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                        className="bg-white/10 border-white/20 text-white"
                      />
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex items-center space-x-2 text-white/80">
                      <Clock className="w-4 h-4" />
                      <span>Duration: {getDaysDuration()} days</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span>Participation Settings</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants" className="text-white">Maximum Participants (Optional)</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      placeholder="Leave empty for unlimited"
                      value={challengeDraft.maxParticipants || ''}
                      onChange={(e) => handleInputChange('maxParticipants', e.target.value ? parseInt(e.target.value) : undefined)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="isPublic"
                        checked={challengeDraft.isPublic}
                        onChange={(e) => handleInputChange('isPublic', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded"
                      />
                      <Label htmlFor="isPublic" className="text-white">Public Challenge</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="allowInvites"
                        checked={challengeDraft.allowInvites}
                        onChange={(e) => handleInputChange('allowInvites', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded"
                      />
                      <Label htmlFor="allowInvites" className="text-white">Allow Invites</Label>
                    </div>

                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="requireApproval"
                        checked={challengeDraft.requireApproval}
                        onChange={(e) => handleInputChange('requireApproval', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded"
                      />
                      <Label htmlFor="requireApproval" className="text-white">Require Approval to Join</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Image className="w-5 h-5 text-pink-400" />
                    <span>Visual Design</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="color" className="text-white">Color Theme</Label>
                      <Select value={challengeDraft.color} onValueChange={(value) => handleInputChange('color', value)}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          {colors.map((color) => (
                            <SelectItem key={color.value} value={color.value} className="text-white">
                              <div className="flex items-center space-x-2">
                                <div className={`w-4 h-4 rounded bg-gradient-to-r ${color.value}`} />
                                <span>{color.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="icon" className="text-white">Challenge Icon</Label>
                      <Select value={challengeDraft.icon} onValueChange={(value) => handleInputChange('icon', value)}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-white/20">
                          <div className="grid grid-cols-4 gap-2 p-2">
                            {icons.map((icon) => (
                              <SelectItem key={icon} value={icon} className="text-white">
                                <div className="text-2xl p-2 hover:bg-white/10 rounded cursor-pointer">
                                  {icon}
                                </div>
                              </SelectItem>
                            ))}
                          </div>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image" className="text-white">Challenge Image (Optional)</Label>
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        Upload Image
                      </Button>
                      {challengeDraft.image && (
                        <div className="w-20 h-20 rounded-lg overflow-hidden border border-white/20">
                          <img src={challengeDraft.image} alt="Challenge" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Rules & Tags Tab */}
          {activeTab === 'rules' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Flag className="w-5 h-5 text-red-400" />
                    <span>Challenge Rules</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {challengeDraft.rules.map((rule, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg border border-white/10">
                        <div className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-sm flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                        <span className="flex-1 text-white">{rule}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRule(index)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a new rule..."
                      value={newRule}
                      onChange={(e) => setNewRule(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddRule()}
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                    <Button onClick={handleAddRule} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center space-x-2">
                    <Tag className="w-5 h-5 text-green-400" />
                    <span>Tags</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {challengeDraft.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-green-500/20 text-green-400 border-green-500/30"
                      >
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:text-green-300"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>

                  <div className="flex space-x-2">
                    <Input
                      placeholder="Add a new tag..."
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                    />
                    <Button onClick={handleAddTag} className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Preview Tab */}
          {activeTab === 'preview' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <Card className="backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden">
                <div className={`bg-gradient-to-r ${challengeDraft.color} p-8 text-white`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <span className="text-6xl">{challengeDraft.icon}</span>
                        <div>
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm">
                            {challengeDraft.difficulty.charAt(0).toUpperCase() + challengeDraft.difficulty.slice(1)}
                          </Badge>
                          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm ml-2">
                            {challengeDraft.category}
                          </Badge>
                        </div>
                      </div>
                      
                      <h2 className="text-4xl font-bold mb-4">{challengeDraft.title || 'Challenge Title'}</h2>
                      <p className="text-xl text-white/90 leading-relaxed max-w-3xl">
                        {challengeDraft.description || 'Challenge description will appear here...'}
                      </p>
                      
                      <div className="flex items-center space-x-8 mt-6">
                        <div className="flex items-center space-x-2">
                          <Target className="w-5 h-5" />
                          <span className="text-lg font-semibold">{challengeDraft.goal} {challengeDraft.unit}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-5 h-5" />
                          <span className="text-lg font-semibold">{getDaysDuration()} days</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-5 h-5" />
                          <span className="text-lg font-semibold">
                            {challengeDraft.maxParticipants ? `${challengeDraft.maxParticipants} max` : 'Unlimited'} participants
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-6xl mb-2">🏆</div>
                      <p className="text-lg font-semibold">{challengeDraft.reward || 'Reward'}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Challenge Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-white/80">
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span className="text-white">{challengeDraft.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Difficulty:</span>
                      <span className="text-white">{challengeDraft.difficulty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span className="text-white">{getDaysDuration()} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Visibility:</span>
                      <span className="text-white">{challengeDraft.isPublic ? 'Public' : 'Private'}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-md bg-white/5 border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Rules & Tags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="text-white font-medium mb-2">Rules ({challengeDraft.rules.length})</h4>
                      <div className="space-y-2">
                        {challengeDraft.rules.map((rule, index) => (
                          <div key={index} className="text-sm text-white/60">
                            {index + 1}. {rule}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-medium mb-2">Tags ({challengeDraft.tags.length})</h4>
                      <div className="flex flex-wrap gap-2">
                        {challengeDraft.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {!isFormValid && (
                <Card className="backdrop-blur-md bg-red-500/10 border border-red-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 text-red-400">
                      <AlertCircle className="w-5 h-5" />
                      <span>Please complete all required fields before creating the challenge.</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => {
                const tabs = ['basic', 'details', 'rules', 'preview'] as const;
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex > 0) {
                  setActiveTab(tabs[currentIndex - 1]);
                }
              }}
              disabled={activeTab === 'basic'}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Previous
            </Button>

            <Button
              onClick={() => {
                const tabs = ['basic', 'details', 'rules', 'preview'] as const;
                const currentIndex = tabs.indexOf(activeTab);
                if (currentIndex < tabs.length - 1) {
                  setActiveTab(tabs[currentIndex + 1]);
                }
              }}
              disabled={activeTab === 'preview'}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateChallengeScreen;