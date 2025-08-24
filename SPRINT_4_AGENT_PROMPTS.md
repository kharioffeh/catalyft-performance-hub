# Sprint 4 Agent Prompts - Ready to Deploy

## 👥 PROMPT FOR AGENT 8 - SOCIAL FEATURES

You are a React Native developer implementing the social features for the Catalyft fitness app.

**WORKSPACE**: /workspace/mobile
**BRANCH**: agent-8-social
**TIMELINE**: Sprint 4 (2 weeks)
**DEPENDENCIES**: Auth (Agent 1), Workout Tracking (Agent 3), Nutrition (Agent 4)

### YOUR MISSION: Build a complete social ecosystem for fitness motivation and community.

### TASKS TO COMPLETE:

#### 1. Create Social Data Layer:
```typescript
// src/store/slices/socialSlice.ts
- User profiles and relationships
- Activity feed state management
- Comments and reactions
- Challenges and competitions

// src/services/social.ts
- Follow/unfollow users
- Activity feed pagination
- Real-time updates via Supabase
- Social notifications
```

#### 2. Database Schema (Supabase):
```sql
-- Tables to create:
user_profiles (extended profile info, bio, stats)
follows (user relationships)
activity_feed (posts, workouts, achievements)
comments (on posts)
reactions (likes, fire, strong, etc.)
challenges (user-created competitions)
challenge_participants (enrollment)
```

#### 3. Build Social Screens:
- **src/screens/social/ProfileScreen.tsx**
  - User profile with stats and bio
  - Workout history grid
  - Achievements showcase
  - Follow/unfollow button
  - Edit profile for own profile

- **src/screens/social/FeedScreen.tsx**
  - Activity feed with infinite scroll
  - Post types: workouts, PRs, meals, achievements
  - Like, comment, share actions
  - Pull-to-refresh

- **src/screens/social/DiscoverScreen.tsx**
  - Find users to follow
  - Suggested based on similar goals
  - Search by username
  - Trending workouts

- **src/screens/social/ChallengesScreen.tsx**
  - Active challenges list
  - Create challenge wizard
  - Challenge details and leaderboard
  - Join/leave challenge

- **src/screens/social/LeaderboardScreen.tsx**
  - Global rankings
  - Friend rankings
  - Multiple categories (volume, consistency, PRs)
  - Time filters (week, month, all-time)

#### 4. Create Social Components:
```typescript
// src/components/social/
- PostCard.tsx (workout/meal/achievement posts)
- CommentThread.tsx (nested comments)
- UserAvatar.tsx (with online status)
- ShareWorkoutModal.tsx (post creation)
- ChallengeCard.tsx (challenge preview)
- StatsGrid.tsx (profile statistics)
- AchievementBadge.tsx (milestone badges)
```

#### 5. Implement Features:
- **Following System**:
  - Follow/unfollow users
  - Following/followers lists
  - Private account option
  - Follow suggestions

- **Activity Sharing**:
  - Auto-share PRs (optional)
  - Share workout summaries
  - Share meal photos
  - Achievement unlocks

- **Engagement**:
  - Like workouts
  - Comment on posts
  - Workout reactions (fire, strong, beast mode)
  - Mention users (@username)

- **Challenges**:
  - Create custom challenges
  - Set duration and rules
  - Invite specific users
  - Track progress
  - Award winners

#### 6. Add Gamification:
- Achievement system (badges)
- Streak tracking
- Points/XP system
- Level progression
- Milestone rewards

### DEPENDENCIES TO INSTALL:
```bash
npm install react-native-share react-native-image-crop-picker @react-native-community/blur react-native-linear-gradient
```

### INTEGRATION REQUIREMENTS:
- Use existing auth from Agent 1
- Pull workout data from Agent 3
- Pull nutrition data from Agent 4
- Use design system from Agent 11
- Prepare for notifications (Agent 10)

### SUCCESS CRITERIA:
- Users can follow each other
- Activity feed updates in real-time
- Challenges work with leaderboards
- Social features drive engagement
- Performance with large datasets

Start now by creating the branch and building the social data layer.

---

## 🔔 PROMPT FOR AGENT 10 - NOTIFICATIONS

You are a React Native developer implementing the notification system for the Catalyft fitness app.

**WORKSPACE**: /workspace/mobile
**BRANCH**: agent-10-notifications
**TIMELINE**: Sprint 4 (2 weeks)
**DEPENDENCIES**: Auth (Agent 1), Workouts (Agent 3), Nutrition (Agent 4)

### YOUR MISSION: Create a comprehensive push notification system for engagement and retention.

### TASKS TO COMPLETE:

#### 1. Setup Push Notification Infrastructure:
```typescript
// src/services/notifications.ts
- Firebase Cloud Messaging setup
- APNS configuration for iOS
- Token management
- Permission handling

// src/services/notificationHandlers.ts
- Handle foreground notifications
- Handle background notifications
- Handle notification taps
- Deep linking to specific screens
```

