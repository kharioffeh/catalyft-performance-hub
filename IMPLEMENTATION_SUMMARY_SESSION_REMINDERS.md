# Session Management & Customizable Reminders Implementation

## Overview
Implemented session status management and fully customizable reminder system with user preferences as requested in cur4.02 and enhanced per follow-up requirements.

**Key Features:**
- ✅ Session status updates with ownership validation
- ✅ Customizable reminder frequencies (5 minutes to 24 hours)
- ✅ Toggle reminders on/off per user
- ✅ Dynamic message generation based on user preferences
- ✅ Multi-frequency cron support in single function
- ✅ User-friendly settings management endpoints

## Components Implemented

### 1. Database Migrations
**Files:** 
- `supabase/migrations/20250115050000-add-device-token.sql`
  - Adds `device_token` field to `profiles` table for Expo push notifications
  - Creates index for efficient device token lookups

- `supabase/migrations/20250115060000-add-reminder-preferences.sql`
  - Adds `reminder_enabled` boolean field (default: true)
  - Adds `reminder_frequency_minutes` integer field (default: 60, range: 5-1440 minutes)
  - Creates constraint for reasonable frequency ranges
  - Adds index for efficient enabled reminder lookups

### 2. Session Update Edge Function
**File:** `supabase/functions/updateSession/index.ts`
- **Endpoint:** Functions as PATCH `/api/session/:id` equivalent
- **Authentication:** Validates user ownership (coach → athlete, solo → self)
- **Statuses:** Accepts 'in-progress', 'complete', 'scheduled'
- **Features:**
  - Validates session ownership before updates
  - Adds timestamps (`started_at`, `completed_at`) based on status
  - Returns updated session data
  - Proper error handling and HTTP responses

### 3. Session Reminders Cron Function (Enhanced)
**File:** `supabase/functions/sessionReminders/index.ts`
- **Schedule:** Runs every 15 minutes via cron (configured in `supabase/config.toml`)
- **Logic:** 
  - Fetches all unique reminder frequencies from users with reminders enabled
  - Checks for sessions at each frequency interval (5 min to 24 hours)
  - Only sends to users with `reminder_enabled=true` and matching frequency
  - Dynamic reminder messages based on user's frequency preference
  - Logs activity for auditing
- **Output:** "Sent X reminder(s)" as requested

### 4. Reminder Settings Management
**Files:**
- `supabase/functions/updateReminderSettings/index.ts`
  - **Endpoint:** PATCH to update user reminder preferences
  - **Features:** Toggle reminders on/off, change frequency (5-1440 minutes)
  - **Validation:** Ensures frequency is within acceptable range
  - **Response:** User-friendly messages about current settings

- `supabase/functions/getReminderSettings/index.ts`
  - **Endpoint:** GET current user reminder settings
  - **Features:** Returns current settings with formatted display text
  - **Includes:** List of available frequency options for UI dropdowns

### 5. Expo Push Notification Utility
**File:** `supabase/functions/_shared/push.ts`
- **SDK:** Uses Expo Server SDK v3
- **Features:**
  - Single and bulk push notification support
  - Token validation
  - Error handling and retry logic
  - Proper message formatting

### 6. Configuration
**File:** `supabase/config.toml`
- Added cron job configuration for sessionReminders (every 15 minutes)
- Function authentication settings for all new endpoints
- JWT verification enabled for user-facing endpoints

## Usage

### Updating Session Status
```typescript
// PATCH request to update session status
PATCH /functions/v1/updateSession/[sessionId]
{
  "status": "in-progress" | "complete" | "scheduled"
}
```

### Managing Reminder Settings
```typescript
// GET current reminder settings
GET /functions/v1/getReminderSettings

// PATCH to update reminder settings
PATCH /functions/v1/updateReminderSettings
{
  "reminder_enabled": true,
  "reminder_frequency_minutes": 30  // 5-1440 minutes
}

// Examples:
// Turn off reminders
{ "reminder_enabled": false }

// Change to 30 minute reminders  
{ "reminder_frequency_minutes": 30 }

// Enable 2-hour reminders
{ "reminder_enabled": true, "reminder_frequency_minutes": 120 }
```

### Manual Cron Invocation
```bash
# This command would show the "Sent X reminder(s)" log
supabase functions serve sessionReminders --no-verify-jwt
```

## Validation Rules

### Session Updates
- **Coach:** Can update sessions for their athletes
- **Solo athlete:** Can update their own sessions
- **Athlete:** Can update sessions in their program

### Reminders
- Only sends to users with `reminder_enabled=true`
- Only sends to sessions with `status='scheduled'`
- Only sends to athletes with valid device tokens
- Respects individual user's `reminder_frequency_minutes` setting
- 5-minute window around each target time interval
- Supports frequencies from 5 minutes to 24 hours
- Dynamic message generation based on user's frequency
- Logs all activity for auditing

### Reminder Settings
- Frequency must be between 5 and 1440 minutes (5 min to 24 hours)
- Default settings: enabled=true, frequency=60 minutes
- Users can toggle reminders on/off independently of frequency
- Settings are per-user and persist across sessions

## Database Schema

### Sessions Table
- `status` ENUM: 'scheduled', 'in-progress', 'complete'
- `started_at`: Timestamp when session started
- `completed_at`: Timestamp when session completed
- `date_time`: Scheduled session time

### Profiles Table
- `device_token`: Text field for Expo push token
- `reminder_enabled`: Boolean field (default: true)
- `reminder_frequency_minutes`: Integer field (default: 60, range: 5-1440)
- Indexed for efficient device token and reminder lookups
- Constraint ensures reasonable frequency ranges

## Done-When Criteria ✅

### Original Requirements (cur4.02)
1. **PATCH moves status correctly** ✅
   - Function validates ownership and updates status
   - Adds appropriate timestamps

2. **Log line "Sent X reminder(s)" appears** ✅  
   - Console log outputs exact format requested
   - Manual invocation possible via function serve

3. **Cron runs every 15 min** ✅
   - Configured in supabase/config.toml
   - Selects sessions at custom intervals with 'scheduled' status

4. **Push notifications via Expo SDK** ✅
   - Full Expo SDK integration
   - Device token validation
   - Bulk sending capability

### Enhanced Requirements (Customizable Reminders)
5. **Turn reminders on/off** ✅
   - Users can disable reminders via `reminder_enabled` field
   - Function respects user preferences
   - Easy toggle via updateReminderSettings endpoint

6. **Edit reminder frequency** ✅
   - Support for 5 minutes to 24 hours (5-1440 minutes)
   - Dynamic message generation based on frequency
   - Cron automatically handles multiple frequencies
   - User-friendly frequency options provided

7. **Persistent user preferences** ✅
   - Settings stored in profiles table
   - Default values (enabled=true, 60 minutes)
   - Validation and constraints enforced
   - GET/PATCH endpoints for management