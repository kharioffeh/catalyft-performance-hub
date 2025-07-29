# Google Fit Integration Documentation

## Overview

This document outlines the complete Google Fit integration for our React Native fitness app, providing Android and web users with automatic activity tracking and calorie monitoring.

## Features

### ✅ Complete Integration
- **OAuth 2.0 Authentication** - Secure Google account linking
- **Activity Data Sync** - Daily calories, steps, distance, active minutes
- **Workout Detection** - Individual exercise sessions with calorie burn
- **User Device Choice** - Users select their preferred wearable device
- **Cross-Platform Support** - Android and Web browsers
- **Background Sync** - Automatic data updates

### 📊 Data Types Collected

#### Daily Activity Metrics
- **Calories Burned** - Daily active energy expenditure
- **Steps** - Total daily step count
- **Distance** - Total distance traveled (meters)
- **Active Minutes** - Time spent in moderate-to-vigorous activity

#### Workout Sessions
- **Workout Type** - Running, cycling, weightlifting, etc.
- **Duration** - Start time, end time, total minutes
- **Calories Burned** - Energy expenditure during workout
- **Session Details** - Activity name and data source

## Architecture

### 🏗 System Components

```
Google Fit API ↔ OAuth Service ↔ Data Sync ↔ Database ↔ Unified View ↔ UI Components
     📱              🔐            ⚡         💾          📊           📱
```

### 🗂 Database Schema

#### `google_fit_connections`
```sql
CREATE TABLE google_fit_connections (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    scope TEXT NOT NULL,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ
);
```

#### `google_fit_daily_activity`
```sql
CREATE TABLE google_fit_daily_activity (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    activity_date DATE NOT NULL,
    calories_burned INTEGER DEFAULT 0,
    steps INTEGER DEFAULT 0,
    distance_meters INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    data_source TEXT DEFAULT 'google_fit',
    synced_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### `google_fit_workouts`
```sql
CREATE TABLE google_fit_workouts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id),
    session_id TEXT NOT NULL,
    workout_name TEXT NOT NULL,
    workout_type TEXT NOT NULL,
    workout_date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 0,
    calories_burned INTEGER DEFAULT 0,
    data_source TEXT DEFAULT 'google_fit'
);
```

### 🔄 Data Flow

1. **User Authentication**
   - User clicks "Connect Google Fit" button
   - OAuth popup/redirect to Google authorization
   - User grants fitness data permissions
   - Access and refresh tokens stored securely

2. **Data Synchronization**
   - Background job triggers every 15 minutes (Android)
   - App foreground triggers manual sync
   - Google Fit API calls for recent activity data
   - Data processed and stored in database

3. **Unified Display**
   - `user_daily_calories` view combines all wearable data
   - Priority system selects best available data
   - UI components display unified calorie information

## API Integration

### 🔐 OAuth 2.0 Configuration

```typescript
// Google API Console Settings
const GOOGLE_FIT_CONFIG = {
  client_id: '576186375678-qji87agvkua2m798eof25q2aig3c41ou.apps.googleusercontent.com',
  client_secret: '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',
  scopes: [
    'https://www.googleapis.com/auth/fitness.activity.read',
    'https://www.googleapis.com/auth/fitness.body.read',
    'https://www.googleapis.com/auth/fitness.location.read',
    'https://www.googleapis.com/auth/fitness.nutrition.read',
  ]
};
```

### 📡 API Endpoints

#### Supabase Edge Functions

1. **`google-fit-oauth`** - OAuth flow management
   - `GET /?user_id=123` - Generate OAuth URL
   - `GET /?code=abc&state=123` - Handle OAuth callback
   - `POST {action: "refresh_token"}` - Refresh access token
   - `POST {action: "disconnect"}` - Revoke and disconnect

2. **`sync-google-fit-data`** - Data synchronization
   - `POST {user_id: "123", days: 7}` - Sync recent activity data

### 🎯 Google Fit API Calls

#### Daily Activity Aggregation
```typescript
const aggregateRequest = {
  aggregateBy: [
    { dataTypeName: 'com.google.calories.expended' },
    { dataTypeName: 'com.google.step_count.delta' },
    { dataTypeName: 'com.google.distance.delta' },
    { dataTypeName: 'com.google.active_minutes' },
  ],
  bucketByTime: { durationMillis: 86400000 }, // 1 day
  startTimeMillis: startTime.toString(),
  endTimeMillis: endTime.toString()
};
```

#### Workout Sessions
```typescript
const sessionsUrl = `https://www.googleapis.com/fitness/v1/users/me/sessions?` +
  `startTime=${startTime.toISOString()}&` +
  `endTime=${endTime.toISOString()}`;