#### 2. Create Notification Service:
```typescript
// src/store/slices/notificationSlice.ts
- Notification preferences state
- In-app notification queue
- Read/unread status
- Badge count management

// Backend: supabase/functions/send-notification/
- Cloud function for sending notifications
- Notification templates
- Batch sending
- Scheduling logic
```

#### 3. Build Notification Screens:
- **src/screens/notifications/NotificationCenterScreen.tsx**
  - List all notifications
  - Mark as read/unread
  - Swipe to delete
  - Group by date
  - Filter by type

- **src/screens/notifications/NotificationSettingsScreen.tsx**
  - Toggle notification types
  - Quiet hours setting
  - Frequency controls
  - Channel preferences (push, email, in-app)

#### 4. Implement Notification Types:

**Workout Reminders**:
- Daily workout reminder
- Rest day reminder
- Program session due
- Incomplete workout reminder

**Social Notifications**:
- New follower
- Workout liked
- Comment on post
- Mentioned in comment
- Challenge invite
- Challenge update

**Achievement Notifications**:
- New PR achieved
- Streak milestone
- Level up
- Badge earned
- Goal completed

**Nutrition Reminders**:
- Meal logging reminders
- Water intake reminders
- Macro goal alerts
- Weekly summary

**System Notifications**:
- App updates
- New features
- Maintenance alerts
- Security alerts

#### 5. Create Local Notifications:
```typescript
// src/services/localNotifications.ts
- Workout timer completion
- Rest timer alerts
- Daily goal reminders
- Streak maintenance
- Weekly summary
```

#### 6. Build In-App Notification System:
```typescript
// src/components/notifications/
- NotificationToast.tsx (in-app toast)
- NotificationBadge.tsx (unread count)
- NotificationBell.tsx (header icon)
- NotificationCard.tsx (notification item)
```

#### 7. Implement Smart Features:
- **Intelligent Scheduling**:
  - Learn user's workout times
  - Avoid notification fatigue
  - Respect time zones
  - Smart batching

- **Personalization**:
  - Customized message content
  - User preference learning
  - A/B testing messages
  - Engagement tracking

- **Deep Linking**:
  - Navigate to specific workout
  - Open challenge details
  - View social post
  - Open chat message

### DEPENDENCIES TO INSTALL:
```bash
npm install @react-native-firebase/app @react-native-firebase/messaging 
npm install @notifee/react-native react-native-push-notification
npm install @react-native-async-storage/async-storage
```

### PLATFORM-SPECIFIC SETUP:

**iOS**:
- Configure APNS in Xcode
- Add Push Notification capability
- Upload APNS certificates to Firebase
- Handle provisional authorization

**Android**:
- Configure FCM
- Add notification channels
- Handle notification icons
- Setup notification colors

### INTEGRATION REQUIREMENTS:
- Coordinate with Agent 8 for social notifications
- Use workout data from Agent 3
- Use nutrition data from Agent 4
- Respect user auth state from Agent 1

### SUCCESS CRITERIA:
- Push notifications work on iOS and Android
- Users can control notification preferences
- Deep linking works correctly
- Local notifications function offline
- No notification spam

Start now by creating the branch and setting up Firebase.

---

## 🎯 PROMPT FOR AGENT 12 - ONBOARDING & ANALYTICS

You are a React Native developer implementing onboarding and analytics for the Catalyft fitness app.

**WORKSPACE**: /workspace/mobile
**BRANCH**: agent-12-onboarding
**TIMELINE**: Sprint 4 (2 weeks)
**DEPENDENCIES**: Auth (Agent 1), Backend (Agent 2), Design System (Agent 11)

### YOUR MISSION: Create a smooth onboarding experience and comprehensive analytics system.

### TASKS TO COMPLETE:

#### 1. Build Onboarding Flow:

**src/screens/onboarding/WelcomeScreen.tsx**
```typescript
- App introduction
- Value proposition
- Swipeable feature highlights
- Get Started CTA
```

**src/screens/onboarding/GoalSelectionScreen.tsx**
```typescript
- Multi-select goals:
  - Lose weight
  - Build muscle
  - Get stronger
  - Improve endurance
  - General fitness
  - Sport-specific
- Visual goal cards
- Progress to next
```

**src/screens/onboarding/FitnessAssessmentScreen.tsx**
```typescript
- Current fitness level (beginner/intermediate/advanced)
- Workout frequency preference
- Available equipment
- Injury considerations
- Time availability
```

**src/screens/onboarding/PersonalizationScreen.tsx**
```typescript
- Age and gender (optional)
- Height and weight (optional)
- Preferred workout times
- Dietary preferences
- Notification preferences
```

**src/screens/onboarding/PlanSelectionScreen.tsx**
```typescript
- AI-generated plan preview
- Manual plan selection
- Coach assignment (if applicable)
- Subscription upsell
```

**src/screens/onboarding/TutorialScreen.tsx**
```typescript
- Interactive app tutorial
- Key feature tooltips
- Gesture training
- Skip option
```

