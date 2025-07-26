import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { formatDistanceToNow } from 'date-fns';

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
  
  // Animation refs for mobile
  const likeRef = useRef<any>(null);
  const cheerRef = useRef<any>(null);
  const likeCountRef = useRef<any>(null);
  const cheerCountRef = useRef<any>(null);

  const handleReaction = async (type: 'like' | 'cheer') => {
    if (isReacting) return;
    
    setIsReacting(true);
    
    // Trigger button animation
    if (type === 'like' && likeRef.current) {
      likeRef.current.animate('pulse', 500);
    } else if (type === 'cheer' && cheerRef.current) {
      cheerRef.current.animate('pulse', 500);
    }
    
    try {
      // Simulate API call - replace with actual API call
      const response = await fetch('/api/react-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: post.id, type })
      });
      
      const data = await response.json();
      const newReactions = data.reactions;
      
      setReactions(newReactions);
      onReactionUpdate?.(post.id, newReactions);
      
      // Trigger count animation
      if (type === 'like' && likeCountRef.current) {
        likeCountRef.current.animate('fadeIn', 300);
      } else if (type === 'cheer' && cheerCountRef.current) {
        cheerCountRef.current.animate('fadeIn', 300);
      }
      
    } catch (error) {
      console.error('Error reacting to post:', error);
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
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          {post.profile.avatar ? (
            <Image 
              source={{ uri: post.profile.avatar }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={styles.avatarText}>
              {getAvatarFallback(post.profile.name)}
            </Text>
          )}
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.profile.name}</Text>
          <Text style={styles.timeAgo}>{formatTimeAgo(post.created_at)}</Text>
        </View>
      </View>

      {/* Media */}
      {post.media_url && (
        <View style={styles.mediaContainer}>
          <Image 
            source={{ uri: post.media_url }}
            style={styles.mediaImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Caption */}
      {post.caption && (
        <View style={styles.captionContainer}>
          <Text style={styles.captionText}>{post.caption}</Text>
        </View>
      )}

      {/* Reactions Bar */}
      <View style={styles.reactionsContainer}>
        <Animatable.View ref={likeRef}>
          <TouchableOpacity
            onPress={() => handleReaction('like')}
            disabled={isReacting}
            style={[styles.reactionButton, isReacting && styles.reactionButtonDisabled]}
          >
            <Text style={styles.reactionEmoji}>👍</Text>
            <Animatable.Text 
              ref={likeCountRef}
              key={reactions.like}
              style={styles.reactionCount}
            >
              {reactions.like}
            </Animatable.Text>
          </TouchableOpacity>
        </Animatable.View>
        
        <Animatable.View ref={cheerRef}>
          <TouchableOpacity
            onPress={() => handleReaction('cheer')}
            disabled={isReacting}
            style={[styles.reactionButton, isReacting && styles.reactionButtonDisabled]}
          >
            <Text style={styles.reactionEmoji}>🎉</Text>
            <Animatable.Text 
              ref={cheerCountRef}
              key={reactions.cheer}
              style={styles.reactionCount}
            >
              {reactions.cheer}
            </Animatable.Text>
          </TouchableOpacity>
        </Animatable.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(125, 249, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(125, 249, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarText: {
    color: '#7DF9FF',
    fontSize: 10,
    fontWeight: '600',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  timeAgo: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 12,
  },
  mediaContainer: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mediaImage: {
    width: '100%',
    height: 200,
  },
  captionContainer: {
    marginBottom: 16,
  },
  captionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  reactionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  reactionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reactionButtonDisabled: {
    opacity: 0.5,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  reactionCount: {
    color: '#7DF9FF',
    fontSize: 14,
    fontWeight: '600',
  },
});