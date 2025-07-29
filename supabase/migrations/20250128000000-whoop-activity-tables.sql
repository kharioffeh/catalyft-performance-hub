-- Create whoop_cycles table for daily strain/activity data
CREATE TABLE IF NOT EXISTS public.whoop_cycles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_date DATE NOT NULL,
  cycle_id BIGINT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  strain NUMERIC(10,4),
  kilojoules NUMERIC(10,2),
  calories INTEGER GENERATED ALWAYS AS (ROUND(kilojoules * 0.239006)) STORED, -- Convert kJ to calories
  average_heart_rate INTEGER,
  max_heart_rate INTEGER,
  score_state TEXT DEFAULT 'PENDING_SCORE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, cycle_date)
);

-- Create whoop_workouts table for individual workout activities
CREATE TABLE IF NOT EXISTS public.whoop_workouts (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_date DATE NOT NULL,
  workout_id UUID NOT NULL,
  v1_id BIGINT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  sport_name TEXT,
  sport_id INTEGER,
  strain NUMERIC(10,4),
  kilojoules NUMERIC(10,2),
  calories INTEGER GENERATED ALWAYS AS (ROUND(kilojoules * 0.239006)) STORED, -- Convert kJ to calories
  average_heart_rate INTEGER,
  max_heart_rate INTEGER,
  distance_meter NUMERIC(12,2),
  altitude_gain_meter NUMERIC(10,2),
  zone_durations JSONB, -- Store heart rate zone data
  score_state TEXT DEFAULT 'PENDING_SCORE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, workout_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_whoop_cycles_date ON public.whoop_cycles(cycle_date);
CREATE INDEX IF NOT EXISTS idx_whoop_cycles_user_date ON public.whoop_cycles(user_id, cycle_date);
CREATE INDEX IF NOT EXISTS idx_whoop_workouts_date ON public.whoop_workouts(workout_date);
CREATE INDEX IF NOT EXISTS idx_whoop_workouts_user_date ON public.whoop_workouts(user_id, workout_date);

-- Enable RLS on both tables
ALTER TABLE public.whoop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoop_workouts ENABLE ROW LEVEL SECURITY;

-- RLS policies for whoop_cycles
CREATE POLICY "Users can view their own whoop cycles" ON public.whoop_cycles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own whoop cycles" ON public.whoop_cycles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own whoop cycles" ON public.whoop_cycles
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for whoop_workouts
CREATE POLICY "Users can view their own whoop workouts" ON public.whoop_workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own whoop workouts" ON public.whoop_workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own whoop workouts" ON public.whoop_workouts
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whoop_cycles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whoop_workouts TO authenticated;

-- Grant service role full access for the Edge Functions
GRANT ALL ON public.whoop_cycles TO service_role;
GRANT ALL ON public.whoop_workouts TO service_role;