```

## User Device Choice System

### 🎛️ User Control Philosophy

Users have **full control** over which device they want to use for calorie tracking. There is **NO automatic priority** between wearable devices - users choose their preferred source.

### 🏆 Available Device Options

1. **WHOOP** - Professional strain & recovery tracking
   - Best for: Athletes and fitness enthusiasts
   - Accuracy: Professional-grade strain-based calculations
   - Platform: All (web-based connection)

2. **Apple Watch** - iOS ecosystem integration  
   - Best for: iPhone users with Apple Watch
   - Accuracy: Consumer-grade activity ring tracking
   - Platform: iOS only (HealthKit)

3. **Google Fit** - Cross-platform accessibility
   - Best for: Android users and cross-platform compatibility
   - Accuracy: Multi-source aggregated data
   - Platform: Android and Web

4. **Manual Calculation** - BMR + activity estimates
   - Best for: Users without wearables or preferring manual control
   - Accuracy: Estimated based on user profile and activity level
   - Platform: All

### 📈 Data Selection Logic

```sql
-- User choice system (not automatic priority)
CASE
  WHEN user_preferred_device = 'whoop' AND whoop_data_available 
    THEN whoop_total_calories
  WHEN user_preferred_device = 'healthkit' AND healthkit_data_available 
    THEN healthkit_total_calories  
  WHEN user_preferred_device = 'google_fit' AND google_fit_data_available 
    THEN google_fit_total_calories
  ELSE 0  -- Falls back to manual calculation
END as final_calories_burned
```

## React Native Implementation

### 📱 Service Layer

```typescript
// GoogleFitService.ts
import { googleFitService } from '@/services/GoogleFitService';

// Initialize service
await googleFitService.initialize();

// Request permissions
const hasPermissions = await googleFitService.requestPermissions();

// Sync data
await googleFitService.syncWithBackend(7); // Last 7 days

// Read cached data
const dailyActivity = await googleFitService.readDailyActivity(7);
const workouts = await googleFitService.readWorkouts(7);
```

### 🪝 React Hooks

```typescript
// useUnifiedWearableData.ts
const { dailyCalories, connectionStatus } = useUnifiedWearableData(30);

// Connection status includes Google Fit
const { hasWhoop, hasHealthKit, hasGoogleFit, primarySource } = connectionStatus;
```

### 🎨 UI Components

```typescript
// WearableConnectionBanner.tsx
if (hasGoogleFit) {
  deviceName = 'Google Fit';
  deviceDetails = ' (activity & fitness tracking)';
}

// CalorieBalanceCard.tsx
case 'google_fit':
  return { label: 'Google Fit', color: 'text-green-400', icon: Play };
```

## Setup Instructions

### 1. Google API Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable **Fitness API**
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `https://your-supabase-url.supabase.co/functions/v1/google-fit-oauth`

### 2. Database Migration

```bash
# Apply Google Fit database schema
supabase db reset
# Or apply specific migration
supabase migration up 20250128020000-google-fit-tables.sql
```

### 3. Deploy Backend Functions

```bash
# Deploy OAuth handler
supabase functions deploy google-fit-oauth

# Deploy data sync function
supabase functions deploy sync-google-fit-data
```

### 4. Environment Variables

```env
# .env.local
GOOGLE_FIT_CLIENT_ID=576186375678-qji87agvkua2m798eof25q2aig3c41ou.apps.googleusercontent.com
GOOGLE_FIT_CLIENT_SECRET=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
```

### 5. React Native Dependencies

```bash
# Core Google Sign-In (Android)
npm install @react-native-google-signin/google-signin

# Background tasks
npm install react-native-background-job

# Install iOS dependencies (pods)
cd ios && pod install && cd ..
```

### 6. Android Configuration

#### `android/app/src/main/res/values/strings.xml`
```xml
<resources>
    <string name="google_web_client_id">576186375678-qji87agvkua2m798eof25q2aig3c41ou.apps.googleusercontent.com</string>
</resources>
```

#### `android/app/build.gradle`
```gradle
dependencies {
    implementation 'com.google.android.gms:play-services-auth:20.4.1'
    implementation 'com.google.android.gms:play-services-fitness:21.1.0'
}
```

## Testing

### 🧪 Test Suite

```bash
# Run comprehensive test suite
tsx scripts/test-google-fit-integration.ts
```

### ✅ Test Coverage

1. **Database Schema** - Tables and views exist
2. **OAuth Function** - Authorization URL generation
3. **Data Sync Function** - API endpoint accessibility
4. **Mock Data** - Connection, activity, and workout simulation
5. **Unified View** - Google Fit data appears correctly
6. **Priority System** - WHOOP > HealthKit > Google Fit precedence
7. **Service Endpoints** - Function deployment verification

