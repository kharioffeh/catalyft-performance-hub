/**
 * Export all custom hooks
 */

// Query hooks
export {
  // User hooks
  useUserQuery,
  useUpdateUserMutation,
  
  // Workout hooks
  useWorkoutsQuery,
  useWorkoutQuery,
  useCreateWorkoutMutation,
  useUpdateWorkoutMutation,
  useDeleteWorkoutMutation,
  
  // Exercise hooks
  useExercisesQuery,
  useExerciseSearchQuery,
  
  // Nutrition hooks
  useNutritionEntriesQuery,
  useTodayNutritionQuery,
  useCreateNutritionEntryMutation,
  useUpdateNutritionEntryMutation,
  
  // Food hooks
  useFoodsQuery,
  useFoodSearchQuery,
  useBarcodeQuery,
  
  // Goal hooks
  useGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  
  // Challenge hooks
  useChallengesQuery,
  useJoinChallengeMutation,
  
  // Friend hooks
  useFriendsQuery,
  useSendFriendRequestMutation,
  
  // Achievement hooks
  useAchievementsQuery,
  
  // Notification hooks
  useNotificationsQuery,
  useMarkNotificationAsReadMutation,
  
  // Infinite scroll hooks
  useInfiniteWorkoutsQuery,
  useInfiniteNotificationsQuery,
} from './useQueries';

// Real-time hooks
export { useRealtime, useChallengeRealtime, usePresence } from '../services/realtime';

// Background sync hooks
export { useBackgroundSync, useOfflineQueue } from '../services/backgroundSync';

// Store hooks
export {
  useStore,
  useUser,
  useIsAuthenticated,
  useWorkouts,
  useActiveWorkout,
  useNutritionToday,
  useGoals,
  useNotifications,
  useAuthActions,
  useWorkoutActions,
  useNutritionActions,
} from '../store';