-- Create healthkit_daily_activity table for daily active calories and activity rings
CREATE TABLE IF NOT EXISTS public.healthkit_daily_activity (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  
  -- Activity Ring Data
  active_energy_burned NUMERIC(10,2), -- Active calories (what we need for balance)
  basal_energy_burned NUMERIC(10,2),  -- Basal/resting calories
  total_energy_burned NUMERIC(10,2),  -- Total calories (active + basal)
  
  -- Activity Ring Goals and Progress
  active_energy_goal NUMERIC(10,2),
  exercise_time_minutes INTEGER,
  exercise_goal_minutes INTEGER,
  stand_hours INTEGER,
  stand_goal_hours INTEGER,
  
  -- Heart Rate Data
  resting_heart_rate INTEGER,
  average_heart_rate INTEGER,
  max_heart_rate INTEGER,
  heart_rate_variability NUMERIC(8,4), -- RMSSD in milliseconds
  
  -- Activity Metrics
  steps INTEGER,
  distance_walked_meters NUMERIC(10,2),
  flights_climbed INTEGER,
  
  -- Sleep Data (if available)
  sleep_duration_minutes INTEGER,
  sleep_efficiency_percentage NUMERIC(5,2),
  
  -- Data Quality
  data_source TEXT DEFAULT 'apple_watch',
  sync_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  PRIMARY KEY (user_id, activity_date)
);

-- Create healthkit_workouts table for individual exercise sessions
CREATE TABLE IF NOT EXISTS public.healthkit_workouts (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_uuid UUID NOT NULL, -- HealthKit workout UUID
  workout_date DATE NOT NULL,
  
  -- Basic Workout Info
  workout_type_id INTEGER NOT NULL, -- HKWorkoutActivityType identifier
  workout_type_name TEXT NOT NULL,   -- Human readable name (e.g., "Running", "Cycling")
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  duration_minutes NUMERIC(8,2),
  
  -- Energy Data
  active_energy_burned NUMERIC(10,2), -- Calories burned during workout
  total_energy_burned NUMERIC(10,2),  -- Total energy including basal
  
  -- Performance Metrics
  distance_meters NUMERIC(12,2),
  average_heart_rate INTEGER,
  max_heart_rate INTEGER,
  average_pace_seconds_per_meter NUMERIC(8,4), -- For running/walking
  elevation_gain_meters NUMERIC(10,2),
  
  -- Heart Rate Zones (if available)
  heart_rate_zones JSONB, -- Store zone time distribution
  
  -- Metadata
  source_name TEXT, -- e.g., "Apple Watch", "iPhone", "Third Party App"
  source_version TEXT,
  device_name TEXT,
  
  -- Data Quality
  sync_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  PRIMARY KEY (user_id, workout_uuid)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_healthkit_daily_activity_date 
  ON public.healthkit_daily_activity(activity_date);
CREATE INDEX IF NOT EXISTS idx_healthkit_daily_activity_user_date 
  ON public.healthkit_daily_activity(user_id, activity_date);
CREATE INDEX IF NOT EXISTS idx_healthkit_workouts_date 
  ON public.healthkit_workouts(workout_date);
CREATE INDEX IF NOT EXISTS idx_healthkit_workouts_user_date 
  ON public.healthkit_workouts(user_id, workout_date);
CREATE INDEX IF NOT EXISTS idx_healthkit_workouts_type 
  ON public.healthkit_workouts(workout_type_id);

-- Enable RLS on both tables
ALTER TABLE public.healthkit_daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.healthkit_workouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for healthkit_daily_activity
CREATE POLICY "Users can view their own healthkit daily activity" 
  ON public.healthkit_daily_activity
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own healthkit daily activity" 
  ON public.healthkit_daily_activity
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own healthkit daily activity" 
  ON public.healthkit_daily_activity
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for healthkit_workouts
CREATE POLICY "Users can view their own healthkit workouts" 
  ON public.healthkit_workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own healthkit workouts" 
  ON public.healthkit_workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own healthkit workouts" 
  ON public.healthkit_workouts
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.healthkit_daily_activity TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.healthkit_workouts TO authenticated;

-- Grant service role full access for the Edge Functions
GRANT ALL ON public.healthkit_daily_activity TO service_role;
GRANT ALL ON public.healthkit_workouts TO service_role;

-- Create a view for easy calorie aggregation
CREATE OR REPLACE VIEW public.user_daily_calories AS
SELECT 
  user_id,
  activity_date::date as date,
  
  -- WHOOP data (highest priority)
  whoop_cycles.calories as whoop_cycle_calories,
  COALESCE(whoop_workout_calories.total_calories, 0) as whoop_workout_calories,
  (COALESCE(whoop_cycles.calories, 0) + COALESCE(whoop_workout_calories.total_calories, 0)) as whoop_total_calories,
  
  -- HealthKit data (fallback)
  healthkit_daily_activity.active_energy_burned as healthkit_active_calories,
  COALESCE(healthkit_workout_calories.total_calories, 0) as healthkit_workout_calories,
  (COALESCE(healthkit_daily_activity.active_energy_burned, 0) + COALESCE(healthkit_workout_calories.total_calories, 0)) as healthkit_total_calories,
  
  -- Final calculated calories (priority: WHOOP > HealthKit > 0)
  CASE 
    WHEN whoop_cycles.calories IS NOT NULL OR whoop_workout_calories.total_calories IS NOT NULL 
    THEN (COALESCE(whoop_cycles.calories, 0) + COALESCE(whoop_workout_calories.total_calories, 0))
    WHEN healthkit_daily_activity.active_energy_burned IS NOT NULL OR healthkit_workout_calories.total_calories IS NOT NULL
    THEN (COALESCE(healthkit_daily_activity.active_energy_burned, 0) + COALESCE(healthkit_workout_calories.total_calories, 0))
    ELSE 0
  END as final_calories_burned,
  
  -- Data source indicator
  CASE 
    WHEN whoop_cycles.calories IS NOT NULL OR whoop_workout_calories.total_calories IS NOT NULL THEN 'whoop'
    WHEN healthkit_daily_activity.active_energy_burned IS NOT NULL OR healthkit_workout_calories.total_calories IS NOT NULL THEN 'healthkit'
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

ORDER BY user_id, activity_date DESC;