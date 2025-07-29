# Apple Watch/HealthKit Integration

## Overview
This integration adds Apple Watch support to the calorie tracking system, providing accurate calorie burn data from HealthKit. The system prioritizes data sources: WHOOP > Apple Watch > estimates.

## Architecture

### Data Flow
```
Apple Watch/iPhone → HealthKit → React Native App → Backend API → Database → Frontend
```

### Priority System
1. **WHOOP data** (highest priority) - Professional athlete-grade accuracy
2. **HealthKit data** (fallback) - Apple Watch activity rings and workouts
3. **Estimated data** (fallback) - Basic calculations from steps/strain

## Components

### 1. Database Tables
**Files**: `supabase/migrations/20250128010000-healthkit-tables.sql`

#### `healthkit_daily_activity`
Stores daily activity ring data from Apple Watch:
- Active energy burned (calories)
- Activity ring progress (Move, Exercise, Stand)
- Heart rate metrics (resting, average, max, HRV)
- Steps, distance, flights climbed
- Sleep data (if available)

#### `healthkit_workouts`
Stores individual workout sessions:
- Workout type and duration
- Energy burned during exercise
- Performance metrics (distance, pace, heart rate zones)
- Device information

#### `user_daily_calories` (View)
Unified view that combines WHOOP and HealthKit data with priority logic:
```sql
-- Priority logic: WHOOP > HealthKit > estimates
CASE 
  WHEN whoop_total_calories > 0 THEN whoop_total_calories
  WHEN healthkit_total_calories > 0 THEN healthkit_total_calories
  ELSE estimated_calories
END as final_calories_burned
```

### 2. Backend API
**File**: `supabase/functions/sync-healthkit-data/index.ts`

Secure endpoint that:
- Authenticates users via Supabase Auth
- Validates HealthKit data format
- Stores daily activity and workout data
- Handles upserts for data updates
- Returns sync status and metrics

### 3. Frontend Integration
**Files**: 
- `src/hooks/useUnifiedWearableData.ts` - Unified data access
- `src/components/nutrition/WearableConnectionBanner.tsx` - Connection status
- `src/components/nutrition/CalorieBalanceCard.tsx` - Data source display

Features:
- Automatic data source detection
- Real-time connection status
- Visual indicators for data sources
- Fallback to estimates when disconnected

### 4. iOS Service
**File**: `src/services/HealthKitService.ts`

React Native service that:
- Requests HealthKit permissions
- Reads activity and workout data
- Transforms data for backend API
- Handles background sync observers
- Manages error states and fallbacks

## Setup Instructions

### 1. Database Setup
```bash
# Apply the HealthKit migration
supabase db reset  # or push the new migration files
```

### 2. Deploy Backend Functions
```bash
# Deploy the HealthKit sync endpoint
supabase functions deploy sync-healthkit-data
```

### 3. iOS React Native Integration

#### Install Dependencies
```bash
npm install react-native-health
# For iOS, also install pods
cd ios && pod install
```

#### iOS Configuration

1. **Add HealthKit Capability**
   - Open iOS project in Xcode
   - Select your target → Signing & Capabilities
   - Add "HealthKit" capability

2. **Update Info.plist**
   ```xml
   <key>NSHealthShareUsageDescription</key>
   <string>This app reads health data to provide accurate calorie tracking and fitness insights.</string>
   <key>NSHealthUpdateUsageDescription</key>
   <string>This app writes workout data to keep your health records synchronized.</string>
   ```

3. **Import and Initialize Service**
   ```typescript
   import { healthKitService } from '@/services/HealthKitService';
   
   // Initialize HealthKit
   const initializeHealthKit = async () => {
     const isAvailable = await healthKitService.initialize();
     if (isAvailable) {
       const hasPermissions = await healthKitService.requestPermissions();
       if (hasPermissions) {
         await healthKitService.setupBackgroundSync();
         await healthKitService.syncWithBackend(7); // Sync last 7 days
       }
     }
   };
   ```

### 4. Background Sync (Optional)
```typescript
// Set up automatic sync when health data changes
await healthKitService.setupBackgroundSync();

// Manual sync trigger (e.g., when app becomes active)
AppState.addEventListener('change', (nextAppState) => {
  if (nextAppState === 'active') {
    healthKitService.syncWithBackend(1); // Sync yesterday's data
  }
});
```

## Data Types and Mapping

### HealthKit → API Mapping

#### Daily Activity
| HealthKit Type | API Field | Description |
|---|---|---|
| `HKQuantityTypeIdentifierActiveEnergyBurned` | `activeEnergyBurned` | Move ring calories |
| `HKQuantityTypeIdentifierBasalEnergyBurned` | `basalEnergyBurned` | Resting calories |
| `HKQuantityTypeIdentifierStepCount` | `steps` | Daily steps |
| `HKQuantityTypeIdentifierDistanceWalkingRunning` | `distanceWalkedMeters` | Walking/running distance |
| `HKQuantityTypeIdentifierFlightsClimbed` | `flightsClimbed` | Stairs climbed |
| `HKQuantityTypeIdentifierRestingHeartRate` | `restingHeartRate` | Resting heart rate |
| `HKQuantityTypeIdentifierHeartRateVariabilitySDNN` | `heartRateVariability` | HRV (RMSSD) |

