-- User Device Preference Migration
-- Allow users to choose their preferred wearable device instead of automatic priority

-- Add user preferences table for wearable device selection
CREATE TABLE IF NOT EXISTS public.user_wearable_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preferred_device TEXT NOT NULL CHECK (preferred_device IN ('whoop', 'healthkit', 'google_fit', 'manual')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT unique_user_preference UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.user_wearable_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own wearable preferences" ON public.user_wearable_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wearable preferences" ON public.user_wearable_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own wearable preferences" ON public.user_wearable_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wearable preferences" ON public.user_wearable_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Update the unified calories view to respect user choice instead of automatic priority
DROP VIEW IF EXISTS public.user_daily_calories;

CREATE OR REPLACE VIEW public.user_daily_calories AS
SELECT
  user_id,
  activity_date::date as date,

  -- WHOOP data
  whoop_cycles.calories as whoop_cycle_calories,
  COALESCE(whoop_workout_calories.total_calories, 0) as whoop_workout_calories,
  (COALESCE(whoop_cycles.calories, 0) + COALESCE(whoop_workout_calories.total_calories, 0)) as whoop_total_calories,

  -- HealthKit data
  healthkit_daily_activity.active_energy_burned as healthkit_active_calories,
  COALESCE(healthkit_workout_calories.total_calories, 0) as healthkit_workout_calories,
  (COALESCE(healthkit_daily_activity.active_energy_burned, 0) + COALESCE(healthkit_workout_calories.total_calories, 0)) as healthkit_total_calories,

  -- Google Fit data
  google_fit_daily_activity.calories_burned as google_fit_daily_calories,
  COALESCE(google_fit_workout_calories.total_calories, 0) as google_fit_workout_calories,
  (COALESCE(google_fit_daily_activity.calories_burned, 0) + COALESCE(google_fit_workout_calories.total_calories, 0)) as google_fit_total_calories,

  -- Additional Google Fit metrics
  google_fit_daily_activity.steps as google_fit_steps,
  google_fit_daily_activity.distance_meters as google_fit_distance_meters,
  google_fit_daily_activity.active_minutes as google_fit_active_minutes,

  -- User's preferred device
  COALESCE(user_preferences.preferred_device, 'manual') as user_preferred_device,

  -- Final calculated calories based on user preference (ONLY wearable vs manual, not wearable vs wearable)
  CASE
    -- If user prefers WHOOP and has WHOOP data
    WHEN user_preferences.preferred_device = 'whoop' AND (whoop_cycles.calories IS NOT NULL OR whoop_workout_calories.total_calories IS NOT NULL)
    THEN (COALESCE(whoop_cycles.calories, 0) + COALESCE(whoop_workout_calories.total_calories, 0))
    
    -- If user prefers HealthKit and has HealthKit data
    WHEN user_preferences.preferred_device = 'healthkit' AND (healthkit_daily_activity.active_energy_burned IS NOT NULL OR healthkit_workout_calories.total_calories IS NOT NULL)
    THEN (COALESCE(healthkit_daily_activity.active_energy_burned, 0) + COALESCE(healthkit_workout_calories.total_calories, 0))
    
    -- If user prefers Google Fit and has Google Fit data
    WHEN user_preferences.preferred_device = 'google_fit' AND (google_fit_daily_activity.calories_burned IS NOT NULL OR google_fit_workout_calories.total_calories IS NOT NULL)
    THEN (COALESCE(google_fit_daily_activity.calories_burned, 0) + COALESCE(google_fit_workout_calories.total_calories, 0))
    
    -- If user prefers manual or their preferred device has no data, return 0 (manual calculation will be used)
    ELSE 0
  END as final_calories_burned,

  -- Data source reflects user's choice (not automatic priority)
  CASE
    WHEN user_preferences.preferred_device = 'whoop' AND (whoop_cycles.calories IS NOT NULL OR whoop_workout_calories.total_calories IS NOT NULL) THEN 'whoop'
    WHEN user_preferences.preferred_device = 'healthkit' AND (healthkit_daily_activity.active_energy_burned IS NOT NULL OR healthkit_workout_calories.total_calories IS NOT NULL) THEN 'healthkit'
    WHEN user_preferences.preferred_device = 'google_fit' AND (google_fit_daily_activity.calories_burned IS NOT NULL OR google_fit_workout_calories.total_calories IS NOT NULL) THEN 'google_fit'
    ELSE 'manual'
  END as data_source

FROM (
  -- Generate date series for last 90 days for all users with wearable data OR preferences
  SELECT DISTINCT
    user_id,
    generate_series(
      CURRENT_DATE - INTERVAL '90 days',
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date as activity_date
  FROM (
    SELECT user_id FROM whoop_cycles
    UNION
    SELECT user_id FROM healthkit_daily_activity
    UNION
    SELECT user_id FROM whoop_workouts
    UNION
    SELECT user_id FROM healthkit_workouts
    UNION
    SELECT user_id FROM google_fit_daily_activity
    UNION
    SELECT user_id FROM google_fit_workouts
    UNION
    SELECT user_id FROM user_wearable_preferences
  ) all_users
) date_user_matrix

-- Left join user preferences
LEFT JOIN user_wearable_preferences user_preferences ON (
  date_user_matrix.user_id = user_preferences.user_id
)

-- Left join WHOOP cycles
LEFT JOIN whoop_cycles ON (
  date_user_matrix.user_id = whoop_cycles.user_id
  AND date_user_matrix.activity_date = whoop_cycles.cycle_date
)

-- Left join WHOOP workout totals per day
LEFT JOIN (
  SELECT
    user_id,
    workout_date,
    SUM(calories) as total_calories
  FROM whoop_workouts
  GROUP BY user_id, workout_date
) whoop_workout_calories ON (
  date_user_matrix.user_id = whoop_workout_calories.user_id
  AND date_user_matrix.activity_date = whoop_workout_calories.workout_date
)

-- Left join HealthKit daily activity
LEFT JOIN healthkit_daily_activity ON (
  date_user_matrix.user_id = healthkit_daily_activity.user_id
  AND date_user_matrix.activity_date = healthkit_daily_activity.activity_date
)

-- Left join HealthKit workout totals per day
LEFT JOIN (
  SELECT
    user_id,
    workout_date,
    SUM(active_energy_burned) as total_calories
  FROM healthkit_workouts
  GROUP BY user_id, workout_date
) healthkit_workout_calories ON (
  date_user_matrix.user_id = healthkit_workout_calories.user_id
  AND date_user_matrix.activity_date = healthkit_workout_calories.workout_date
)

-- Left join Google Fit daily activity
LEFT JOIN google_fit_daily_activity ON (
  date_user_matrix.user_id = google_fit_daily_activity.user_id
  AND date_user_matrix.activity_date = google_fit_daily_activity.activity_date
)

-- Left join Google Fit workout totals per day
LEFT JOIN (
  SELECT
    user_id,
    workout_date,
    SUM(calories_burned) as total_calories
  FROM google_fit_workouts
  GROUP BY user_id, workout_date
) google_fit_workout_calories ON (
  date_user_matrix.user_id = google_fit_workout_calories.user_id
  AND date_user_matrix.activity_date = google_fit_workout_calories.workout_date
)

ORDER BY user_id, activity_date DESC;

-- Grant permissions
GRANT SELECT ON public.user_daily_calories TO authenticated;
GRANT SELECT ON public.user_daily_calories TO anon;

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_user_wearable_preferences_user_id ON public.user_wearable_preferences(user_id);

-- Comments
COMMENT ON TABLE public.user_wearable_preferences IS 'Stores user preferences for which wearable device to use for calorie tracking';
COMMENT ON VIEW public.user_daily_calories IS 'Unified view that respects user device choice instead of automatic priority between wearables';