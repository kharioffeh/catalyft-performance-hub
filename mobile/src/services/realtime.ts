/**
 * Real-time subscriptions service for live data updates
 */

import { RealtimeChannel } from '@supabase/supabase-js';
import { supabaseService, supabase } from './supabase';
import { queryClient, queryKeys } from './queryClient';
import { useStore } from '../store';
import { RealtimePostgresChangesPayload, Tables } from '../types/database';

export class RealtimeService {
  private channels: Map<string, RealtimeChannel> = new Map();
  private userId: string | null = null;
  private isConnected: boolean = false;

  // Initialize real-time service for a user
  async initialize(userId: string) {
    this.userId = userId;
    
    // Set up auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        this.disconnect();
      } else if (event === 'SIGNED_IN' && session?.user) {
        this.userId = session.user.id;
        this.connect();
      }
    });

    // Connect to real-time
    await this.connect();
  }

  // Connect to real-time channels
  async connect() {
    if (!this.userId || this.isConnected) return;

    try {
      // Subscribe to user's workouts
      this.subscribeToWorkouts();
      
      // Subscribe to user's nutrition entries
      this.subscribeToNutrition();
      
      // Subscribe to notifications
      this.subscribeToNotifications();
      
      // Subscribe to friends updates
      this.subscribeTofriends();
      
      // Subscribe to active challenges
      this.subscribeToActiveChallenges();

      this.isConnected = true;
      console.log('Real-time subscriptions connected');
    } catch (error) {
      console.error('Failed to connect real-time subscriptions:', error);
    }
  }

  // Disconnect all real-time channels
  disconnect() {
    this.channels.forEach(channel => {
      channel.unsubscribe();
    });
    this.channels.clear();
    this.isConnected = false;
    this.userId = null;
    console.log('Real-time subscriptions disconnected');
  }

  // Subscribe to workout updates
  private subscribeToWorkouts() {
    if (!this.userId) return;

    const channelName = `workouts:${this.userId}`;
    
    // Unsubscribe if already exists
    this.unsubscribeFromChannel(channelName);

    const channel = supabaseService.subscribeToWorkouts(
      this.userId,
      (payload: RealtimePostgresChangesPayload<Tables<'workouts'>>) => {
        this.handleWorkoutChange(payload);
      }
    );

    this.channels.set(channelName, channel);
  }

  // Subscribe to nutrition updates
  private subscribeToNutrition() {
    if (!this.userId) return;

    const channelName = `nutrition:${this.userId}`;
    
    // Unsubscribe if already exists
    this.unsubscribeFromChannel(channelName);

    const channel = supabaseService.subscribeToNutrition(
      this.userId,
      (payload: RealtimePostgresChangesPayload<Tables<'nutrition_entries'>>) => {
        this.handleNutritionChange(payload);
      }
    );

    this.channels.set(channelName, channel);
  }

  // Subscribe to notifications
  private subscribeToNotifications() {
    if (!this.userId) return;

    const channelName = `notifications:${this.userId}`;
    
    // Unsubscribe if already exists
    this.unsubscribeFromChannel(channelName);

    const channel = supabaseService.subscribeToNotifications(
      this.userId,
      (payload: RealtimePostgresChangesPayload<Tables<'notifications'>>) => {
        this.handleNotificationChange(payload);
      }
    );

    this.channels.set(channelName, channel);
  }

  // Subscribe to friends updates
  private subscribeTofriends() {
    if (!this.userId) return;

    const channelName = `friends:${this.userId}`;
    
    // Unsubscribe if already exists
    this.unsubscribeFromChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        ('postgres_changes' as any),
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Tables<'friends'>>) => {
          this.handleFriendChange(payload);
        }
      )
      .on(
        ('postgres_changes' as any),
        {
          event: '*',
          schema: 'public',
          table: 'friends',
          filter: `friend_id=eq.${this.userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Tables<'friends'>>) => {
          this.handleFriendRequestChange(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
  }

  // Subscribe to active challenges
  private subscribeToActiveChallenges() {
    if (!this.userId) return;

    const channelName = `challenges:${this.userId}`;
    
    // Unsubscribe if already exists
    this.unsubscribeFromChannel(channelName);

    const channel = supabase
      .channel(channelName)
      .on(
        ('postgres_changes' as any),
        {
          event: '*',
          schema: 'public',
          table: 'challenge_participants',
          filter: `user_id=eq.${this.userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Tables<'challenge_participants'>>) => {
          this.handleChallengeParticipantChange(payload);
        }
      )
      .subscribe();

    this.channels.set(channelName, channel);
  }

  // Subscribe to a specific challenge
  subscribeToChallengeUpdates(challengeId: string) {
    const channelName = `challenge:${challengeId}`;
    
    // Unsubscribe if already exists
    this.unsubscribeFromChannel(channelName);

    const channel = supabaseService.subscribeToChallenge(
      challengeId,
      (payload: RealtimePostgresChangesPayload<Tables<'challenge_participants'>>) => {
        this.handleChallengeUpdateChange(payload, challengeId);
      }
    );

    this.channels.set(channelName, channel);
  }

  // Unsubscribe from a specific channel
  unsubscribeFromChannel(channelName: string) {
    const channel = this.channels.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(channelName);
    }
  }

  // Handle workout changes
  private handleWorkoutChange(payload: RealtimePostgresChangesPayload<Tables<'workouts'>>) {
    if (!this.userId) return;

    const { eventType, new: newRecord, old: oldRecord } = payload;

    switch (eventType) {
      case 'INSERT':
        // Invalidate workouts query to include new workout
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.workouts(this.userId) 
        });
        
        // Update store if needed
        const store = useStore.getState();
        if (newRecord) {
          store.setWorkouts([...store.workouts, newRecord as any]);
        }
        break;

      case 'UPDATE':
        // Update specific workout in cache
        if (newRecord) {
          queryClient.setQueryData(
            queryKeys.workout(newRecord.id),
            newRecord
          );
          
          // Update in list
          queryClient.setQueryData(
            queryKeys.workouts(this.userId),
            (old: any[] | undefined) => {
              if (!old) return old;
              return old.map(w => w.id === newRecord.id ? newRecord : w);
            }
          );

          // Update store
          const store = useStore.getState();
          if (store.activeWorkout?.id === newRecord.id) {
            store.setActiveWorkout(newRecord as any);
          }
        }
        break;

      case 'DELETE':
        // Remove from cache
        if (oldRecord) {
          queryClient.removeQueries({ 
            queryKey: queryKeys.workout(oldRecord.id) 
          });
          
          // Remove from list
          queryClient.setQueryData(
            queryKeys.workouts(this.userId),
            (old: any[] | undefined) => {
              if (!old) return old;
              return old.filter(w => w.id !== oldRecord.id);
            }
          );

          // Update store
          const store = useStore.getState();
          store.setWorkouts(store.workouts.filter(w => w.id !== oldRecord.id));
        }
        break;
    }
  }

  // Handle nutrition changes
  private handleNutritionChange(payload: RealtimePostgresChangesPayload<Tables<'nutrition_entries'>>) {
    if (!this.userId) return;

    const { eventType, new: newRecord } = payload;

    switch (eventType) {
      case 'INSERT':
      case 'UPDATE':
        // Invalidate nutrition queries
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.nutritionToday(this.userId) 
        });
        
        if (newRecord) {
          // Update specific entry
          queryClient.setQueryData(
            queryKeys.nutritionEntry(newRecord.id),
            newRecord
          );

          // Update store if it's today's entry
          const today = new Date();
          const entryDate = new Date(newRecord.date);
          if (
            entryDate.getDate() === today.getDate() &&
            entryDate.getMonth() === today.getMonth() &&
            entryDate.getFullYear() === today.getFullYear()
          ) {
            const store = useStore.getState();
            store.setCurrentEntry(newRecord as any);
          }
        }
        break;

      case 'DELETE':
        // Invalidate nutrition queries
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.nutritionToday(this.userId) 
        });
        break;
    }
  }

  // Handle notification changes
  private handleNotificationChange(payload: RealtimePostgresChangesPayload<Tables<'notifications'>>) {
    if (!this.userId) return;

    const { eventType, new: newRecord } = payload;

    if (eventType === 'INSERT' && newRecord) {
      // Add to notifications in store
      const store = useStore.getState();
      useStore.setState({ notifications: [newRecord as any, ...store.notifications] });
      useStore.setState({ unreadNotificationCount: store.unreadNotificationCount + 1 });

      // Invalidate notifications query
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.userNotifications(this.userId) 
      });

      // Show push notification if enabled
      this.showPushNotification(newRecord);
    }
  }

  // Handle friend changes
  private handleFriendChange(payload: RealtimePostgresChangesPayload<Tables<'friends'>>) {
    if (!this.userId) return;

    // Invalidate friends query
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.userFriends(this.userId) 
    });

    // Reload friends in store
    const store = useStore.getState();
    store.loadFriends();
  }

  // Handle friend request changes
  private handleFriendRequestChange(payload: RealtimePostgresChangesPayload<Tables<'friends'>>) {
    if (!this.userId) return;

    const { eventType, new: newRecord } = payload;

    if (eventType === 'INSERT' && newRecord && newRecord.status === 'pending') {
      // Create notification for friend request
      const notification = {
        type: 'friend_request',
        title: 'New Friend Request',
        message: 'You have a new friend request',
        data: { friendRequestId: newRecord.id },
      };

      // Add to store
      const store = useStore.getState();
      useStore.setState({ notifications: [notification as any, ...store.notifications] });
      useStore.setState({ unreadNotificationCount: store.unreadNotificationCount + 1 });
    }
  }

  // Handle challenge participant changes
  private handleChallengeParticipantChange(
    payload: RealtimePostgresChangesPayload<Tables<'challenge_participants'>>
  ) {
    if (!this.userId) return;

    // Invalidate user challenges query
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.userChallenges(this.userId) 
    });
  }

  // Handle challenge update changes
  private handleChallengeUpdateChange(
    payload: RealtimePostgresChangesPayload<Tables<'challenge_participants'>>,
    challengeId: string
  ) {
    // Invalidate challenge query
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.challenge(challengeId) 
    });

    // Update leaderboard if visible
    const { eventType, new: newRecord } = payload;
    if (eventType === 'UPDATE' && newRecord) {
      // Could trigger UI update for leaderboard
      console.log('Challenge participant updated:', newRecord);
    }
  }

  // Show push notification
  private async showPushNotification(notification: Tables<'notifications'>) {
    // Implementation would depend on push notification service
    // This is a placeholder
    console.log('New notification:', notification.title);
  }

  // Presence tracking for multiplayer features
  async trackPresence(status: 'online' | 'away' | 'offline') {
    if (!this.userId) return;

    const channel = supabase.channel('presence');
    
    await channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        console.log('Presence state:', state);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('User joined:', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('User left:', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: this.userId,
            status,
            last_seen: new Date().toISOString(),
          });
        }
      });

    this.channels.set('presence', channel);
  }

  // Broadcast events for real-time collaboration
  async broadcastEvent(event: string, payload: any) {
    const channel = this.channels.get('presence');
    if (channel) {
      await channel.send({
        type: 'broadcast',
        event,
        payload,
      });
    }
  }
}

// Export singleton instance
export const realtimeService = new RealtimeService();

// Hook for using real-time service in components
import { useEffect } from 'react';

export const useRealtime = () => {
  const currentUser = useStore(state => state.currentUser);

  useEffect(() => {
    if (currentUser) {
      realtimeService.initialize(currentUser.id);
    } else {
      realtimeService.disconnect();
    }

    return () => {
      // Cleanup on unmount
      realtimeService.disconnect();
    };
  }, [currentUser?.id]);
};

// Hook for subscribing to specific challenge
export const useChallengeRealtime = (challengeId: string | null) => {
  useEffect(() => {
    if (challengeId) {
      realtimeService.subscribeToChallengeUpdates(challengeId);

      return () => {
        realtimeService.unsubscribeFromChannel(`challenge:${challengeId}`);
      };
    }
  }, [challengeId]);
};

// Hook for presence tracking
export const usePresence = () => {
  useEffect(() => {
    realtimeService.trackPresence('online');

    // Track when user goes away
    const handleVisibilityChange = () => {
      if (document.hidden) {
        realtimeService.trackPresence('away');
      } else {
        realtimeService.trackPresence('online');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      realtimeService.trackPresence('offline');
    };
  }, []);
};