#### Workouts
| HealthKit Type | API Field | Description |
|---|---|---|
| `HKWorkout.workoutActivityType` | `workoutTypeId` | Activity type ID |
| `HKWorkout.totalEnergyBurned` | `activeEnergyBurned` | Calories burned |
| `HKWorkout.totalDistance` | `distanceMeters` | Workout distance |
| `HKWorkout.startDate/endDate` | `startTime/endTime` | Workout timing |

### Workout Activity Types
Common `HKWorkoutActivityType` mappings:
- `37` = Running
- `13` = Cycling  
- `35` = Walking
- `46` = Swimming
- `3` = Functional Strength Training
- `52` = High Intensity Interval Training

## Testing

### 1. Manual Testing
```bash
# Run the integration test
npm run test-apple-watch  # (if script is configured)
# or
tsx scripts/test-apple-watch-integration.ts
```

### 2. Verify Data Flow
1. **iOS App**: Check HealthKit permissions granted
2. **API**: Verify sync endpoint receives data
3. **Database**: Confirm data is stored correctly
4. **Frontend**: Check unified view shows Apple Watch data

### 3. Test Priority System
- Connect both WHOOP and Apple Watch
- Verify WHOOP data takes priority when available
- Confirm Apple Watch data is used when WHOOP unavailable

## Troubleshooting

### Common Issues

#### No Data Syncing
- **Check HealthKit permissions**: Use `getPermissionStatus()`
- **Verify device compatibility**: HealthKit requires iOS 8+ and physical device
- **Check background app refresh**: Enable for app in iOS Settings

#### API Errors
- **Authentication**: Ensure valid Supabase session
- **Data format**: Verify data matches API interface
- **Rate limiting**: HealthKit has daily query limits

#### Priority Issues
- **Check unified view logic**: Verify database view priority SQL
- **Data timing**: Ensure dates align between systems
- **Cache invalidation**: Clear app data if priority seems stuck

### Debug Commands
```sql
-- Check HealthKit data
SELECT * FROM healthkit_daily_activity 
WHERE user_id = 'user-id' 
ORDER BY activity_date DESC LIMIT 5;

-- Check unified view
SELECT * FROM user_daily_calories 
WHERE user_id = 'user-id' 
ORDER BY date DESC LIMIT 5;

-- Check data sources by date
SELECT date, data_source, final_calories_burned,
       whoop_total_calories, healthkit_total_calories
FROM user_daily_calories 
WHERE user_id = 'user-id' 
ORDER BY date DESC;
```

## Performance Considerations

### Data Sync Frequency
- **Background observers**: Triggered by HealthKit changes
- **App lifecycle**: Sync when app becomes active  
- **Manual sync**: User-initiated or scheduled
- **Rate limits**: Respect HealthKit's query limitations

### Battery Impact
- Use HealthKit observers instead of polling
- Batch sync requests to reduce API calls
- Sync only recent data (last 7 days) in background
- Full sync only when needed

## Privacy and Permissions

### Required Permissions
```typescript
const permissions = {
  read: [
    'ActiveEnergyBurned',    // Move ring
    'BasalEnergyBurned',     // Resting calories
    'Workout',               // Exercise sessions
    'ActivitySummary',       // Activity rings
    'Steps',                 // Step count
    'HeartRate',             // Heart rate data
    'RestingHeartRate',      // Resting HR
    'HeartRateVariabilitySDNN' // HRV
  ]
};
```

### Data Handling
- All data encrypted in transit (HTTPS)
- Stored securely in Supabase with RLS
- Users can disconnect at any time
- Data is user-specific and private

## Future Enhancements

### Planned Features
1. **Real-time sync**: Live activity ring updates
2. **Workout zones**: Detailed heart rate zone analysis
3. **Sleep integration**: Advanced sleep tracking
4. **Trend analysis**: Weekly/monthly activity patterns
5. **Goal tracking**: Custom activity ring goals

### Integration Opportunities
1. **Apple Fitness+**: Workout session integration
2. **Third-party apps**: Strava, MyFitnessPal sync
3. **Shortcuts**: Siri automation support
4. **Apple Health**: Two-way data sync

## Support

### Resources
- [HealthKit Documentation](https://developer.apple.com/documentation/healthkit)
- [react-native-health](https://github.com/agencyenterprise/react-native-health)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

### Getting Help
1. Check troubleshooting section above
2. Run test script to verify setup
3. Check device logs for HealthKit errors
4. Verify API endpoint is deployed and accessible