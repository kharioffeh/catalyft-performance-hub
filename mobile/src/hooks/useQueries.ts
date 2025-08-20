/**
 * Custom React Query hooks for data fetching with optimistic updates
 */

import { useQuery, useMutation, useInfiniteQuery, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { queryClient, queryKeys, optimisticUpdates, invalidateHelpers } from '../services/queryClient';
import { supabaseService } from '../services/supabase';
import { useStore } from '../store';
import { 
  Workout, Exercise, NutritionEntry, Goal, Challenge, 
  User, Friend, UserAchievement, Notification 
} from '../types/models';

// User hooks
export const useUserQuery = (userId: string, options?: UseQueryOptions<User | null>) => {
  return useQuery({
    queryKey: queryKeys.user(userId),
    queryFn: () => supabaseService.getUser(userId),
    ...options,
  });
};

export const useUpdateUserMutation = () => {
  const setCurrentUser = useStore(state => state.setCurrentUser);
  
  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: any }) => 
      supabaseService.updateUser(userId, updates),
    onMutate: async ({ userId, updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.user(userId) });
      
      // Snapshot previous value
      const previousUser = queryClient.getQueryData(queryKeys.user(userId));
      
      // Optimistically update
      optimisticUpdates.updateItem(queryKeys.user(userId), updates);
      
      return { previousUser };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousUser) {
        queryClient.setQueryData(queryKeys.user(variables.userId), context.previousUser);
      }
    },
    onSuccess: (data, variables) => {
      // Update store
      setCurrentUser(data);
      // Invalidate related queries
      invalidateHelpers.invalidateUserData(variables.userId);
    },
  });
};

// Workout hooks
export const useWorkoutsQuery = (userId: string, filters?: any) => {
  return useQuery({
    queryKey: queryKeys.workouts(userId, filters),
    queryFn: () => supabaseService.getWorkouts(userId, filters),
  });
};

export const useWorkoutQuery = (workoutId: string, options?: UseQueryOptions<Workout | null>) => {
  return useQuery({
    queryKey: queryKeys.workout(workoutId),
    queryFn: () => supabaseService.getWorkout(workoutId),
    ...options,
  });
};

export const useCreateWorkoutMutation = () => {
  const currentUser = useStore(state => state.currentUser);
  
  return useMutation({
    mutationFn: (workout: any) => supabaseService.createWorkout(workout),
    onMutate: async (newWorkout) => {
      if (!currentUser) return;
      
      // Cancel outgoing queries
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.workouts(currentUser.id) 
      });
      
      // Snapshot previous value
      const previousWorkouts = queryClient.getQueryData(
        queryKeys.workouts(currentUser.id)
      );
      
      // Optimistically update
      const tempWorkout = {
        ...newWorkout,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      optimisticUpdates.addToList(
        queryKeys.workouts(currentUser.id),
        tempWorkout,
        'start'
      );
      
      return { previousWorkouts };
    },
    onError: (err, variables, context) => {
      if (!currentUser) return;
      
      // Rollback on error
      if (context?.previousWorkouts) {
        queryClient.setQueryData(
          queryKeys.workouts(currentUser.id),
          context.previousWorkouts
        );
      }
    },
    onSuccess: (data) => {
      if (!currentUser) return;
      
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workouts(currentUser.id) 
      });
    },
  });
};

export const useUpdateWorkoutMutation = () => {
  const currentUser = useStore(state => state.currentUser);
  
  return useMutation({
    mutationFn: ({ workoutId, updates }: { workoutId: string; updates: any }) =>
      supabaseService.updateWorkout(workoutId, updates),
    onMutate: async ({ workoutId, updates }) => {
      if (!currentUser) return;
      
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.workout(workoutId) });
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.workouts(currentUser.id) 
      });
      
      // Snapshot previous values
      const previousWorkout = queryClient.getQueryData(queryKeys.workout(workoutId));
      const previousWorkouts = queryClient.getQueryData(
        queryKeys.workouts(currentUser.id)
      );
      
      // Optimistically update
      optimisticUpdates.updateItem(queryKeys.workout(workoutId), updates);
      optimisticUpdates.updateInList(
        queryKeys.workouts(currentUser.id),
        workoutId,
        updates
      );
      
      return { previousWorkout, previousWorkouts };
    },
    onError: (err, variables, context) => {
      if (!currentUser) return;
      
      // Rollback on error
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          queryKeys.workout(variables.workoutId),
          context.previousWorkout
        );
      }
      if (context?.previousWorkouts) {
        queryClient.setQueryData(
          queryKeys.workouts(currentUser.id),
          context.previousWorkouts
        );
      }
    },
    onSettled: (data, error, variables) => {
      if (!currentUser) return;
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: queryKeys.workout(variables.workoutId) });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workouts(currentUser.id) 
      });
    },
  });
};

