/**
 * Real-time Social Features Service
 * Handles live updates for social interactions using Supabase subscriptions
 */

import { supabase } from './supabase';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { ActivityPost, Comment, SocialNotification } from '../types/social';

export class RealtimeSocialService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private listeners: Map<string, Function[]> = new Map();

  /**
   * Subscribe to activity feed updates
   */
  subscribeFeedUpdates(
    userId: string,
    onNewPost: (post: ActivityPost) => void,
    onPostUpdate: (post: ActivityPost) => void,
    onPostDelete: (postId: string) => void
  ): () => void {
    const channelName = `feed:${userId}`;
    
    // Clean up existing subscription
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed',
          filter: `visibility=eq.public`,
        },
        (payload: RealtimePostgresChangesPayload<ActivityPost>) => {
          if (payload.new) {
            onNewPost(payload.new as ActivityPost);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'activity_feed',
        },
        (payload: RealtimePostgresChangesPayload<ActivityPost>) => {
          if (payload.new) {
            onPostUpdate(payload.new as ActivityPost);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'activity_feed',
        },
        (payload: RealtimePostgresChangesPayload<ActivityPost>) => {
          if (payload.old) {
            onPostDelete((payload.old as ActivityPost).id);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);

    // Return unsubscribe function
    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to post comments in real-time
   */
  subscribePostComments(
    postId: string,
    onNewComment: (comment: Comment) => void,
    onCommentUpdate: (comment: Comment) => void,
    onCommentDelete: (commentId: string) => void
  ): () => void {
    const channelName = `comments:${postId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload: RealtimePostgresChangesPayload<Comment>) => {
          if (payload.new) {
            onNewComment(payload.new as Comment);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload: RealtimePostgresChangesPayload<Comment>) => {
          if (payload.new) {
            onCommentUpdate(payload.new as Comment);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        (payload: RealtimePostgresChangesPayload<Comment>) => {
          if (payload.old) {
            onCommentDelete((payload.old as Comment).id);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to user notifications
   */
  subscribeNotifications(
    userId: string,
    onNewNotification: (notification: SocialNotification) => void
  ): () => void {
    const channelName = `notifications:${userId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'social_notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<SocialNotification>) => {
          if (payload.new) {
            onNewNotification(payload.new as SocialNotification);
          }
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to challenge updates
   */
  subscribeChallengeUpdates(
    challengeId: string,
    onUpdate: (update: any) => void
  ): () => void {
    const channelName = `challenge:${challengeId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants',
          filter: `challenge_id=eq.${challengeId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          onUpdate(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to leaderboard updates
   */
  subscribeLeaderboardUpdates(
    category: string,
    onUpdate: (leaderboard: any[]) => void
  ): () => void {
    const channelName = `leaderboard:${category}`;
    
    this.unsubscribe(channelName);

    // For leaderboard, we'll use a custom broadcast channel
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'leaderboard_update' }, (payload) => {
        onUpdate(payload.payload.leaderboard);
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.unsubscribe(channelName);
  }

  /**
   * Subscribe to user presence (online/offline status)
   */
  subscribePresence(
    userId: string,
    onPresenceChange: (presence: { userId: string; isOnline: boolean }) => void
  ): () => void {
    const channelName = `presence:${userId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase.channel(channelName);
    
    // Track presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        Object.keys(state).forEach(key => {
          const presences = state[key] as any[];
          presences.forEach(presence => {
            onPresenceChange({
              userId: presence.user_id,
              isOnline: true,
            });
          });
        });
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        newPresences.forEach((presence: any) => {
          onPresenceChange({
            userId: presence.user_id,
            isOnline: true,
          });
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        leftPresences.forEach((presence: any) => {
          onPresenceChange({
            userId: presence.user_id,
            isOnline: false,
          });
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId });
        }
      });

    this.channels.set(channelName, channel);
    return () => this.unsubscribe(channelName);
  }

  /**
   * Broadcast typing indicator for comments
   */
  async broadcastTyping(
    postId: string,
    userId: string,
    isTyping: boolean
  ): Promise<void> {
    const channel = supabase.channel(`typing:${postId}`);
    
    await channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userId,
        isTyping,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Subscribe to typing indicators
   */
  subscribeTypingIndicators(
    postId: string,
    onTypingChange: (typing: { userId: string; isTyping: boolean }) => void
  ): () => void {
    const channelName = `typing:${postId}`;
    
    this.unsubscribe(channelName);

    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event: 'typing' }, (payload) => {
        onTypingChange({
          userId: payload.payload.userId,
          isTyping: payload.payload.isTyping,
        });
      })
      .subscribe();

    this.channels.set(channelName, channel);
    return () => this.unsubscribe(channelName);
  }

  /**
   * Unsubscribe from a channel
   */
  private async unsubscribe(channelName: string): Promise<void> {
    const channel = this.channels.get(channelName);
    if (channel) {
      await channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  /**
   * Unsubscribe from all channels
   */
  async unsubscribeAll(): Promise<void> {
    const unsubscribePromises = Array.from(this.channels.keys()).map(
      channelName => this.unsubscribe(channelName)
    );
    await Promise.all(unsubscribePromises);
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    // Check if any channel is subscribed
    for (const channel of this.channels.values()) {
      if (channel.state === 'joined') {
        return 'connected';
      }
    }
    return 'disconnected';
  }
}

// Export singleton instance
export const realtimeSocial = new RealtimeSocialService();