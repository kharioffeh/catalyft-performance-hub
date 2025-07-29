# WHOOP Integration Enhancement for Calorie Tracking

## Overview
Enhanced the existing WHOOP integration to provide accurate calorie burn data for the nutrition calorie balance feature. This integrates with WHOOP's v2 API to pull daily activity cycles and workout sessions.

## What Was Added

### 1. Database Tables
**File**: `supabase/migrations/20250128000000-whoop-activity-tables.sql`
- `whoop_cycles` - Daily activity/strain data with calories
- `whoop_workouts` - Individual workout sessions with calories
- Both tables auto-convert kilojoules to calories using stored computed columns

### 2. WHOOP Data Sync Function
**File**: `supabase/functions/pull-whoop-activity/index.ts`
- Pulls data from WHOOP v2 API endpoints:
  - `/v2/cycle` - Daily physiological cycles
  - `/v2/activity/workout` - Individual workouts
- Converts kilojoules to calories (1 kJ = 0.239006 calories)
- Stores comprehensive activity data including strain, heart rate, sports

### 3. Updated Calorie Balance Hook
**File**: `src/hooks/useCalorieBalance.ts`
- Now queries WHOOP activity data for accurate calorie burn
- Combines cycle calories (baseline) + workout calories (additional exercise)
- Falls back to estimation if WHOOP data unavailable

### 4. Enhanced Wearable Banner
**File**: `src/components/nutrition/WearableConnectionBanner.tsx`
- Shows WHOOP connection status
- Displays specific messaging for WHOOP users
- Includes WHOOP connect button

### 5. Automated Sync
**File**: `supabase/functions/cron-whoop-sync/index.ts`
- Daily cron job to sync WHOOP data automatically
- Calls the pull-whoop-activity function

## WHOOP Data Structure

### Calories Calculation
- **Cycle Calories**: Daily baseline activity from WHOOP physiological cycles
- **Workout Calories**: Additional calories from logged exercises/sports
- **Total Daily Calories**: Cycle + Workout calories combined

### Data Sources
- **WHOOP Cycles**: `strain`, `kilojoules`, `average_heart_rate`, `max_heart_rate`
- **WHOOP Workouts**: `sport_name`, `kilojoules`, `distance`, `heart_rate_zones`

## Setup Instructions

### 1. Run the Migration
```bash
# Apply the database migration
supabase db reset  # or push the new migration
```

### 2. Deploy Functions
```bash
# Deploy the new WHOOP sync functions
supabase functions deploy pull-whoop-activity
supabase functions deploy cron-whoop-sync
```

### 3. Set up Cron Job (Optional)
Set up a daily cron job to call the sync function:
```bash
# Example: Daily at 6 AM UTC
0 6 * * * curl -X POST https://your-project.supabase.co/functions/v1/cron-whoop-sync \
  -H "Authorization: Bearer YOUR_SERVICE_ROLE_KEY"
```

### 4. Test the Integration
1. Connect WHOOP device via the app
2. Manually trigger sync: `POST /functions/v1/pull-whoop-activity`
3. Check nutrition page for accurate calorie balance data

## API Endpoints Used

### WHOOP v2 API
- **Cycles**: `GET /v2/cycle` - Daily activity data
- **Workouts**: `GET /v2/activity/workout` - Exercise sessions
- **Scopes Required**: `read:cycles read:workout` (already configured)

### Required OAuth Scopes
The existing WHOOP OAuth already includes the necessary scopes:
- `read:recovery` ✅ (existing)
- `read:cycles` ✅ (for daily activity)
- `read:workout` ✅ (for exercise sessions)

## Benefits for Users

### Accurate Calorie Tracking
- Real calorie burn data instead of estimates
- Includes both baseline activity and exercise sessions
- Accounts for individual physiology via WHOOP's advanced algorithms

### Visual Calorie Balance
- See exact deficit/surplus in real-time
- Track weekly trends of intake vs expenditure
- Get contextual health insights based on balance

### Seamless Integration
- Automatic data sync (if cron job configured)
- Works with existing nutrition logging
- Falls back gracefully if WHOOP not connected

## Testing

### Manual Testing
1. **With WHOOP**: Connect WHOOP, trigger sync, verify calorie data appears
2. **Without WHOOP**: Ensure fallback to estimated calories works
3. **Mixed Users**: Test that both WHOOP and non-WHOOP users see appropriate data

### Data Validation
- Verify kilojoule to calorie conversion (1 kJ = 0.239006 cal)
- Check that workout calories add to cycle calories correctly
- Ensure dates align properly between WHOOP and nutrition data

## Next Steps: Apple Watch/HealthKit Integration

After WHOOP is working, the next phase will add:
1. HealthKit integration for iOS users
2. Similar database tables for HealthKit data
3. Unified wearable data interface
4. Priority system (WHOOP > Apple Watch > estimates)

## Troubleshooting

### Common Issues
- **No WHOOP data**: Check if user has connected WHOOP and sync has run
- **Missing calories**: Verify WHOOP scopes include `read:cycles` and `read:workout`
- **Old data**: WHOOP API has rate limits, sync pulls last 7 days by default

### Debug Commands
```bash
# Check WHOOP connection
SELECT * FROM whoop_tokens WHERE user_id = 'user-id';

# Check synced data
SELECT * FROM whoop_cycles WHERE user_id = 'user-id' ORDER BY cycle_date DESC;
SELECT * FROM whoop_workouts WHERE user_id = 'user-id' ORDER BY workout_date DESC;

# Manual sync trigger
POST /functions/v1/pull-whoop-activity
```