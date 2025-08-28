import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MapPin, 
  Clock, 
  Flame,
  Trophy,
  Users,
  ArrowLeft,
  MoreHorizontal,
  Send,
  Flag,
  Bookmark,
  BookmarkPlus,
  Calendar,
  Target,
  TrendingUp,
  Award,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useParams, useNavigate } from 'react-router-dom';

interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  replies?: Comment[];
}

interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  userLocation?: string;
  userVerified: boolean;
  userPremium: boolean;
  content: string;
  mediaUrl?: string;
  mediaType: 'image' | 'video';
  workoutStats?: {
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
  };
  location?: string;
  route?: string;
  achievements: string[];
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isBookmarked: boolean;
  isFollowing: boolean;
  timestamp: string;
  commentsList: Comment[];
}

const PostDetailScreen: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [liking, setLiking] = useState(false);
  const [bookmarking, setBookmarking] = useState(false);

  // Mock data for demo
  useEffect(() => {
    const generateMockPost = () => {
      const mockPost: Post = {
        id: postId || '1',
        userId: 'user-1',
        userName: 'Sarah Johnson',
        userAvatar: undefined,
        userLocation: 'San Francisco, CA',
        userVerified: true,
        userPremium: true,
        content: 'Just completed an amazing morning run through Golden Gate Park! The weather was perfect and I managed to set a new personal best for my 10K route. Feeling energized and ready to tackle the day ahead. 🏃‍♀️💪',
        mediaUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
        mediaType: 'image',
        workoutStats: {
          type: 'run',
          distance: 10.5,
          duration: 3600,
          calories: 750,
          pace: '5:42',
          elevation: 125,
          heartRate: {
            avg: 145,
            max: 168
          }
        },
        location: 'Golden Gate Park, San Francisco',
        route: 'Morning Loop Trail',
        achievements: ['Personal Best', 'New Route', '10K Club'],
        likes: 47,
        comments: 12,
        shares: 3,
        isLiked: true,
        isBookmarked: false,
        isFollowing: true,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        commentsList: [
          {
            id: 'comment-1',
            userId: 'user-2',
            userName: 'Mike Chen',
            content: 'Great job Sarah! That pace is impressive. How did you feel during the run?',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            likes: 8,
            isLiked: false
          },
          {
            id: 'comment-2',
            userId: 'user-3',
            userName: 'Emma Rodriguez',
            content: 'Love that route! The views must have been amazing this morning.',
            timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            likes: 5,
            isLiked: true
          },
          {
            id: 'comment-3',
            userId: 'user-4',
            userName: 'David Kim',
            content: 'New PB! 🎉 What\'s your next goal?',
            timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            likes: 12,
            isLiked: false,
            replies: [
              {
                id: 'reply-1',
                userId: 'user-1',
                userName: 'Sarah Johnson',
                content: 'Thanks David! Next goal is to break 55 minutes for the 10K. Working on my speed work!',
                timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
                likes: 6,
                isLiked: false
              }
            ]
          }
        ]
      };

      setPost(mockPost);
      setLoading(false);
    };

    generateMockPost();
  }, [postId]);

  const handleLike = async () => {
    if (!post || liking) return;
    
    setLiking(true);
    setTimeout(() => {
      setPost(prev => prev ? {
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
      } : null);
      setLiking(false);
    }, 300);
  };

  const handleBookmark = async () => {
    if (!post || bookmarking) return;
    
    setBookmarking(true);
    setTimeout(() => {
      setPost(prev => prev ? {
        ...prev,
        isBookmarked: !prev.isBookmarked
      } : null);
      setBookmarking(false);
    }, 300);
  };

  const handleComment = async () => {
    if (!commentText.trim() || !post) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      content: commentText,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setPost(prev => prev ? {
      ...prev,
      comments: prev.comments + 1,
      commentsList: [newComment, ...prev.commentsList]
    } : null);

    setCommentText('');
  };

  const handleReply = async (commentId: string) => {
    if (!replyText.trim() || !post) return;

    const newReply: Comment = {
      id: `reply-${Date.now()}`,
      userId: 'current-user',
      userName: 'You',
      content: replyText,
      timestamp: new Date().toISOString(),
      likes: 0,
      isLiked: false
    };

    setPost(prev => prev ? {
      ...prev,
      commentsList: prev.commentsList.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      )
    } : null);

    setReplyText('');
    setReplyingTo(null);
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

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffMs = now.getTime() - postTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return postTime.toLocaleDateString();
  };

  if (loading || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center text-white/90">Loading post...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="text-white/70 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>

          {/* Post Card */}
          <Card className="backdrop-blur-md bg-white/5 border border-white/10 overflow-hidden mb-6">
            {/* Post Header */}
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={post.userAvatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-semibold">
                      {post.userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold">{post.userName}</h3>
                      {post.userVerified && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                          ✓
                        </Badge>
                      )}
                      {post.userPremium && (
                        <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                          <Star className="w-3 h-3" />
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-white/60 text-sm">
                      {post.userLocation && (
                        <>
                          <MapPin className="w-4 h-4" />
                          <span>{post.userLocation}</span>
                        </>
                      )}
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(post.timestamp)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBookmark}
                    disabled={bookmarking}
                    className={cn(
                      "text-white/60 hover:text-white",
                      post.isBookmarked && "text-yellow-400"
                    )}
                  >
                    {post.isBookmarked ? <Bookmark className="w-4 h-4" /> : <BookmarkPlus className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white"
                  >
                    <MoreHorizontal className="w-4 h-4" />
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
                    {post.workoutStats.distance && (
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">
                          {post.workoutStats.distance}km
                        </div>
                        <div className="text-white/60 text-xs">Distance</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-white font-bold text-lg">
                        {formatDuration(post.workoutStats.duration)}
                      </div>
                      <div className="text-white/60 text-xs">Duration</div>
                    </div>
                    <div className="text-center">
                      <div className="text-white font-bold text-lg">
                        {post.workoutStats.calories}
                      </div>
                      <div className="text-white/60 text-xs">Calories</div>
                    </div>
                    {post.workoutStats.pace && (
                      <div className="text-center">
                        <div className="text-white font-bold text-lg">
                          {post.workoutStats.pace}
                        </div>
                        <div className="text-white/60 text-xs">Pace</div>
                      </div>
                    )}
                  </div>

                  {/* Additional Stats */}
                  {(post.workoutStats.heartRate || post.workoutStats.power) && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="grid grid-cols-2 gap-4">
                        {post.workoutStats.heartRate && (
                          <div className="text-center">
                            <div className="text-white font-bold text-sm">
                              {post.workoutStats.heartRate.avg} bpm avg
                            </div>
                            <div className="text-white/60 text-xs">
                              {post.workoutStats.heartRate.max} bpm max
                            </div>
                          </div>
                        )}
                        {post.workoutStats.power && (
                          <div className="text-center">
                            <div className="text-white font-bold text-sm">
                              {post.workoutStats.power.avg}w avg
                            </div>
                            <div className="text-white/60 text-xs">
                              {post.workoutStats.power.max}w max
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Post Content */}
            <div className="px-6 pb-4">
              <p className="text-white/90 text-sm leading-relaxed mb-4">
                {post.content}
              </p>
            </div>

            {/* Media */}
            {post.mediaUrl && (
              <div className="px-6 pb-4">
                <div className="rounded-xl overflow-hidden">
                  {post.mediaType === 'video' ? (
                    <video 
                      src={post.mediaUrl}
                      className="w-full max-h-[400px] object-cover"
                      controls
                      preload="metadata"
                    />
                  ) : (
                    <img 
                      src={post.mediaUrl}
                      alt="Post media"
                      className="w-full max-h-[400px] object-cover"
                    />
                  )}
                </div>
              </div>
            )}

            {/* Achievements */}
            {post.achievements.length > 0 && (
              <div className="px-6 pb-4">
                <div className="flex flex-wrap gap-2">
                  {post.achievements.map((achievement, i) => (
                    <Badge key={i} variant="secondary" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                      <Trophy className="w-3 h-3 mr-1" />
                      {achievement}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action Bar */}
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    disabled={liking}
                    className={cn(
                      "flex items-center space-x-2",
                      post.isLiked 
                        ? "text-red-400 hover:text-red-300" 
                        : "text-white/60 hover:text-white"
                    )}
                  >
                    <Heart className={cn("w-5 h-5", post.isLiked && "fill-current")} />
                    <span>{post.likes}</span>
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

          {/* Comments Section */}
          <Card className="backdrop-blur-md bg-white/5 border border-white/10">
            <CardHeader>
              <CardTitle className="text-white">Comments ({post.comments})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Comment */}
              <div className="flex space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">Y</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none"
                    rows={2}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      onClick={handleComment}
                      disabled={!commentText.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Comment
                    </Button>
                  </div>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                <AnimatePresence>
                  {post.commentsList.slice(0, showAllComments ? undefined : 3).map((comment, index) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                      <div className="flex space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-white/10 text-white text-xs">
                            {comment.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-white/5 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white font-medium text-sm">{comment.userName}</span>
                              <span className="text-white/60 text-xs">{formatTimeAgo(comment.timestamp)}</span>
                            </div>
                            <p className="text-white/90 text-sm mb-2">{comment.content}</p>
                            <div className="flex items-center space-x-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-white/60 hover:text-white text-xs"
                              >
                                <Heart className="w-3 h-3 mr-1" />
                                {comment.likes}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                                className="text-white/60 hover:text-white text-xs"
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>

                          {/* Reply Input */}
                          {replyingTo === comment.id && (
                            <div className="mt-3 ml-6">
                              <div className="flex space-x-2">
                                <Textarea
                                  placeholder="Write a reply..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40 resize-none text-sm"
                                  rows={1}
                                />
                                <Button
                                  size="sm"
                                  onClick={() => handleReply(comment.id)}
                                  disabled={!replyText.trim()}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <Send className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 ml-6 space-y-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex space-x-3">
                                  <Avatar className="h-6 w-6">
                                    <AvatarFallback className="bg-white/10 text-white text-xs">
                                      {reply.userName.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1">
                                    <div className="bg-white/5 rounded-lg p-2">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-white font-medium text-xs">{reply.userName}</span>
                                        <span className="text-white/60 text-xs">{formatTimeAgo(reply.timestamp)}</span>
                                      </div>
                                      <p className="text-white/90 text-xs">{reply.content}</p>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-white/60 hover:text-white text-xs mt-1"
                                      >
                                        <Heart className="w-3 h-3 mr-1" />
                                        {reply.likes}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Show More/Less Comments */}
                {post.commentsList.length > 3 && (
                  <div className="text-center">
                    <Button
                      variant="ghost"
                      onClick={() => setShowAllComments(!showAllComments)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      {showAllComments ? (
                        <>
                          <ChevronUp className="w-4 h-4 mr-2" />
                          Show Less
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-4 h-4 mr-2" />
                          Show {post.commentsList.length - 3} More Comments
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PostDetailScreen;