#### 2. Create Onboarding Components:
```typescript
// src/components/onboarding/
- ProgressIndicator.tsx (step progress)
- OnboardingSlide.tsx (swipeable slides)
- GoalCard.tsx (selectable goals)
- AssessmentQuestion.tsx (quiz component)
- FeatureHighlight.tsx (benefit display)
- SkipButton.tsx (skip to app)
```

#### 3. Implement Analytics Infrastructure:

**Setup Analytics Services**:
```typescript
// src/services/analytics.ts
- Initialize Mixpanel/Amplitude
- User identification
- Event tracking wrapper
- User property updates
- Session tracking

// src/services/crashlytics.ts
- Firebase Crashlytics setup
- Error boundary integration
- Custom error logging
- Performance monitoring
```

#### 4. Track Key Events:

**Onboarding Events**:
- onboarding_started
- goal_selected
- fitness_level_set
- onboarding_completed
- onboarding_skipped
- tutorial_completed

**User Behavior Events**:
- workout_started/completed
- exercise_logged
- meal_logged
- social_interaction
- challenge_joined
- achievement_earned

**Engagement Metrics**:
- session_started/ended
- screen_viewed
- feature_used
- notification_opened
- deep_link_opened

**Conversion Events**:
- subscription_started
- payment_completed
- referral_sent
- review_prompted

#### 5. Build Analytics Dashboard:
```typescript
// src/screens/admin/AnalyticsDashboard.tsx (admin only)
- User acquisition funnel
- Retention cohorts
- Feature adoption
- Revenue metrics
- Engagement trends
```

#### 6. Implement A/B Testing:
```typescript
// src/services/experiments.ts
- Feature flags service
- Experiment assignment
- Variant tracking
- Result measurement

// Experiments to run:
- Onboarding flow variations
- Notification message testing
- UI element positioning
- Pricing page layouts
```

#### 7. Add User Feedback Systems:
```typescript
// src/components/feedback/
- RatingPrompt.tsx (app store rating)
- SurveyModal.tsx (NPS survey)
- FeedbackButton.tsx (in-app feedback)
- BugReportModal.tsx (issue reporting)
```

#### 8. Create First-Run Experience:
```typescript
// src/utils/firstRun.ts
- Detect first app launch
- Show onboarding conditionally
- Store completion state
- Handle returning users
- Migration for existing users
```

### DEPENDENCIES TO INSTALL:
```bash
npm install @mixpanel/react-native mixpanel-react-native
npm install @react-native-firebase/analytics @react-native-firebase/crashlytics
npm install react-native-onboarding-swiper react-native-app-intro-slider
npm install @amplitude/react-native amplitude-js
```

### ANALYTICS IMPLEMENTATION:

**Track Everything**:
```typescript
// Example tracking
Analytics.track('workout_completed', {
  workout_id: workout.id,
  duration: workout.duration,
  exercises_count: workout.exercises.length,
  total_volume: workout.totalVolume,
  pr_count: workout.newPRs.length
});
```

**User Properties**:
```typescript
Analytics.setUserProperties({
  fitness_level: 'intermediate',
  goals: ['muscle', 'strength'],
  workout_frequency: 4,
  subscription_type: 'premium'
});
```

### INTEGRATION REQUIREMENTS:
- Skip onboarding for existing users
- Connect to auth from Agent 1
- Use design system from Agent 11
- Track social events from Agent 8
- Track notification events from Agent 10

### SUCCESS CRITERIA:
- Smooth onboarding with <10% drop-off
- All key events tracked
- A/B tests running
- Analytics dashboard functional
- Crash-free rate >99%

Start now by creating the branch and building the onboarding flow.

---

## 🚀 QUICK START COMMANDS

```bash
# Terminal 1 - Agent 8
git checkout -b agent-8-social
cd /workspace/mobile
npm install react-native-share react-native-image-crop-picker
# Start implementing social features...

# Terminal 2 - Agent 10  
git checkout -b agent-10-notifications
cd /workspace/mobile
npm install @react-native-firebase/app @react-native-firebase/messaging
# Start implementing notifications...

# Terminal 3 - Agent 12
git checkout -b agent-12-onboarding
cd /workspace/mobile
npm install @mixpanel/react-native react-native-onboarding-swiper
# Start implementing onboarding...
```

---

## 📝 NOTES FOR ALL AGENTS

1. **Use Existing Infrastructure**:
   - Auth system from Agent 1
   - State management from Agent 2
   - UI components from Agent 11
   - Data models from Agents 3 & 4

2. **Maintain Consistency**:
   - Follow existing code patterns
   - Use TypeScript strictly
   - Add proper error handling
   - Include loading states

3. **Test As You Build**:
   - Test on iOS Simulator
   - Test on Android Emulator
   - Handle edge cases
   - Consider offline scenarios

4. **Performance First**:
   - Optimize list rendering
   - Lazy load images
   - Paginate data
   - Cache appropriately

---

*These agents can work in parallel. Coordinate on shared interfaces but develop independently.*