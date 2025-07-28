# Session Tracking System Implementation

## Overview

This implementation provides a comprehensive session tracking system for the mobile training app. Users can start sessions from the calendar, track their workouts with real-time strain monitoring, and automatically complete programs when all sessions are finished.

## System Components

### 1. ActiveSessionScreen (`src/pages/mobile/ActiveSessionScreen.tsx`)
The main session tracking interface with:
- **Session Status Management**: Start, pause, resume, and end sessions
- **Real-time Strain Monitoring**: Visual dial showing current vs optimal strain
- **Exercise Tracking**: Set-by-set logging with reps, weight, and completion
- **RPE and Notes**: Capture perceived exertion and session notes
- **Timer**: Track session duration with pause/resume functionality

### 2. StrainDial Component (`src/pages/mobile/components/StrainDial.tsx`)
A visual circular dial that:
- Displays current strain (0-21 scale) vs target strain for session type
- Color-coded zones: Recovery (green), Low (blue), Moderate (amber), High (orange), Very High (red)
- Animated progress with spring animations
- Contextual guidance messages based on proximity to target

### 3. Session Supporting Components

#### SessionTimer (`src/pages/mobile/components/SessionTimer.tsx`)
- Real-time elapsed time tracking
- Pause/resume functionality with accumulated paused time
- Color-coded based on session duration (green < 1hr, amber < 2hr, red > 2hr)

#### SessionControls (`src/pages/mobile/components/SessionControls.tsx`)
- Start/Pause/Resume/End session buttons
- RPE selection modal with 1-10 scale and descriptions
- Notes input modal for session observations
- Context-sensitive button states

#### ExerciseTracker (`src/pages/mobile/components/ExerciseTracker.tsx`)
- Track sets, reps, and weight for each exercise
- Real-time strain calculation based on volume and intensity
- Exercise completion tracking
- Volume statistics per exercise

### 4. Session Management Hook (`src/hooks/useSessionTracking.ts`)
Centralized session state management:
- **Session Lifecycle**: Start, update, pause, resume, complete
- **Program Completion Detection**: Automatically marks programs as complete
- **Set Logging**: Persist exercise data to database
- **Error Handling**: User-friendly error messages and loading states

### 5. Calendar Integration (`src/pages/mobile/CalendarScreen.tsx`)
Enhanced calendar with:
- Visual session status indicators (🟢 active, ▶️ planned)
- Clickable sessions that launch ActiveSessionScreen
- Status-based border colors and hover effects

## User Flow

### 1. Starting a Session
1. User views calendar and sees planned sessions
2. Taps on a session card
3. Navigates to ActiveSessionScreen
4. Reviews session details and strain target
5. Taps "Start Session" button
6. Session status changes to 'active' in database

### 2. During Session
1. **Strain Monitoring**: Real-time dial shows current strain vs target
2. **Exercise Tracking**: Log sets, reps, and weights
3. **Strain Updates**: Automatically calculated based on exercise data
4. **RPE Tracking**: Capture perceived exertion (1-10 scale)
5. **Notes**: Add observations about the session
6. **Pause/Resume**: Flexible session management

### 3. Completing a Session
1. User taps "End Session"
2. Confirmation dialog appears
3. Session data saved with final strain, RPE, and notes
4. System checks if all program sessions are complete
5. If program complete, marks program instance as 'completed'
6. Success notification and navigation back to calendar

## Target Strain Calculation

Session types have different optimal strain targets:
- **Strength**: 12 (moderate intensity, lower volume)
- **Conditioning**: 16 (high intensity cardio work)
- **Recovery**: 6 (light movement, active recovery)
- **Technical**: 8 (skill work, low physiological stress)
- **Hypertrophy**: 14 (moderate-high volume for muscle growth)

## Strain Calculation Algorithm

Current strain is calculated from exercise data:
```typescript
const baseStrain = Math.min(totalVolume / 1000, 15);
const intensityStrain = completedSets > 0 ? (totalSets / completedSets) * 2 : 0;
const finalStrain = Math.min(baseStrain + intensityStrain, 21);
```

Where:
- `totalVolume` = sum of (reps × weight × RPE factor) for completed sets
- `intensityStrain` = density factor based on completion rate
- Maximum strain capped at 21 (Whoop-style scale)

## Database Schema Requirements

### Sessions Table
```sql
- id: uuid (primary key)
- user_uuid: uuid (foreign key)
- program_id: uuid (foreign key, nullable)
- type: text (strength, conditioning, etc.)
- status: text (planned, active, completed)
- start_ts: timestamp
- end_ts: timestamp
- strain: float (0-21)
- rpe: integer (1-10)
- notes: text
- exercises: jsonb (exercise list with sets/reps)
```

### Set Logs Table
```sql
- id: uuid (primary key)
- session_id: uuid (foreign key)
- exercise_id: uuid (foreign key)
- set_no: integer
- reps: integer
- load: float (kg)
- rpe: integer (1-10)
- completed: boolean
```

### Program Instance Table
```sql
- id: uuid (primary key)
- user_uuid: uuid (foreign key)
- template_id: uuid (foreign key, nullable)
- status: text (pending, active, completed)
- start_date: date
- end_date: date
```

## Integration Points

### Mobile Navigation
For React Native apps, add navigation route:
```typescript
// In your navigation stack
<Stack.Screen 
  name="ActiveSession" 
  component={ActiveSessionScreen}
  options={{ title: 'Training Session' }}
/>
```

### Web Integration
For web applications, sessions can open in:
- Modal overlays
- Dedicated session pages
- Full-screen session tracking interfaces

## Key Features

### ✅ Real-time Strain Monitoring
- Visual dial with target zones
- Automatic calculation from exercise data
- Session-type specific targets

### ✅ Complete Session Lifecycle
- Start, pause, resume, end
- Database persistence
- Error handling and loading states

### ✅ Exercise Tracking
- Set-by-set logging
- Weight and rep tracking
- Exercise completion status

### ✅ Program Completion Detection
- Automatic program status updates
- Celebration notifications
- Program instance management

### ✅ User Experience
- Intuitive controls and feedback
- Visual strain guidance
- Contextual help messages

## Future Enhancements

1. **Wearable Integration**: Connect heart rate monitors for real-time biometric strain
2. **Exercise Library Integration**: Link exercises to detailed instructions and videos
3. **Social Features**: Share completed sessions and achievements
4. **Analytics Dashboard**: Historical strain trends and performance metrics
5. **AI Coaching**: Automated training load recommendations based on strain patterns

## Testing the System

1. Create a test session in the database
2. Navigate to calendar and tap the session
3. Start the session and log some exercises
4. Monitor strain dial updates
5. Complete the session and verify data persistence
6. Check program completion logic with multiple sessions

This implementation provides a solid foundation for comprehensive workout tracking with strain monitoring, setting up users for data-driven training optimization.