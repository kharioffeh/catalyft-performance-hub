# Catalyft Backend Integration Documentation

## Overview

The Catalyft mobile app features a robust backend integration layer with complete state management, offline support, real-time updates, and data synchronization capabilities.

## Architecture

### Core Technologies

- **Zustand**: State management with persistence
- **React Query**: Server state management and caching
- **Supabase**: Backend as a Service (database, auth, real-time)
- **MMKV**: Fast key-value storage for persistence
- **Zod**: Runtime type validation
- **Axios**: HTTP client with interceptors

## Directory Structure

```
src/
├── services/           # Backend services
│   ├── api.ts         # Base API client with interceptors
│   ├── supabase.ts    # Typed Supabase client
│   ├── queryClient.ts # React Query configuration
│   ├── realtime.ts    # Real-time subscriptions
│   └── backgroundSync.ts # Offline queue & sync
├── store/             # State management
│   ├── index.ts       # Main Zustand store
│   └── slices/        # Store slices
│       ├── userSlice.ts
│       ├── workoutSlice.ts
│       └── nutritionSlice.ts
├── hooks/             # Custom React hooks
│   ├── index.ts
│   └── useQueries.ts  # React Query hooks
├── types/             # TypeScript definitions
│   ├── models.ts      # Data models
│   └── database.ts    # Database types
└── utils/
    └── validators.ts  # Zod validation schemas
```

## Features

### 1. Authentication & User Management

```typescript
// Sign in
const { signIn } = useAuthActions();
await signIn(email, password);

// Get current user
const user = useUser();

// Update profile
const updateUser = useUpdateUserMutation();
updateUser.mutate({ 
  userId: user.id, 
  updates: { fullName: 'New Name' } 
});
```

### 2. State Management

The app uses Zustand for global state with three main slices:

- **User Slice**: Authentication, profile, friends, notifications
- **Workout Slice**: Workouts, exercises, active sessions
- **Nutrition Slice**: Food tracking, meals, water intake

```typescript
// Access store directly
const store = useStore();

// Use specific selectors
const workouts = useWorkouts();
const activeWorkout = useActiveWorkout();
```

### 3. Offline Support

All data operations work offline and sync when connection is restored:

```typescript
// Operations are automatically queued when offline
const createWorkout = useCreateWorkoutMutation();
createWorkout.mutate(workoutData); // Works offline

// Check sync status
const { isSyncing, lastSyncTime } = useStore();

// Manual sync
const { syncData } = useStore();
await syncData();
```

### 4. Real-time Updates

Automatic real-time subscriptions for live data:

```typescript
// Enable real-time for current user
useRealtime();

// Subscribe to specific challenge
useChallengeRealtime(challengeId);

// Presence tracking
usePresence();
```

### 5. Data Caching

React Query provides intelligent caching with optimistic updates:

```typescript
// Data is cached and updated optimistically
const { data: workouts } = useWorkoutsQuery(userId);

// Prefetch data
await prefetchHelpers.prefetchUserData(userId);

// Invalidate cache
invalidateHelpers.invalidateWorkoutData(userId);
```

### 6. Background Sync

Automatic background synchronization:

```typescript
// Enable background sync
useBackgroundSync();

// Access offline queue
const { addToQueue, getQueueSize } = useOfflineQueue();

// Retry failed operations
retryFailed();
```

## API Integration

### Base API Client

The API client (`src/services/api.ts`) provides:

- Automatic token management
- Request/response interceptors
- Retry logic with exponential backoff
- Offline queue management
- Network error handling

### Supabase Integration

The Supabase client (`src/services/supabase.ts`) provides:

- Typed database operations
- Real-time subscriptions
- File storage
- Authentication

## Data Models

### Core Entities

- **User**: Profile, preferences, stats
- **Workout**: Exercises, sets, progress tracking
- **Exercise**: Library with categories, equipment, instructions
- **NutritionEntry**: Daily meals, macros, water intake
- **Food**: Food database with nutritional information
- **Goal**: Fitness goals with progress tracking
- **Challenge**: Social challenges and competitions
- **Achievement**: Gamification elements

