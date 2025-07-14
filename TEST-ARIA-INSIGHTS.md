# Testing aria-generate-insights Function

## 🔍 **Step 1: Check if Tables Exist**

Run this in Supabase SQL Editor to verify the required tables:

```sql
-- Check if aria_insights table exists
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'aria_insights'
ORDER BY ordinal_position;

-- Check if supporting tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_name IN ('readiness_scores', 'muscle_load_daily', 'athletes')
  AND table_schema = 'public';
```

## 🏗️ **Step 2: Create aria_insights Table (if missing)**

If the table doesn't exist, create it:

```sql
-- Create aria_insights table
CREATE TABLE IF NOT EXISTS public.aria_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    insight_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_aria_insights_user_date 
ON public.aria_insights(user_id, date);

-- Enable RLS (Row Level Security)
ALTER TABLE public.aria_insights ENABLE ROW LEVEL SECURITY;

-- Add policy for authenticated users
CREATE POLICY "Users can manage their own insights"
ON public.aria_insights
FOR ALL
USING (auth.uid() = user_id);
```

## 👥 **Step 3: Find a Real User ID**

Get an actual athlete UUID to test with:

```sql
-- Find athletes with recent data
SELECT DISTINCT 
    a.id as athlete_id,
    a.name,
    COUNT(r.score) as readiness_count,
    COUNT(m.acute_load) as muscle_load_count
FROM athletes a
LEFT JOIN readiness_scores r ON a.id = r.athlete_uuid 
    AND r.ts >= CURRENT_DATE - INTERVAL '7 days'
LEFT JOIN muscle_load_daily m ON a.id = m.athlete_id 
    AND m.day >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY a.id, a.name
HAVING COUNT(r.score) > 0 OR COUNT(m.acute_load) > 0
LIMIT 5;
```

## 🧪 **Step 4: Test the Function**

Use the Edge Function tester in Supabase Dashboard with a real athlete UUID:

**Request Body:**
```json
{
  "user_id": "PASTE-ATHLETE-UUID-HERE"
}
```

**Expected Response:**
```json
{
  "created": 2
}
```

## ✅ **Step 5: Verify Data Was Inserted**

Check if insights were created:

```sql
-- Check latest insights
SELECT 
    user_id,
    date,
    insight_text,
    created_at
FROM aria_insights 
ORDER BY created_at DESC 
LIMIT 10;

-- Check insights for specific user
SELECT 
    date,
    insight_text,
    created_at
FROM aria_insights 
WHERE user_id = 'PASTE-ATHLETE-UUID-HERE'
ORDER BY created_at DESC;
```

## 📊 **Step 6: Test with Sample Data**

If no real data exists, insert some test data:

```sql
-- Insert test readiness data
INSERT INTO readiness_scores (athlete_uuid, score, ts)
VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', 75, CURRENT_DATE),
    ('123e4567-e89b-12d3-a456-426614174000', 82, CURRENT_DATE - INTERVAL '1 day');

-- Insert test muscle load data
INSERT INTO muscle_load_daily (athlete_id, day, muscle, acute_load, chronic_load, acwr)
VALUES 
    ('123e4567-e89b-12d3-a456-426614174000', CURRENT_DATE, 'chest', 150, 120, 1.25),
    ('123e4567-e89b-12d3-a456-426614174000', CURRENT_DATE, 'legs', 200, 180, 1.11);

-- Now test the function with this UUID: 123e4567-e89b-12d3-a456-426614174000
```

## 🔧 **Step 7: Debug Function Issues**

Check function logs in Supabase Dashboard:

1. Go to **Edge Functions** → **aria-generate-insights**
2. Click **Logs** tab
3. Test the function and watch for errors

Or check via SQL for any error patterns:

```sql
-- Check if there are any constraint violations
SELECT 
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats 
WHERE tablename = 'aria_insights';
```

## 🎯 **Expected Test Results**

### ✅ Successful Test:
- Function returns: `{"created": 2}` or `{"created": 3}`
- SQL query shows new rows in `aria_insights` table
- Insights contain coaching advice about readiness/muscle load

### ❌ Common Issues:

**No data found:**
```json
{"error": "No data available for insight generation"}
```
**Solution:** Add test data or use real athlete UUID

**Table doesn't exist:**
```json
{"error": "Failed to insert insights"}
```
**Solution:** Run the CREATE TABLE script above

**Permission denied:**
```json
{"error": "Database insert failed"}
```
**Solution:** Check RLS policies or use service role key

## 🚀 **Quick Test Command**

Run this complete test in SQL Editor:

```sql
-- Complete test sequence
WITH test_user AS (
  SELECT '123e4567-e89b-12d3-a456-426614174000'::uuid as user_id
)
SELECT 
  'Table exists' as status,
  COUNT(*) as aria_insights_table_count
FROM information_schema.tables 
WHERE table_name = 'aria_insights'

UNION ALL

SELECT 
  'Test data ready' as status,
  COUNT(*) as readiness_data_count
FROM readiness_scores r, test_user t
WHERE r.athlete_uuid = t.user_id
  AND r.ts >= CURRENT_DATE - INTERVAL '1 day';
```

This will help you verify everything is set up correctly before testing the function! 🎉