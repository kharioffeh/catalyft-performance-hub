import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface FeedPost {
  id: string;
  user_id: string;
  session_id?: string;
  media_url?: string;
  caption?: string;
  created_at: string;
  profile: {
    avatar?: string;
    name: string;
  };
  reactions: {
    like: number;
    cheer: number;
  };
}

interface FeedCardProps {
  post: FeedPost;
  onReactionUpdate?: (postId: string, reactions: { like: number; cheer: number }) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({ post, onReactionUpdate }) => {
  const [reactions, setReactions] = useState(post.reactions);
  const [isReacting, setIsReacting] = useState(false);

  const handleReaction = async (type: 'like' | 'cheer') => {
    if (isReacting) return;
    
    setIsReacting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('reactPost', {
        body: { post_id: post.id, type }
      });

      if (error) throw error;

      const newReactions = data.reactions;
      setReactions(newReactions);
      onReactionUpdate?.(post.id, newReactions);

      toast({
        title: data.action === 'added' ? 'Reaction added!' : 'Reaction removed',
        description: `You ${data.action} a ${type} reaction`,
      });
    } catch (error) {
      console.error('Error reacting to post:', error);
      toast({
        title: 'Error',
        description: 'Failed to react to post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsReacting(false);
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const getAvatarFallback = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl p-4 drop-shadow-lg">
      {/* Header */}
      <div className="flex items-center mb-3">
        <div className="w-8 h-8 rounded-full bg-brand-blue/20 border border-brand-blue/30 flex items-center justify-center text-brand-blue text-xs font-semibold mr-3">
          {post.profile.avatar ? (
            <img 
              src={post.profile.avatar} 
              alt={post.profile.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            getAvatarFallback(post.profile.name)
          )}
        </div>
        <div className="flex-1">
          <p className="text-white font-medium text-sm">{post.profile.name}</p>
          <p className="text-white/60 text-xs">{formatTimeAgo(post.created_at)}</p>
        </div>
      </div>

      {/* Media */}
      {post.media_url && (
        <div className="mb-3 rounded-xl overflow-hidden">
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
      )}

      {/* Caption */}
      {post.caption && (
        <div className="mb-4">
          <p className="text-white/90 text-sm prose prose-invert max-w-none">
            {post.caption}
          </p>
        </div>
      )}

      {/* Reactions Bar */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => handleReaction('like')}
          disabled={isReacting}
          className="bg-white/10 hover:bg-white/20 text-brand-blue px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          👍 {reactions.like}
        </button>
        <button
          onClick={() => handleReaction('cheer')}
          disabled={isReacting}
          className="bg-white/10 hover:bg-white/20 text-brand-blue px-3 py-1 rounded-full text-sm font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          🎉 {reactions.cheer}
        </button>
      </div>
    </div>
  );
};