## Validation

All data is validated using Zod schemas:

```typescript
import { CreateWorkoutSchema } from '@/utils/validators';

// Validate before submission
const validation = safeValidateData(CreateWorkoutSchema, data);
if (!validation.success) {
  // Handle validation errors
}
```

## Usage Examples

### Creating a Workout

```typescript
const createWorkout = useCreateWorkoutMutation();

createWorkout.mutate({
  name: 'Morning Workout',
  type: 'strength',
  exercises: [
    {
      exerciseId: 'exercise-1',
      sets: [
        { reps: 10, weight: 50 },
        { reps: 10, weight: 50 },
      ],
    },
  ],
});
```

### Tracking Nutrition

```typescript
const { currentEntry } = useNutritionToday();
const updateEntry = useUpdateNutritionEntryMutation();

// Add food to meal
updateEntry.mutate({
  entryId: currentEntry.id,
  updates: {
    meals: [...currentEntry.meals, newMeal],
  },
});

// Update water intake
updateEntry.mutate({
  entryId: currentEntry.id,
  updates: {
    water_intake: currentEntry.waterIntake + 250,
  },
});
```

### Real-time Workout Session

```typescript
const { startWorkout, completeSet, completeWorkout } = useWorkoutActions();

// Start workout
await startWorkout(workoutId);

// Update sets during workout
completeSet(exerciseId, setId, {
  actualReps: 12,
  actualWeight: 52.5,
});

// Complete workout
await completeWorkout();
```

## Performance Optimizations

1. **MMKV Storage**: 30x faster than AsyncStorage
2. **Query Caching**: Intelligent caching with stale-while-revalidate
3. **Optimistic Updates**: Instant UI updates with rollback on error
4. **Batch Operations**: Multiple operations in single request
5. **Lazy Loading**: Load data on-demand with infinite scroll
6. **Background Sync**: Sync data without blocking UI

## Error Handling

Global error handling with recovery strategies:

```typescript
// Errors are handled globally
// - 401: Auto logout
// - 429: Rate limiting with retry
// - Network errors: Queue for offline sync

// Access errors in components
const { error } = useStore();
if (error) {
  // Show error message
}
```

## Security

- Encrypted storage with MMKV
- Secure token management
- Row-level security with Supabase
- Input validation with Zod
- API request signing

## Testing

```typescript
// Mock store for testing
const mockStore = {
  currentUser: mockUser,
  workouts: mockWorkouts,
  // ...
};

// Mock API responses
jest.mock('@/services/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));
```

## Environment Variables

Required environment variables:

```env
EXPO_PUBLIC_API_URL=https://api.catalyft.com
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Deployment Checklist

- [ ] Update API endpoints
- [ ] Configure Supabase project
- [ ] Set encryption keys
- [ ] Enable background fetch permissions
- [ ] Configure push notifications
- [ ] Test offline mode
- [ ] Verify real-time subscriptions
- [ ] Check sync performance

## Troubleshooting

### Common Issues

1. **Sync not working**: Check network permissions and background fetch config
2. **Real-time not updating**: Verify Supabase subscription limits
3. **Cache issues**: Clear query cache with `queryClient.clear()`
4. **Storage full**: Clear old cache with `storage.clearAll()`

### Debug Tools

```typescript
// Enable debug mode
if (__DEV__) {
  // Access store globally
  global.store = useStore;
  
  // Access query client
  global.queryClient = queryClient;
  
  // Log all API requests
  apiClient.interceptors.request.use(config => {
    console.log('API Request:', config);
    return config;
  });
}
```

## Next Steps

1. Implement push notifications
2. Add biometric authentication
3. Integrate with wearables
4. Add data export/import
5. Implement end-to-end encryption
6. Add analytics tracking
7. Optimize bundle size
8. Add unit/integration tests

## Support

For questions or issues with the backend integration:
1. Check this documentation
2. Review type definitions in `src/types/`
3. Check service implementations in `src/services/`
4. Review store slices in `src/store/slices/`