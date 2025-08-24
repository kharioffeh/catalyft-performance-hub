/**
 * Social service for Catalyft fitness app
 * Handles all social features including profiles, activity feed, challenges, etc.
 */

import { supabase } from './supabase';
import {
  UserProfile,
  Follow,
  ActivityPost,
  Comment,
  Reaction,
  Challenge,
  ChallengeParticipant,
  LeaderboardEntry,
  Achievement,
  SocialNotification,
  PrivacySettings,
  UserSearchResult,
} from '../types/social';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

class SocialService {
  private readonly CACHE_PREFIX = '@social_cache_';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Profile Methods
  async getUserProfile(userId: string): Promise<UserProfile> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user:users!user_profiles_user_id_fkey(
            id,
            email,
            username,
            full_name
          )
        `)
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      // Get follow counts
      const [followersCount, followingCount] = await Promise.all([
        this.getFollowersCount(userId),
        this.getFollowingCount(userId),
      ]);

      // Get posts count
      const { count: postsCount } = await supabase
        .from('activity_feed')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);

      // Check if current user
      const { data: { user } } = await supabase.auth.getUser();
      const isCurrentUser = user?.id === userId;

      return {
        ...data,
        followersCount,
        followingCount,
        postsCount: postsCount || 0,
        isCurrentUser,
      };
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  async uploadProfilePicture(uri: string): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileName = `${user.id}/profile-${Date.now()}.jpg`;
      const formData = new FormData();
      
      formData.append('file', {
        uri,
        type: 'image/jpeg',
        name: fileName,
      } as any);

      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, formData);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading profile picture:', error);
      throw error;
    }
  }

  async updateProfileStats(stats: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('user_profiles')
        .update(stats)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating profile stats:', error);
      throw error;
    }
  }

  // Follow System Methods
  async followUser(targetUserId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
        });

      if (error) throw error;

      // Create notification
      await this.createNotification(targetUserId, 'follow', {
        fromUserId: user.id,
      });
    } catch (error: any) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(targetUserId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  async getFollowers(userId?: string): Promise<Follow[]> {
    try {
      const targetUserId = userId || (await this.getCurrentUserId());
      
      const { data, error } = await supabase
        .from('follows')
        .select(`
          *,
          follower:users!follows_follower_id_fkey(
            id,
            username,
            full_name,
            profile_picture
          )
        `)
        .eq('following_id', targetUserId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching followers:', error);
      throw error;
    }
  }

  async getFollowing(userId?: string): Promise<Follow[]> {
    try {
      const targetUserId = userId || (await this.getCurrentUserId());
      
      const { data, error } = await supabase
        .from('follows')
        .select(`
          *,
          following:users!follows_following_id_fkey(
            id,
            username,
            full_name,
            profile_picture
          )
        `)
        .eq('follower_id', targetUserId);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching following:', error);
      throw error;
    }
  }

  async getFollowersCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('following_id', userId);
    
    return count || 0;
  }

  async getFollowingCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('follows')
      .select('*', { count: 'exact', head: true })
      .eq('follower_id', userId);
    
    return count || 0;
  }

  async getSuggestedUsers(): Promise<UserProfile[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get users not followed by current user
      const { data, error } = await supabase
        .rpc('get_suggested_users', {
          current_user_id: user.id,
          limit_count: 10,
        });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching suggested users:', error);
      throw error;
    }
  }

  async searchUsers(query: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Activity Feed Methods
  async getActivityFeed(page: number = 1, limit: number = 20): Promise<ActivityPost[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const offset = (page - 1) * limit;

      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user:user_profiles!activity_feed_user_id_fkey(
            id,
            username,
            full_name,
            profile_picture
          ),
          likes:reactions(count),
          comments(count)
        `)
        .in('user_id', await this.getFollowingIds(user.id))
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Check if current user liked each post
      const postsWithLikes = await Promise.all(
        (data || []).map(async (post) => {
          const isLiked = await this.isPostLiked(post.id, user.id);
          return {
            ...post,
            isLiked,
            likesCount: post.likes?.[0]?.count || 0,
            commentsCount: post.comments?.[0]?.count || 0,
          };
        })
      );

      return postsWithLikes;
    } catch (error: any) {
      console.error('Error fetching activity feed:', error);
      throw error;
    }
  }

  async getUserPosts(userId: string): Promise<ActivityPost[]> {
    try {
      const { data, error } = await supabase
        .from('activity_feed')
        .select(`
          *,
          user:user_profiles!activity_feed_user_id_fkey(
            id,
            username,
            full_name,
            profile_picture
          ),
          likes:reactions(count),
          comments(count)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  }

  async createPost(post: Partial<ActivityPost>): Promise<ActivityPost> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('activity_feed')
        .insert({
          ...post,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async deletePost(postId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('activity_feed')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  async shareWorkout(workoutId: string, caption?: string): Promise<ActivityPost> {
    try {
      // Get workout details
      const { data: workout } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', workoutId)
        .single();

      if (!workout) throw new Error('Workout not found');

      const workoutSummary = {
        workoutId,
        name: workout.name,
        duration: workout.duration,
        exercises: workout.exercises?.length || 0,
        caloriesBurned: workout.calories_burned || 0,
        muscleGroups: workout.muscle_groups || [],
        intensity: workout.intensity || 'medium',
      };

      return this.createPost({
        type: 'workout',
        content: caption,
        workoutData: workoutSummary,
      });
    } catch (error: any) {
      console.error('Error sharing workout:', error);
      throw error;
    }
  }

  async shareMeal(mealId: string, caption?: string, imageUrl?: string): Promise<ActivityPost> {
    try {
      // Get meal details
      const { data: meal } = await supabase
        .from('meals')
        .select('*')
        .eq('id', mealId)
        .single();

      if (!meal) throw new Error('Meal not found');

      const mealSummary = {
        mealId,
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fats: meal.fats,
        mealType: meal.meal_type,
      };

      return this.createPost({
        type: 'meal',
        content: caption,
        mealData: mealSummary,
        images: imageUrl ? [imageUrl] : undefined,
      });
    } catch (error: any) {
      console.error('Error sharing meal:', error);
      throw error;
    }
  }

  async shareAchievement(achievementId: string, caption?: string): Promise<ActivityPost> {
    try {
      const achievement = await this.getAchievement(achievementId);
      
      const achievementData = {
        achievementId,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        rarity: achievement.rarity,
      };

      return this.createPost({
        type: 'achievement',
        content: caption || `I just unlocked: ${achievement.name}! 🏆`,
        achievementData,
      });
    } catch (error: any) {
      console.error('Error sharing achievement:', error);
      throw error;
    }
  }

  // Engagement Methods
  async likePost(postId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          type: 'like',
        });

      if (error) throw error;

      // Create notification for post owner
      const { data: post } = await supabase
        .from('activity_feed')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (post && post.user_id !== user.id) {
        await this.createNotification(post.user_id, 'like', {
          fromUserId: user.id,
          postId,
        });
      }
    } catch (error: any) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async unlikePost(postId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('type', 'like');

      if (error) throw error;
    } catch (error: any) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  async addReaction(postId: string, type: string): Promise<Reaction> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Remove existing reaction if any
      await this.removeReaction(postId);

      const { data, error } = await supabase
        .from('reactions')
        .insert({
          post_id: postId,
          user_id: user.id,
          type,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  async removeReaction(postId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id);

      if (error && error.code !== 'PGRST116') throw error; // Ignore "no rows" error
    } catch (error: any) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_profiles!comments_user_id_fkey(
            id,
            username,
            full_name,
            profile_picture
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organize nested comments
      const comments = data || [];
      const rootComments = comments.filter(c => !c.parent_id);
      const commentMap = new Map(comments.map(c => [c.id, c]));

      rootComments.forEach(comment => {
        comment.replies = comments.filter(c => c.parent_id === comment.id);
      });

      return rootComments;
    } catch (error: any) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async addComment(postId: string, text: string, parentId?: string): Promise<Comment> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          text,
          parent_id: parentId,
        })
        .select(`
          *,
          user:user_profiles!comments_user_id_fkey(
            id,
            username,
            full_name,
            profile_picture
          )
        `)
        .single();

      if (error) throw error;

      // Create notification for post owner
      const { data: post } = await supabase
        .from('activity_feed')
        .select('user_id')
        .eq('id', postId)
        .single();

      if (post && post.user_id !== user.id) {
        await this.createNotification(post.user_id, 'comment', {
          fromUserId: user.id,
          postId,
        });
      }

      return data;
    } catch (error: any) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Challenge Methods
  async getChallenges(): Promise<Challenge[]> {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select(`
          *,
          creator:user_profiles!challenges_creator_id_fkey(
            id,
            username,
            full_name,
            profile_picture
          ),
          participants:challenge_participants(count)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching challenges:', error);
      throw error;
    }
  }

  async getUserChallenges(): Promise<Challenge[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          challenge:challenges(
            *,
            creator:user_profiles!challenges_creator_id_fkey(
              id,
              username,
              full_name,
              profile_picture
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      return data?.map(d => d.challenge) || [];
    } catch (error: any) {
      console.error('Error fetching user challenges:', error);
      throw error;
    }
  }

  async createChallenge(challenge: Partial<Challenge>): Promise<Challenge> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('challenges')
        .insert({
          ...challenge,
          creator_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join creator to challenge
      await this.joinChallenge(data.id);

      return data;
    } catch (error: any) {
      console.error('Error creating challenge:', error);
      throw error;
    }
  }

  async joinChallenge(challengeId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          progress: 0,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error joining challenge:', error);
      throw error;
    }
  }

  async leaveChallenge(challengeId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error leaving challenge:', error);
      throw error;
    }
  }

  async updateChallengeProgress(challengeId: string, progress: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('challenge_participants')
        .update({
          progress,
          last_update: new Date().toISOString(),
        })
        .eq('challenge_id', challengeId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating challenge progress:', error);
      throw error;
    }
  }

  async getChallengeParticipants(challengeId: string): Promise<ChallengeParticipant[]> {
    try {
      const { data, error } = await supabase
        .from('challenge_participants')
        .select(`
          *,
          user:user_profiles!challenge_participants_user_id_fkey(
            id,
            username,
            full_name,
            profile_picture
          )
        `)
        .eq('challenge_id', challengeId)
        .order('progress', { ascending: false });

      if (error) throw error;

      // Add ranks
      return (data || []).map((participant, index) => ({
        ...participant,
        rank: index + 1,
      }));
    } catch (error: any) {
      console.error('Error fetching challenge participants:', error);
      throw error;
    }
  }

  async getChallengeLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
    try {
      const participants = await this.getChallengeParticipants(challengeId);
      
      return participants.map((p, index) => ({
        rank: index + 1,
        userId: p.userId,
        user: p.user,
        value: p.progress,
        unit: 'points', // This should be dynamic based on challenge type
      }));
    } catch (error: any) {
      console.error('Error fetching challenge leaderboard:', error);
      throw error;
    }
  }

  // Leaderboard Methods
  async getGlobalLeaderboard(category: string, timeframe: string): Promise<LeaderboardEntry[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_global_leaderboard', {
          category_param: category,
          timeframe_param: timeframe,
        });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching global leaderboard:', error);
      throw error;
    }
  }

  async getFriendsLeaderboard(category: string, timeframe: string): Promise<LeaderboardEntry[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const followingIds = await this.getFollowingIds(user.id);
      followingIds.push(user.id); // Include self

      const { data, error } = await supabase
        .rpc('get_friends_leaderboard', {
          user_ids: followingIds,
          category_param: category,
          timeframe_param: timeframe,
        });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching friends leaderboard:', error);
      throw error;
    }
  }

  // Achievement Methods
  async getAchievements(): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('points', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching achievements:', error);
      throw error;
    }
  }

  async getAchievement(achievementId: string): Promise<Achievement> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', achievementId)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserAchievements(userId: string): Promise<Achievement[]> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          achievement:achievements(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;
      return data?.map(d => ({
        ...d.achievement,
        isUnlocked: true,
        unlockedAt: d.unlocked_at,
      })) || [];
    } catch (error: any) {
      console.error('Error fetching user achievements:', error);
      throw error;
    }
  }

  async unlockAchievement(achievementId: string): Promise<Achievement> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
        })
        .select(`
          achievement:achievements(*)
        `)
        .single();

      if (error) throw error;

      // Share achievement automatically
      await this.shareAchievement(achievementId);

      return {
        ...data.achievement,
        isUnlocked: true,
        unlockedAt: new Date(),
      };
    } catch (error: any) {
      console.error('Error unlocking achievement:', error);
      throw error;
    }
  }

  // Notification Methods
  async getSocialNotifications(): Promise<SocialNotification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('social_notifications')
        .select(`
          *,
          from_user:user_profiles!social_notifications_from_user_id_fkey(
            id,
            username,
            full_name,
            profile_picture
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  async markNotificationRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('social_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsRead(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('social_notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Helper Methods
  private async getCurrentUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');
    return user.id;
  }

  private async getFollowingIds(userId: string): Promise<string[]> {
    const following = await this.getFollowing(userId);
    return following.map(f => f.followingId);
  }

  private async isPostLiked(postId: string, userId: string): Promise<boolean> {
    const { data } = await supabase
      .from('reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .eq('type', 'like')
      .single();

    return !!data;
  }

  private async createNotification(
    userId: string,
    type: string,
    data: any
  ): Promise<void> {
    try {
      await supabase
        .from('social_notifications')
        .insert({
          user_id: userId,
          type,
          ...data,
        });
    } catch (error) {
      console.error('Error creating notification:', error);
    }
  }

  // Cache Methods
  private async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const cached = await AsyncStorage.getItem(`${this.CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp > this.CACHE_DURATION) {
        await AsyncStorage.removeItem(`${this.CACHE_PREFIX}${key}`);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private async setCachedData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(
        `${this.CACHE_PREFIX}${key}`,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        })
      );
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }
}

export const socialService = new SocialService();