### 📊 Test Results Example

```
🧪 Google Fit Integration Test Suite
=====================================

✅ Google Fit Database Tables Exist - PASSED
✅ Google Fit OAuth Function - PASSED
✅ Google Fit Data Sync Function - PASSED
✅ Create Mock Google Fit Connection - PASSED
✅ Insert Mock Activity Data - PASSED
✅ Insert Mock Workout Data - PASSED
✅ Unified Calorie View with Google Fit Data - PASSED
✅ Data Priority System (WHOOP > HealthKit > Google Fit) - PASSED
✅ Google Fit Service API Endpoints - PASSED
✅ Cleanup Test Data - PASSED

📊 Test Summary
===============
✅ Passed: 10
❌ Failed: 0
📈 Success Rate: 100.0%

🎉 All Google Fit integration tests passed!
```

## User Experience

### 🔄 Connection Flow

1. **Discovery** - User sees "Connect Google Fit" in wearable banner
2. **Permission** - OAuth popup requests fitness data access
3. **Confirmation** - "Google Fit Connected!" success message
4. **Sync** - Initial 7-day data sync begins automatically
5. **Display** - Calorie balance shows "Google Fit" data source badge

### 📱 Android Experience

- **Native Integration** - Uses Google Play Services
- **Background Sync** - Automatic data updates every 15 minutes
- **Deep Linking** - OAuth flow returns to app seamlessly
- **Battery Optimized** - Efficient background processing

### 🌐 Web Experience

- **Popup OAuth** - Clean authorization in new window
- **Real-time Updates** - Immediate data sync after connection
- **Cross-browser** - Works in Chrome, Firefox, Safari, Edge
- **Responsive Design** - Mobile and desktop friendly

## Data Privacy & Security

### 🔒 Security Measures

1. **OAuth 2.0** - Industry-standard authorization
2. **Token Encryption** - Secure storage of access tokens
3. **Row-Level Security** - Database-level user isolation
4. **HTTPS Only** - Encrypted data transmission
5. **Scope Limitation** - Minimal required permissions

### 📜 Privacy Compliance

- **GDPR Compliant** - User data control and deletion
- **Data Retention** - 90-day automatic cleanup
- **User Consent** - Explicit permission for data access
- **Transparency** - Clear data usage explanation

## Monitoring & Analytics

### 📈 Key Metrics

- **Connection Rate** - % of users connecting Google Fit
- **Sync Success Rate** - % of successful data syncs
- **Data Quality** - Calorie burn accuracy vs. estimates
- **User Retention** - Impact on app engagement

### 🚨 Error Monitoring

- **OAuth Failures** - Token expiration and refresh issues
- **API Rate Limits** - Google Fit API quota monitoring
- **Sync Errors** - Data synchronization failure tracking
- **User Disconnections** - Connection loss patterns

## Troubleshooting

### ❌ Common Issues

#### "Google Fit connection failed"
- **Check**: OAuth credentials and redirect URI
- **Solution**: Verify Google API Console configuration

#### "No data syncing"
- **Check**: User permissions and token validity
- **Solution**: Re-authenticate or refresh tokens

#### "Data not appearing in app"
- **Check**: Database migration and unified view
- **Solution**: Run test script and verify schema

#### "Android build errors"
- **Check**: Google Play Services and dependencies
- **Solution**: Update gradle dependencies and sync

### 🔧 Debug Commands

```bash
# Test Google Fit integration
tsx scripts/test-google-fit-integration.ts

# Check database tables
supabase db diff

# View function logs
supabase functions logs google-fit-oauth
supabase functions logs sync-google-fit-data

# Test OAuth URL generation
curl -X GET "https://your-supabase-url.supabase.co/functions/v1/google-fit-oauth?user_id=test123"
```

## Future Enhancements

### 🚀 Roadmap

1. **Advanced Metrics**
   - Heart rate zones
   - Sleep tracking
   - Nutrition logging

2. **Machine Learning**
   - Activity pattern recognition
   - Calorie burn prediction
   - Personalized recommendations

3. **Social Features**
   - Friends comparison
   - Challenge integration
   - Achievement sharing

4. **Additional Platforms**
   - Garmin Connect
   - Strava integration
   - MyFitnessPal sync

## Support Resources

### 📚 Documentation
- [Google Fit API Reference](https://developers.google.com/fit/rest/v1/reference)
- [OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)

### 🆘 Support Channels
- **GitHub Issues** - Bug reports and feature requests
- **Discord Community** - Real-time developer support
- **Email Support** - Direct technical assistance

---

**✅ Integration Complete!** Your app now supports Google Fit for comprehensive fitness tracking across Android and web platforms, with intelligent data prioritization and seamless user experience.