# Amplitude Analytics Integration

This document outlines the comprehensive Amplitude analytics integration implemented for user behavior tracking in the Catalyft AI fitness platform.

## Overview

The integration provides detailed user behavior tracking across all major features including:
- User authentication and registration
- Navigation patterns
- Workout sessions and exercise logging
- Feature usage and engagement
- Wearable device connections
- Analytics page interactions
- ARIA AI coach interactions
- Error tracking and debugging
- Social features and club interactions

## Setup

### 1. Environment Configuration

Add your Amplitude API key to your environment configuration:

```bash
# .env
VITE_AMPLITUDE_API_KEY=your-amplitude-api-key-here
```

### 2. Provider Integration

The `AnalyticsProvider` has been integrated into the app's root component hierarchy:

```typescript
// src/App.tsx
<QueryClientProvider client={queryClient}>
  <AuthProvider>
    <AnalyticsProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AnalyticsProvider>
  </AuthProvider>
</QueryClientProvider>
```

## Usage

### Basic Usage

Use the `useAnalytics` hook in any component to access tracking methods:

```typescript
import { useAnalytics } from '@/context/AnalyticsContext';

const MyComponent = () => {
  const analytics = useAnalytics();

  const handleButtonClick = () => {
    analytics.trackFeatureUsed({
      feature_name: 'advanced_metrics',
      feature_category: 'analytics',
      success: true,
    });
  };

  return <button onClick={handleButtonClick}>View Advanced Metrics</button>;
};
```

### Navigation Tracking

Use the custom navigation hook for automatic navigation tracking:

```typescript
import { useAnalyticsNavigation } from '@/hooks/useAnalyticsNavigation';

const MyComponent = () => {
  const navigate = useAnalyticsNavigation();

  const goToAnalytics = () => {
    navigate('/analytics', { method: 'button' });
  };

  return <button onClick={goToAnalytics}>Go to Analytics</button>;
};
```

## Tracked Events

### Authentication Events

| Event Name | Properties | Description |
|------------|------------|-------------|
| `User Registered` | `registration_method`, `user_type`, `timestamp` | User creates a new account |
| `User Logged In` | `login_method`, `timestamp` | User signs in |
| `User Logged Out` | `timestamp` | User signs out |

### Navigation Events

| Event Name | Properties | Description |
|------------|------------|-------------|
| `Page Viewed` | `page`, `from_page`, `navigation_method` | User navigates to a new page |

### Workout Events

| Event Name | Properties | Description |
|------------|------------|-------------|
| `Workout Started` | `session_id`, `workout_type`, `sets_completed` | User starts a workout session |
| `Workout Completed` | `session_id`, `workout_type`, `session_duration_minutes`, `sets_completed`, `completion_rate` | User completes a workout |
| `Set Logged` | `session_id`, `exercise_type`, `set_number` | User logs a set during workout |

### Feature Usage Events

| Event Name | Properties | Description |
|------------|------------|-------------|
| `Feature Used` | `feature_name`, `feature_category`, `subscription_required`, `success`, `error_type` | User interacts with a feature |

### Subscription Events

| Event Name | Properties | Description |
|------------|------------|-------------|
| `Subscription Started` | `subscription_tier`, `payment_method` | User starts a subscription |
| `Subscription Cancelled` | `subscription_tier`, `cancellation_reason` | User cancels subscription |

### Wearable Events

| Event Name | Properties | Description |
|------------|------------|-------------|
| `Wearable Connected` | `wearable_type` | User connects a wearable device |
| `Wearable Disconnected` | `wearable_type` | User disconnects a wearable device |

### Analytics Events

| Event Name | Properties | Description |
|------------|------------|-------------|
| `Analytics Page Viewed` | `analytics_section`, `time_range` | User views analytics page with specific filters |

### ARIA Events

| Event Name | Properties | Description |
|------------|------------|-------------|
| `ARIA Interaction` | `interaction_type` | User interacts with AI coach |

### Error Events

| Event Name | Properties | Description |
|------------|------------|-------------|
| `Error Occurred` | `error_type`, `error_message`, `error_context` | Application or user error |

### Social Events

| Event Name | Properties | Description |
|------------|------------|-------------|
| `Post Created` | `post_type` | User creates a social post |
| `Post Reaction` | `reaction_type` | User reacts to a post |
| `Club Joined` | `club_id` | User joins a club |

## User Properties

