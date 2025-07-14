# ARIA Adjust Program - Testing Setup Guide

## ✅ Issues Fixed

### 1. **Table & Column References**
- ✅ Changed `program_sessions` → `sessions` (correct table name)
- ✅ Changed `scheduled_date` → `start_ts` (correct column name)  
- ✅ Updated load references to use `session.payload.load`
- ✅ Fixed session status updates to store deload info in `payload`

### 2. **Database Schema**
- ✅ Created `session_adjustments` table migration
- ✅ Added proper RLS policies and indexes
- ✅ Fixed column types and constraints

### 3. **ACWR Integration**
- ✅ Function now queries `vw_load_acwr` for ACWR data
- ✅ Uses correct thresholds: `readiness < 60 OR acwr > 1.5`
- ✅ Processes today's sessions (not tomorrow)

### 4. **Realtime Broadcasts**
- ✅ Sends `session_adjusted` events via Supabase Realtime
- ✅ Includes proper payload with athlete_id, session_id, reason

## 🚀 Testing Setup Instructions

### Step 1: Apply Database Migration

**Apply the `session_adjustments` table migration:**

```bash
# Login to Supabase (you'll need to authenticate)
supabase login

# Link to your project
supabase link --project-ref xeugyryfvilanoiethum

# Apply the migration
supabase db push
```

**Alternative - Manual Migration (if CLI issues):**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/xeugyryfvilanoiethum/sql)
2. Run this SQL directly:

```sql
-- Create session_adjustments table for aria-adjust-program
CREATE TABLE IF NOT EXISTS public.session_adjustments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id varchar NOT NULL,
  athlete_uuid uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason varchar NOT NULL CHECK (reason IN ('low_readiness', 'high_acwr')),
  old_load numeric,
  new_load numeric,
  adjustment_factor numeric NOT NULL DEFAULT 1.0,
  old_status varchar NOT NULL,
  new_status varchar NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_adjustments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Coaches can view athlete session adjustments" 
ON public.session_adjustments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.athletes a 
    JOIN public.coaches c ON a.coach_uuid = c.id 
    JOIN public.profiles p ON c.email = p.email 
    WHERE a.id = athlete_uuid AND p.id = auth.uid()
  )
);

CREATE POLICY "Athletes can view own session adjustments" 
ON public.session_adjustments FOR SELECT 
USING (athlete_uuid = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_session_adjustments_athlete_uuid ON public.session_adjustments(athlete_uuid);
CREATE INDEX IF NOT EXISTS idx_session_adjustments_session_id ON public.session_adjustments(session_id);
CREATE INDEX IF NOT EXISTS idx_session_adjustments_created_at ON public.session_adjustments(created_at);

-- Grant permissions
GRANT SELECT, INSERT ON public.session_adjustments TO authenticated;
GRANT SELECT, INSERT ON public.session_adjustments TO service_role;
```

### Step 2: Deploy the Edge Function

```bash
# Deploy the updated function
supabase functions deploy aria-adjust-program

# Check deployment status
supabase functions list
```

### Step 3: Update Cron Schedule

**Apply the updated cron schedule (05:00 instead of 03:00):**

1. Go to [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/xeugyryfvilanoiethum/sql)
2. Run:

```sql
-- Remove old schedule
SELECT cron.unschedule('aria-adjust-program');

-- Add new schedule (05:00)
SELECT cron.schedule(
  'aria-adjust-program',
  '0 5 * * *', -- Every day at 5 AM
  $$
  SELECT
    net.http_post(
        url:='https://xeugyryfvilanoiethum.supabase.co/functions/v1/aria-adjust-program',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWd5cnlmdmlsYW5vaWV0aHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjI4MTIsImV4cCI6MjA2MzgzODgxMn0.oVIVzYllVHBAZjaav7oLunGF5XDK8a5V37DhZKPh_Lk"}'::jsonb,
        body:=concat('{"time": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Verify the schedule
SELECT * FROM cron.job;
```

## 🧪 Testing the Function

### Manual Test

**Test the function directly:**

```bash
# Call the function manually
curl -X POST \
  https://xeugyryfvilanoiethum.supabase.co/functions/v1/aria-adjust-program \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhldWd5cnlmdmlsYW5vaWV0aHVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgyNjI4MTIsImV4cCI6MjA2MzgzODgxMn0.oVIVzYllVHBAZjaav7oLunGF5XDK8a5V37DhZKPh_Lk" \
  -d '{"test": true}'
```

### Test Data Setup

**Create test data to trigger adjustments:**

```sql
-- Insert test athlete with low readiness
UPDATE profiles 
SET last_readiness = 50  -- Below 60 threshold
WHERE id = 'your-test-athlete-uuid';

-- Insert test session for today
INSERT INTO sessions (
  athlete_uuid,
  start_ts,
  status,
  payload
) VALUES (
  'your-test-athlete-uuid',
  NOW(),  -- Today
  'planned',
  '{"load": 100, "volume": 80}'::jsonb
);
```

### Monitor Results

**Check if adjustments worked:**

```sql
-- Check adjusted sessions
SELECT * FROM sessions 
WHERE status = 'deload' 
ORDER BY updated_at DESC;

-- Check adjustment logs
SELECT * FROM session_adjustments 
ORDER BY created_at DESC;

-- Check function logs
```

**Monitor realtime broadcasts:**
- Open browser dev tools on your app
- Listen for `session_adjusted` events on the `athlete:${athlete_id}` channel

## 🔍 Verification Checklist

- [ ] `session_adjustments` table exists
- [ ] Function deploys without errors
- [ ] Cron job scheduled for 05:00
- [ ] Test data triggers adjustments
- [ ] Sessions get `status = 'deload'`
- [ ] Adjustment logs are created
- [ ] Realtime broadcasts are sent
- [ ] Function processes ACWR correctly
- [ ] Thresholds work: readiness < 60 OR acwr > 1.5

## 🐛 Troubleshooting

**Function Logs:**
```bash
supabase functions logs aria-adjust-program --follow
```

**Common Issues:**
1. **No athletes processed**: Check `profiles.last_readiness` is populated
2. **No ACWR data**: Verify `vw_load_acwr` view exists and has data
3. **No sessions found**: Ensure sessions exist with `start_ts` for today
4. **Permission errors**: Check RLS policies on tables
5. **Deployment fails**: Verify function syntax and dependencies

**SQL Debugging:**
```sql
-- Check athletes with readiness data
SELECT id, last_readiness FROM profiles WHERE last_readiness IS NOT NULL;

-- Check ACWR data availability
SELECT * FROM vw_load_acwr ORDER BY day DESC LIMIT 10;

-- Check today's sessions
SELECT * FROM sessions WHERE start_ts::date = CURRENT_DATE;
```

## 🎯 Expected Behavior

When working correctly, the function will:

1. **Daily at 05:00**: Automatically run via cron
2. **Check each athlete**: Get readiness + ACWR data
3. **Apply thresholds**: Identify sessions needing adjustment
4. **Deload sessions**: Set status to 'deload' if readiness < 60 OR ACWR > 1.5
5. **Log adjustments**: Record all changes in `session_adjustments`
6. **Broadcast updates**: Send realtime notifications to affected athletes
7. **Return summary**: Report total athletes processed and adjustments made

The function is now ready for testing! 🚀