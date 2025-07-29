-- Google Fit Integration Tables
-- Add Google Fit authentication and data storage

-- Table for Google Fit OAuth connections
CREATE TABLE IF NOT EXISTS public.google_fit_connections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    scope TEXT NOT NULL,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT unique_google_fit_user UNIQUE(user_id)
);

-- Table for Google Fit daily activity data
CREATE TABLE IF NOT EXISTS public.google_fit_daily_activity (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    calories_burned INTEGER NOT NULL DEFAULT 0,
    steps INTEGER NOT NULL DEFAULT 0,
    distance_meters INTEGER NOT NULL DEFAULT 0,
    active_minutes INTEGER NOT NULL DEFAULT 0,
    data_source TEXT NOT NULL DEFAULT 'google_fit',
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT unique_google_fit_daily_activity UNIQUE(user_id, activity_date)
);

-- Table for Google Fit workout sessions
CREATE TABLE IF NOT EXISTS public.google_fit_workouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    workout_name TEXT NOT NULL,
    workout_type TEXT NOT NULL,
    workout_date DATE NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    calories_burned INTEGER NOT NULL DEFAULT 0,
    data_source TEXT NOT NULL DEFAULT 'google_fit',
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    CONSTRAINT unique_google_fit_workout UNIQUE(user_id, session_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_google_fit_connections_user_id ON public.google_fit_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_google_fit_daily_activity_user_date ON public.google_fit_daily_activity(user_id, activity_date DESC);
CREATE INDEX IF NOT EXISTS idx_google_fit_workouts_user_date ON public.google_fit_workouts(user_id, workout_date DESC);

-- Enable Row Level Security
ALTER TABLE public.google_fit_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_fit_daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.google_fit_workouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for google_fit_connections
CREATE POLICY "Users can view their own Google Fit connections" ON public.google_fit_connections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Google Fit connections" ON public.google_fit_connections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Google Fit connections" ON public.google_fit_connections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Google Fit connections" ON public.google_fit_connections
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for google_fit_daily_activity
CREATE POLICY "Users can view their own Google Fit daily activity" ON public.google_fit_daily_activity
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all Google Fit daily activity" ON public.google_fit_daily_activity
    FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for google_fit_workouts
CREATE POLICY "Users can view their own Google Fit workouts" ON public.google_fit_workouts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage all Google Fit workouts" ON public.google_fit_workouts
    FOR ALL USING (auth.role() = 'service_role');

-- Update the unified calories view to include Google Fit data
-- Priority: WHOOP > HealthKit > Google Fit > None
DROP VIEW IF EXISTS public.user_daily_calories;

CREATE OR REPLACE VIEW public.user_daily_calories AS
SELECT
  user_id,
  activity_date::date as date,

  -- WHOOP data (highest priority)
  whoop_cycles.calories as whoop_cycle_calories,
  COALESCE(whoop_workout_calories.total_calories, 0) as whoop_workout_calories,
  (COALESCE(whoop_cycles.calories, 0) + COALESCE(whoop_workout_calories.total_calories, 0)) as whoop_total_calories,

  -- HealthKit data (second priority)
  healthkit_daily_activity.active_energy_burned as healthkit_active_calories,
  COALESCE(healthkit_workout_calories.total_calories, 0) as healthkit_workout_calories,
  (COALESCE(healthkit_daily_activity.active_energy_burned, 0) + COALESCE(healthkit_workout_calories.total_calories, 0)) as healthkit_total_calories,

  -- Google Fit data (third priority)
  google_fit_daily_activity.calories_burned as google_fit_daily_calories,
  COALESCE(google_fit_workout_calories.total_calories, 0) as google_fit_workout_calories,
  (COALESCE(google_fit_daily_activity.calories_burned, 0) + COALESCE(google_fit_workout_calories.total_calories, 0)) as google_fit_total_calories,

  -- Additional Google Fit metrics
  google_fit_daily_activity.steps as google_fit_steps,
  google_fit_daily_activity.distance_meters as google_fit_distance_meters,
  google_fit_daily_activity.active_minutes as google_fit_active_minutes,

  -- Final calculated calories with priority system: WHOOP > HealthKit > Google Fit > 0
  CASE
    WHEN whoop_cycles.calories IS NOT NULL OR whoop_workout_calories.total_calories IS NOT NULL
    THEN (COALESCE(whoop_cycles.calories, 0) + COALESCE(whoop_workout_calories.total_calories, 0))
    
    WHEN healthkit_daily_activity.active_energy_burned IS NOT NULL OR healthkit_workout_calories.total_calories IS NOT NULL
    THEN (COALESCE(healthkit_daily_activity.active_energy_burned, 0) + COALESCE(healthkit_workout_calories.total_calories, 0))
    
    WHEN google_fit_daily_activity.calories_burned IS NOT NULL OR google_fit_workout_calories.total_calories IS NOT NULL
    THEN (COALESCE(google_fit_daily_activity.calories_burned, 0) + COALESCE(google_fit_workout_calories.total_calories, 0))
    
    ELSE 0
  END as final_calories_burned,

  -- Data source indicator with priority
  CASE
    WHEN whoop_cycles.calories IS NOT NULL OR whoop_workout_calories.total_calories IS NOT NULL THEN 'whoop'
    WHEN healthkit_daily_activity.active_energy_burned IS NOT NULL OR healthkit_workout_calories.total_calories IS NOT NULL THEN 'healthkit'
    WHEN google_fit_daily_activity.calories_burned IS NOT NULL OR google_fit_workout_calories.total_calories IS NOT NULL THEN 'google_fit'
    ELSE 'none'
  END as data_source

FROM (
  -- Generate date series for last 90 days for all users with wearable data
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
  ) all_users
) date_user_matrix

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

-- Comments for documentation
COMMENT ON TABLE public.google_fit_connections IS 'Stores Google Fit OAuth connections and tokens for users';
COMMENT ON TABLE public.google_fit_daily_activity IS 'Daily activity data synced from Google Fit (calories, steps, distance, active minutes)';
COMMENT ON TABLE public.google_fit_workouts IS 'Individual workout sessions synced from Google Fit';
COMMENT ON VIEW public.user_daily_calories IS 'Unified view that prioritizes WHOOP > HealthKit > Google Fit calorie data';