The following user properties are automatically tracked and updated:

| Property | Type | Description |
|----------|------|-------------|
| `subscription_tier` | `'free' \| 'standard' \| 'premium'` | User's subscription level |
| `subscription_status` | `'active' \| 'cancelled' \| 'past_due'` | Subscription payment status |
| `user_type` | `'athlete' \| 'coach'` | User's role in the platform |
| `club_id` | `string` | ID of user's primary club |
| `signup_date` | `string` | Date when user registered |
| `platform` | `'web' \| 'ios' \| 'android'` | Platform user is using |
| `wearable_connected` | `boolean` | Whether user has connected wearables |
| `wearable_types` | `string[]` | Types of connected wearables |

## Analytics Service API

### Initialization

```typescript
import { analyticsService } from '@/services/analyticsService';

// Initialize (happens automatically in AnalyticsProvider)
analyticsService.init();
```

### User Management

```typescript
// Set user identity
analyticsService.setUserId('user123');

// Set user properties
analyticsService.setUserProperties({
  subscription_tier: 'premium',
  user_type: 'athlete',
  platform: 'web',
});

// Update specific properties
analyticsService.updateUserProperties({
  subscription_tier: 'standard',
});
```

### Event Tracking

```typescript
// Track custom events
analyticsService.trackFeatureUsed({
  feature_name: 'custom_feature',
  feature_category: 'advanced',
  success: true,
});

// Track navigation
analyticsService.trackNavigation('/dashboard', '/analytics', 'tab');

// Track workout events
analyticsService.trackWorkoutStarted({
  session_id: 'session123',
  workout_type: 'Push Day',
  sets_completed: 0,
});
```

### Utility Methods

```typescript
// Flush pending events
analyticsService.flush();

// Reset user identity (on logout)
analyticsService.reset();
```

## Testing

Comprehensive tests are available in `src/services/__tests__/analyticsService.test.ts`:

```bash
# Run analytics tests
npm test analyticsService.test.ts
```

## Error Handling

The analytics service includes robust error handling:

1. **Missing API Key**: Gracefully disables tracking with console warning
2. **Network Errors**: Catches and logs Amplitude tracking errors
3. **Uninitialized State**: Warns about tracking attempts before initialization
4. **Invalid Events**: Validates event properties and provides fallbacks

## Privacy & GDPR Compliance

The integration respects user privacy:

1. **No PII Tracking**: User emails and personal data are not tracked
2. **User Consent**: Tracking only occurs for authenticated users
3. **Data Retention**: Follows Amplitude's data retention policies
4. **Anonymization**: User IDs are anonymized UUIDs

## Configuration Options

The Amplitude client is configured with:

```typescript
{
  defaultTracking: {
    attribution: true,
    pageViews: true,
    sessions: true,
    formInteractions: true,
    fileDownloads: true,
  },
  autocapture: {
    attribution: true,
    pageViews: true,
    sessions: true,
    formInteractions: true,
    fileDownloads: true,
  },
}
```

## Performance Considerations

1. **Lazy Loading**: Analytics service is only initialized when needed
2. **Batching**: Events are automatically batched by Amplitude
3. **Error Boundaries**: Analytics errors don't affect app functionality
4. **Memory Management**: Service cleans up on app unmount

## Monitoring & Debugging

### Development Mode

In development, analytics events are logged to the console:

```javascript
// Console output example
Analytics not initialized. Would track: User Logged In {
  login_method: 'email',
  timestamp: '2024-01-01T12:00:00.000Z'
}
```

### Production Monitoring

Monitor analytics health through:

1. Amplitude dashboard event volumes
2. Browser console error logs
3. Application error tracking integration

## Migration & Updates

When updating the analytics integration:

1. Update event schemas in TypeScript interfaces
2. Add backward compatibility for existing events
3. Test thoroughly with mock Amplitude client
4. Document breaking changes

## Support

For questions or issues with the analytics integration:

1. Check the test suite for usage examples
2. Review Amplitude documentation for advanced features
3. Consult the error handling patterns in the service
4. Use the development console output for debugging

## Future Enhancements

Planned improvements:

1. **Cohort Analysis**: Track user cohorts and retention
2. **A/B Testing**: Integration with Amplitude's experiment features
3. **Real-time Analytics**: Custom dashboard for live metrics
4. **Advanced Segmentation**: More granular user property tracking
5. **Cross-platform Sync**: Unified tracking across web and mobile apps