export const useDeleteWorkoutMutation = () => {
  const currentUser = useStore(state => state.currentUser);
  
  return useMutation({
    mutationFn: (workoutId: string) => supabaseService.deleteWorkout(workoutId),
    onMutate: async (workoutId) => {
      if (!currentUser) return;
      
      // Cancel outgoing queries
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.workouts(currentUser.id) 
      });
      
      // Snapshot previous value
      const previousWorkouts = queryClient.getQueryData(
        queryKeys.workouts(currentUser.id)
      );
      
      // Optimistically remove
      optimisticUpdates.removeFromList(
        queryKeys.workouts(currentUser.id),
        workoutId
      );
      
      return { previousWorkouts };
    },
    onError: (err, variables, context) => {
      if (!currentUser) return;
      
      // Rollback on error
      if (context?.previousWorkouts) {
        queryClient.setQueryData(
          queryKeys.workouts(currentUser.id),
          context.previousWorkouts
        );
      }
    },
    onSettled: () => {
      if (!currentUser) return;
      
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.workouts(currentUser.id) 
      });
    },
  });
};

// Exercise hooks
export const useExercisesQuery = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.exercises(filters),
    queryFn: () => supabaseService.getExercises(filters),
    staleTime: 30 * 60 * 1000, // Exercises don't change often
  });
};

export const useExerciseSearchQuery = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['exercises', 'search', query],
    queryFn: () => supabaseService.getExercises({ search: query }),
    enabled: enabled && query.length > 2,
    staleTime: 5 * 60 * 1000,
  });
};

// Nutrition hooks
export const useNutritionEntriesQuery = (
  userId: string,
  startDate: Date,
  endDate: Date
) => {
  return useQuery({
    queryKey: queryKeys.nutritionEntries(userId, startDate, endDate),
    queryFn: () => supabaseService.getNutritionEntries(userId, startDate, endDate),
  });
};

export const useTodayNutritionQuery = (userId: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return useQuery({
    queryKey: queryKeys.nutritionToday(userId),
    queryFn: async () => {
      const entries = await supabaseService.getNutritionEntries(userId, today, tomorrow);
      return entries[0] || null;
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useCreateNutritionEntryMutation = () => {
  const currentUser = useStore(state => state.currentUser);
  
  return useMutation({
    mutationFn: (entry: any) => supabaseService.createNutritionEntry(entry),
    onSuccess: () => {
      if (!currentUser) return;
      
      // Invalidate nutrition queries
      invalidateHelpers.invalidateNutritionData(currentUser.id);
    },
  });
};

export const useUpdateNutritionEntryMutation = () => {
  const currentUser = useStore(state => state.currentUser);
  
  return useMutation({
    mutationFn: ({ entryId, updates }: { entryId: string; updates: any }) =>
      supabaseService.updateNutritionEntry(entryId, updates),
    onMutate: async ({ entryId, updates }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.nutritionEntry(entryId) 
      });
      
      // Snapshot previous value
      const previousEntry = queryClient.getQueryData(
        queryKeys.nutritionEntry(entryId)
      );
      
      // Optimistically update
      optimisticUpdates.updateItem(queryKeys.nutritionEntry(entryId), updates);
      
      return { previousEntry };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousEntry) {
        queryClient.setQueryData(
          queryKeys.nutritionEntry(variables.entryId),
          context.previousEntry
        );
      }
    },
    onSettled: (data, error, variables) => {
      if (!currentUser) return;
      
      // Invalidate queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.nutritionEntry(variables.entryId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.nutritionToday(currentUser.id) 
      });
    },
  });
};

// Food hooks
export const useFoodsQuery = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.foods(filters),
    queryFn: async () => {
      const { data } = await supabaseService.client
        .from('foods')
        .select('*')
        .order('name');
      return data || [];
    },
    staleTime: 30 * 60 * 1000, // Foods don't change often
  });
};

export const useFoodSearchQuery = (query: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['foods', 'search', query],
    queryFn: async () => {
      const { data } = await supabaseService.client
        .from('foods')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(20);
      return data || [];
    },
    enabled: enabled && query.length > 2,
    staleTime: 5 * 60 * 1000,
  });
};

export const useBarcodeQuery = (barcode: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: queryKeys.foodBarcode(barcode),
    queryFn: async () => {
      const { data } = await supabaseService.client
        .from('foods')
        .select('*')
        .eq('barcode', barcode)
        .single();
      return data;
    },
    enabled: enabled && barcode.length > 0,
    staleTime: Infinity, // Barcode data doesn't change
  });
};

// Goal hooks
export const useGoalsQuery = (userId: string, status?: string) => {
  return useQuery({
    queryKey: queryKeys.userGoals(userId),
    queryFn: () => supabaseService.getGoals(userId, status),
  });
};

