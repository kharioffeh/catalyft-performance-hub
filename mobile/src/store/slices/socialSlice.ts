/**
 * Social features state slice for Zustand store
 */

import { StateCreator } from 'zustand';
import { socialService } from '../../services/social';
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
  SocialNotification
} from '../../types/social';

export interface SocialSlice {
  // State
  userProfiles: Map<string, UserProfile>;
  currentUserProfile: UserProfile | null;
  following: Follow[];
  followers: Follow[];
  activityFeed: ActivityPost[];
  feedLoading: boolean;
  feedHasMore: boolean;
  feedPage: number;
  userPosts: Map<string, ActivityPost[]>;
  comments: Map<string, Comment[]>;
  reactions: Map<string, Reaction[]>;
  challenges: Challenge[];
  userChallenges: Challenge[];
  challengeParticipants: Map<string, ChallengeParticipant[]>;
  leaderboard: LeaderboardEntry[];
  achievements: Achievement[];
  userAchievements: Map<string, Achievement[]>;
  socialNotifications: SocialNotification[];
  unreadNotificationCount: number;
  suggestedUsers: UserProfile[];
  searchResults: UserProfile[];
  isLoading: boolean;
  error: string | null;

  // Profile Actions
  loadUserProfile: (userId: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
  uploadProfilePicture: (uri: string) => Promise<string>;
  updateProfileStats: (stats: any) => Promise<void>;

  // Follow System Actions
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  loadFollowers: (userId?: string) => Promise<void>;
  loadFollowing: (userId?: string) => Promise<void>;
  loadSuggestedUsers: () => Promise<void>;
  searchUsers: (query: string) => Promise<void>;

  // Activity Feed Actions
  loadActivityFeed: (refresh?: boolean) => Promise<void>;
  loadMoreFeed: () => Promise<void>;
  loadUserPosts: (userId: string) => Promise<void>;
  createPost: (post: Partial<ActivityPost>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  shareWorkout: (workoutId: string, caption?: string) => Promise<void>;
  shareMeal: (mealId: string, caption?: string, imageUrl?: string) => Promise<void>;
  shareAchievement: (achievementId: string, caption?: string) => Promise<void>;

  // Engagement Actions
  likePost: (postId: string) => Promise<void>;
  unlikePost: (postId: string) => Promise<void>;
  addReaction: (postId: string, type: string) => Promise<void>;
  removeReaction: (postId: string) => Promise<void>;
  loadComments: (postId: string) => Promise<void>;
  addComment: (postId: string, text: string, parentId?: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;

  // Challenge Actions
  loadChallenges: () => Promise<void>;
  loadUserChallenges: () => Promise<void>;
  createChallenge: (challenge: Partial<Challenge>) => Promise<void>;
  joinChallenge: (challengeId: string) => Promise<void>;
  leaveChallenge: (challengeId: string) => Promise<void>;
  updateChallengeProgress: (challengeId: string, progress: any) => Promise<void>;
  loadChallengeParticipants: (challengeId: string) => Promise<void>;
  loadChallengeLeaderboard: (challengeId: string) => Promise<void>;

  // Leaderboard Actions
  loadGlobalLeaderboard: (category: string, timeframe: string) => Promise<void>;
  loadFriendsLeaderboard: (category: string, timeframe: string) => Promise<void>;

  // Achievement Actions
  loadAchievements: () => Promise<void>;
  loadUserAchievements: (userId: string) => Promise<void>;
  unlockAchievement: (achievementId: string) => Promise<void>;

  // Notification Actions
  loadSocialNotifications: () => Promise<void>;
  markNotificationRead: (notificationId: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  // Utility Actions
  clearSocialData: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export const createSocialSlice: StateCreator<SocialSlice> = (set, get) => ({
  // Initial state
  userProfiles: new Map(),
  currentUserProfile: null,
  following: [],
  followers: [],
  activityFeed: [],
  feedLoading: false,
  feedHasMore: true,
  feedPage: 1,
  userPosts: new Map(),
  comments: new Map(),
  reactions: new Map(),
  challenges: [],
  userChallenges: [],
  challengeParticipants: new Map(),
  leaderboard: [],
  achievements: [],
  userAchievements: new Map(),
  socialNotifications: [],
  unreadNotificationCount: 0,
  suggestedUsers: [],
  searchResults: [],
  isLoading: false,
  error: null,

  // Profile Actions
  loadUserProfile: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const profile = await socialService.getUserProfile(userId);
      set((state) => {
        const profiles = new Map(state.userProfiles);
        profiles.set(userId, profile);
        return { 
          userProfiles: profiles, 
          currentUserProfile: profile.isCurrentUser ? profile : state.currentUserProfile,
          isLoading: false 
        };
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  updateUserProfile: async (updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProfile = await socialService.updateProfile(updates);
      set((state) => {
        const profiles = new Map(state.userProfiles);
        profiles.set(updatedProfile.id, updatedProfile);
        return { 
          userProfiles: profiles,
          currentUserProfile: updatedProfile,
          isLoading: false 
        };
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  uploadProfilePicture: async (uri) => {
    try {
      const imageUrl = await socialService.uploadProfilePicture(uri);
      await get().updateUserProfile({ profilePicture: imageUrl });
      return imageUrl;
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateProfileStats: async (stats) => {
    try {
      await socialService.updateProfileStats(stats);
      if (get().currentUserProfile) {
        await get().loadUserProfile(get().currentUserProfile!.id);
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Follow System Actions
  followUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await socialService.followUser(userId);
      set((state) => ({
        following: [...state.following, { 
          id: Date.now().toString(),
          followerId: state.currentUserProfile?.id || '',
          followingId: userId,
          createdAt: new Date()
        }],
        isLoading: false
      }));
      
      // Update user profile follow counts
      const profile = get().userProfiles.get(userId);
      if (profile) {
        profile.followersCount = (profile.followersCount || 0) + 1;
        set((state) => {
          const profiles = new Map(state.userProfiles);
          profiles.set(userId, profile);
          return { userProfiles: profiles };
        });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  unfollowUser: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      await socialService.unfollowUser(userId);
      set((state) => ({
        following: state.following.filter(f => f.followingId !== userId),
        isLoading: false
      }));
      
      // Update user profile follow counts
      const profile = get().userProfiles.get(userId);
      if (profile) {
        profile.followersCount = Math.max((profile.followersCount || 0) - 1, 0);
        set((state) => {
          const profiles = new Map(state.userProfiles);
          profiles.set(userId, profile);
          return { userProfiles: profiles };
        });
      }
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadFollowers: async (userId) => {
    try {
      const followers = await socialService.getFollowers(userId);
      if (!userId || userId === get().currentUserProfile?.id) {
        set({ followers });
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  loadFollowing: async (userId) => {
    try {
      const following = await socialService.getFollowing(userId);
      if (!userId || userId === get().currentUserProfile?.id) {
        set({ following });
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  loadSuggestedUsers: async () => {
    try {
      const suggested = await socialService.getSuggestedUsers();
      set({ suggestedUsers: suggested });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  searchUsers: async (query) => {
    try {
      const results = await socialService.searchUsers(query);
      set({ searchResults: results });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Activity Feed Actions
  loadActivityFeed: async (refresh = false) => {
    set({ feedLoading: true, error: null });
    try {
      const page = refresh ? 1 : get().feedPage;
      const feed = await socialService.getActivityFeed(page);
      
      set((state) => ({
        activityFeed: refresh ? feed : [...state.activityFeed, ...feed],
        feedPage: page,
        feedHasMore: feed.length >= 20,
        feedLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, feedLoading: false });
    }
  },

  loadMoreFeed: async () => {
    if (!get().feedHasMore || get().feedLoading) return;
    
    const nextPage = get().feedPage + 1;
    set({ feedPage: nextPage });
    await get().loadActivityFeed();
  },

  loadUserPosts: async (userId) => {
    try {
      const posts = await socialService.getUserPosts(userId);
      set((state) => {
        const userPosts = new Map(state.userPosts);
        userPosts.set(userId, posts);
        return { userPosts };
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createPost: async (post) => {
    try {
      const newPost = await socialService.createPost(post);
      set((state) => ({
        activityFeed: [newPost, ...state.activityFeed]
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deletePost: async (postId) => {
    try {
      await socialService.deletePost(postId);
      set((state) => ({
        activityFeed: state.activityFeed.filter(p => p.id !== postId)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  shareWorkout: async (workoutId, caption) => {
    try {
      const post = await socialService.shareWorkout(workoutId, caption);
      set((state) => ({
        activityFeed: [post, ...state.activityFeed]
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  shareMeal: async (mealId, caption, imageUrl) => {
    try {
      const post = await socialService.shareMeal(mealId, caption, imageUrl);
      set((state) => ({
        activityFeed: [post, ...state.activityFeed]
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  shareAchievement: async (achievementId, caption) => {
    try {
      const post = await socialService.shareAchievement(achievementId, caption);
      set((state) => ({
        activityFeed: [post, ...state.activityFeed]
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Engagement Actions
  likePost: async (postId) => {
    try {
      await socialService.likePost(postId);
      set((state) => ({
        activityFeed: state.activityFeed.map(post => 
          post.id === postId 
            ? { ...post, likesCount: (post.likesCount || 0) + 1, isLiked: true }
            : post
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  unlikePost: async (postId) => {
    try {
      await socialService.unlikePost(postId);
      set((state) => ({
        activityFeed: state.activityFeed.map(post => 
          post.id === postId 
            ? { ...post, likesCount: Math.max((post.likesCount || 0) - 1, 0), isLiked: false }
            : post
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addReaction: async (postId, type) => {
    try {
      const reaction = await socialService.addReaction(postId, type);
      set((state) => {
        const reactions = new Map(state.reactions);
        const postReactions = reactions.get(postId) || [];
        reactions.set(postId, [...postReactions, reaction]);
        return { reactions };
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  removeReaction: async (postId) => {
    try {
      await socialService.removeReaction(postId);
      set((state) => {
        const reactions = new Map(state.reactions);
        const postReactions = reactions.get(postId) || [];
        reactions.set(postId, postReactions.filter(r => r.userId !== state.currentUserProfile?.id));
        return { reactions };
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  loadComments: async (postId) => {
    try {
      const comments = await socialService.getComments(postId);
      set((state) => {
        const commentsMap = new Map(state.comments);
        commentsMap.set(postId, comments);
        return { comments: commentsMap };
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  addComment: async (postId, text, parentId) => {
    try {
      const comment = await socialService.addComment(postId, text, parentId);
      set((state) => {
        const comments = new Map(state.comments);
        const postComments = comments.get(postId) || [];
        comments.set(postId, [...postComments, comment]);
        
        // Update comment count on post
        const activityFeed = state.activityFeed.map(post => 
          post.id === postId 
            ? { ...post, commentsCount: (post.commentsCount || 0) + 1 }
            : post
        );
        
        return { comments, activityFeed };
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  deleteComment: async (commentId) => {
    try {
      await socialService.deleteComment(commentId);
      set((state) => {
        const comments = new Map(state.comments);
        comments.forEach((postComments, postId) => {
          comments.set(postId, postComments.filter(c => c.id !== commentId));
        });
        return { comments };
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Challenge Actions
  loadChallenges: async () => {
    try {
      const challenges = await socialService.getChallenges();
      set({ challenges });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  loadUserChallenges: async () => {
    try {
      const userChallenges = await socialService.getUserChallenges();
      set({ userChallenges });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  createChallenge: async (challenge) => {
    try {
      const newChallenge = await socialService.createChallenge(challenge);
      set((state) => ({
        challenges: [newChallenge, ...state.challenges],
        userChallenges: [newChallenge, ...state.userChallenges]
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  joinChallenge: async (challengeId) => {
    try {
      await socialService.joinChallenge(challengeId);
      const challenge = get().challenges.find(c => c.id === challengeId);
      if (challenge) {
        set((state) => ({
          userChallenges: [...state.userChallenges, challenge]
        }));
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  leaveChallenge: async (challengeId) => {
    try {
      await socialService.leaveChallenge(challengeId);
      set((state) => ({
        userChallenges: state.userChallenges.filter(c => c.id !== challengeId)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateChallengeProgress: async (challengeId, progress) => {
    try {
      await socialService.updateChallengeProgress(challengeId, progress);
      // Reload challenge data
      await get().loadUserChallenges();
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  loadChallengeParticipants: async (challengeId) => {
    try {
      const participants = await socialService.getChallengeParticipants(challengeId);
      set((state) => {
        const participantsMap = new Map(state.challengeParticipants);
        participantsMap.set(challengeId, participants);
        return { challengeParticipants: participantsMap };
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  loadChallengeLeaderboard: async (challengeId) => {
    try {
      const leaderboard = await socialService.getChallengeLeaderboard(challengeId);
      set({ leaderboard });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Leaderboard Actions
  loadGlobalLeaderboard: async (category, timeframe) => {
    try {
      const leaderboard = await socialService.getGlobalLeaderboard(category, timeframe);
      set({ leaderboard });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  loadFriendsLeaderboard: async (category, timeframe) => {
    try {
      const leaderboard = await socialService.getFriendsLeaderboard(category, timeframe);
      set({ leaderboard });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Achievement Actions
  loadAchievements: async () => {
    try {
      const achievements = await socialService.getAchievements();
      set({ achievements });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  loadUserAchievements: async (userId) => {
    try {
      const achievements = await socialService.getUserAchievements(userId);
      set((state) => {
        const userAchievements = new Map(state.userAchievements);
        userAchievements.set(userId, achievements);
        return { userAchievements };
      });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  unlockAchievement: async (achievementId) => {
    try {
      const achievement = await socialService.unlockAchievement(achievementId);
      const userId = get().currentUserProfile?.id;
      if (userId) {
        set((state) => {
          const userAchievements = new Map(state.userAchievements);
          const current = userAchievements.get(userId) || [];
          userAchievements.set(userId, [...current, achievement]);
          return { userAchievements };
        });
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Notification Actions
  loadSocialNotifications: async () => {
    try {
      const notifications = await socialService.getSocialNotifications();
      const unreadCount = notifications.filter(n => !n.isRead).length;
      set({ socialNotifications: notifications, unreadNotificationCount: unreadCount });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  markNotificationRead: async (notificationId) => {
    try {
      await socialService.markNotificationRead(notificationId);
      set((state) => ({
        socialNotifications: state.socialNotifications.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        ),
        unreadNotificationCount: Math.max(state.unreadNotificationCount - 1, 0)
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  markAllNotificationsRead: async () => {
    try {
      await socialService.markAllNotificationsRead();
      set((state) => ({
        socialNotifications: state.socialNotifications.map(n => ({ ...n, isRead: true })),
        unreadNotificationCount: 0
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  // Utility Actions
  clearSocialData: () => {
    set({
      userProfiles: new Map(),
      currentUserProfile: null,
      following: [],
      followers: [],
      activityFeed: [],
      feedLoading: false,
      feedHasMore: true,
      feedPage: 1,
      userPosts: new Map(),
      comments: new Map(),
      reactions: new Map(),
      challenges: [],
      userChallenges: [],
      challengeParticipants: new Map(),
      leaderboard: [],
      achievements: [],
      userAchievements: new Map(),
      socialNotifications: [],
      unreadNotificationCount: 0,
      suggestedUsers: [],
      searchResults: [],
      isLoading: false,
      error: null
    });
  },

  setError: (error) => set({ error }),
  setLoading: (loading) => set({ isLoading: loading })
});