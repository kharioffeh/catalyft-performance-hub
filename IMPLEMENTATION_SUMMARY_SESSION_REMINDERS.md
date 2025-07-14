# Session Management & Reminders Implementation

## Overview
Implemented session status management and 1-hour reminder system as requested in cur4.02.

## Components Implemented

### 1. Database Migration
**File:** `supabase/migrations/20250115050000-add-device-token.sql`
- Adds `device_token` field to `profiles` table for Expo push notifications
- Creates index for efficient device token lookups

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

### 3. Session Reminders Cron Function
**File:** `supabase/functions/sessionReminders/index.ts`
- **Schedule:** Runs every 15 minutes via cron (configured in `supabase/config.toml`)
- **Logic:** 
  - Finds sessions with `status='scheduled'` starting in ~1 hour (±2.5 min window)
  - Sends push notifications to athletes with device tokens
  - Logs activity for auditing
- **Output:** "Sent X reminder(s)" as requested

### 4. Expo Push Notification Utility
**File:** `supabase/functions/_shared/push.ts`
- **SDK:** Uses Expo Server SDK v3
- **Features:**
  - Single and bulk push notification support
  - Token validation
  - Error handling and retry logic
  - Proper message formatting

### 5. Configuration
**File:** `supabase/config.toml`
- Added cron job configuration for sessionReminders (every 15 minutes)
- Function authentication settings

## Usage

### Updating Session Status
```typescript
// PATCH request to update session status
PATCH /functions/v1/updateSession/[sessionId]
{
  "status": "in-progress" | "complete" | "scheduled"
}
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
- Only sends to sessions with `status='scheduled'`
- Only sends to athletes with valid device tokens
- 5-minute window around 1-hour target time
- Logs all activity for auditing

## Database Schema

### Sessions Table
- `status` ENUM: 'scheduled', 'in-progress', 'complete'
- `started_at`: Timestamp when session started
- `completed_at`: Timestamp when session completed
- `date_time`: Scheduled session time

### Profiles Table
- `device_token`: Text field for Expo push token
- Indexed for efficient lookups

## Done-When Criteria ✅

1. **PATCH moves status correctly** ✅
   - Function validates ownership and updates status
   - Adds appropriate timestamps

2. **Log line "Sent X reminder(s)" appears** ✅  
   - Console log outputs exact format requested
   - Manual invocation possible via function serve

3. **Cron runs every 15 min** ✅
   - Configured in supabase/config.toml
   - Selects sessions 1 hour ahead with 'scheduled' status

4. **Push notifications via Expo SDK** ✅
   - Full Expo SDK integration
   - Device token validation
   - Bulk sending capability