export const useCreateGoalMutation = () => {
  const currentUser = useStore(state => state.currentUser);
  
  return useMutation({
    mutationFn: (goal: any) => supabaseService.createGoal(goal),
    onSuccess: () => {
      if (!currentUser) return;
      
      // Invalidate goals
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.userGoals(currentUser.id) 
      });
    },
  });
};

export const useUpdateGoalMutation = () => {
  const currentUser = useStore(state => state.currentUser);
  
  return useMutation({
    mutationFn: ({ goalId, updates }: { goalId: string; updates: any }) =>
      supabaseService.updateGoal(goalId, updates),
    onSuccess: () => {
      if (!currentUser) return;
      
      // Invalidate goals
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.userGoals(currentUser.id) 
      });
    },
  });
};

// Challenge hooks
export const useChallengesQuery = (filters?: any) => {
  return useQuery({
    queryKey: queryKeys.challenges(filters),
    queryFn: () => supabaseService.getChallenges(filters),
  });
};

export const useJoinChallengeMutation = () => {
  const currentUser = useStore(state => state.currentUser);
  
  return useMutation({
    mutationFn: (challengeId: string) => {
      if (!currentUser) throw new Error('No user logged in');
      return supabaseService.joinChallenge(challengeId, currentUser.id);
    },
    onSuccess: (data, challengeId) => {
      // Invalidate challenge queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.challenge(challengeId) 
      });
      if (currentUser) {
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.userChallenges(currentUser.id) 
        });
      }
    },
  });
};

// Friend hooks
export const useFriendsQuery = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userFriends(userId),
    queryFn: () => supabaseService.getFriends(userId),
  });
};

export const useSendFriendRequestMutation = () => {
  const currentUser = useStore(state => state.currentUser);
  
  return useMutation({
    mutationFn: (friendId: string) => {
      if (!currentUser) throw new Error('No user logged in');
      return supabaseService.sendFriendRequest(currentUser.id, friendId);
    },
    onSuccess: () => {
      if (!currentUser) return;
      
      // Invalidate friends
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.userFriends(currentUser.id) 
      });
    },
  });
};

// Achievement hooks
export const useAchievementsQuery = (userId: string) => {
  return useQuery({
    queryKey: queryKeys.userAchievements(userId),
    queryFn: () => supabaseService.getUserAchievements(userId),
  });
};

// Notification hooks
export const useNotificationsQuery = (userId: string, unreadOnly: boolean = false) => {
  return useQuery({
    queryKey: queryKeys.userNotifications(userId),
    queryFn: () => supabaseService.getNotifications(userId, unreadOnly),
    refetchInterval: 60 * 1000, // Refetch every minute
  });
};

export const useMarkNotificationAsReadMutation = () => {
  const currentUser = useStore(state => state.currentUser);
  
  return useMutation({
    mutationFn: (notificationId: string) => 
      supabaseService.markNotificationAsRead(notificationId),
    onMutate: async (notificationId) => {
      if (!currentUser) return;
      
      // Optimistically update
      const queryKey = queryKeys.userNotifications(currentUser.id);
      await queryClient.cancelQueries({ queryKey });
      
      const previousNotifications = queryClient.getQueryData<Notification[]>(queryKey);
      
      if (previousNotifications) {
        queryClient.setQueryData(
          queryKey,
          previousNotifications.map(n => 
            n.id === notificationId ? { ...n, isRead: true } : n
          )
        );
      }
      
      return { previousNotifications };
    },
    onError: (err, variables, context) => {
      if (!currentUser) return;
      
      // Rollback on error
      if (context?.previousNotifications) {
        queryClient.setQueryData(
          queryKeys.userNotifications(currentUser.id),
          context.previousNotifications
        );
      }
    },
    onSettled: () => {
      if (!currentUser) return;
      
      // Invalidate notifications
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.userNotifications(currentUser.id) 
      });
    },
  });
};

// Infinite scroll hooks
export const useInfiniteWorkoutsQuery = (userId: string, filters?: any) => {
  const pageSize = 20;
  
  return useInfiniteQuery({
    queryKey: ['workouts', userId, 'infinite', filters],
    queryFn: ({ pageParam }) => 
      supabaseService.getWorkouts(userId, {
        ...filters,
        limit: pageSize,
        offset: pageParam as number,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if ((lastPage as any[]).length < pageSize) return undefined;
      return pages.length * pageSize;
    },
  });
};

export const useInfiniteNotificationsQuery = (userId: string) => {
  const pageSize = 50;
  
  return useInfiniteQuery({
    queryKey: ['notifications', userId, 'infinite'],
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number;
      const { data } = await supabaseService.client
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1);
      return data || [];
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      if ((lastPage as any[]).length < pageSize) return undefined;
      return pages.length * pageSize;
    },
  });
};