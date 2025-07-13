-- ETL Muscle Load Daily Migration
-- Purpose: Calculate per-muscle load scores (0-100) from session data
-- Author: AI Assistant
-- Date: 2025-01-15

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the muscle_load_daily table with user-specified structure
DROP TABLE IF EXISTS public.muscle_load_daily CASCADE;

CREATE TABLE public.muscle_load_daily (
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date date NOT NULL,
    muscle text NOT NULL,
    load_score numeric(5,2) NOT NULL CHECK (load_score >= 0 AND load_score <= 100),
    created_at timestamptz DEFAULT now(),
    PRIMARY KEY (user_id, date, muscle)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_muscle_load_daily_user_date ON public.muscle_load_daily (user_id, date);
CREATE INDEX IF NOT EXISTS idx_muscle_load_daily_muscle ON public.muscle_load_daily (muscle);
CREATE INDEX IF NOT EXISTS idx_muscle_load_daily_date ON public.muscle_load_daily (date);

-- Enable RLS
ALTER TABLE public.muscle_load_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own muscle load data
CREATE POLICY "Users can access their own muscle load data"
ON public.muscle_load_daily
FOR ALL
USING (user_id = auth.uid());

-- Add table comment
COMMENT ON TABLE public.muscle_load_daily IS 'Daily muscle load scores (0-100) calculated from session exercises for mobile heatmap visualization';

-- Create the ETL function
CREATE OR REPLACE FUNCTION public.etl_compute_muscle_load(
    _start_date date DEFAULT (CURRENT_DATE - INTERVAL '30 days')::date,
    _end_date date DEFAULT CURRENT_DATE
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    _date date;
    _user_id uuid;
    _muscle text;
    _raw_volume numeric;
    _normalized_score numeric;
    _max_user_volume numeric;
    _min_user_volume numeric;
BEGIN
    -- Log function start
    RAISE NOTICE 'Starting muscle load ETL for period: % to %', _start_date, _end_date;
    
    -- Clear existing data for the date range
    DELETE FROM public.muscle_load_daily 
    WHERE date >= _start_date AND date <= _end_date;
    
    -- Calculate muscle load for each user, date, and muscle
    FOR _date IN SELECT generate_series(_start_date, _end_date, '1 day'::interval)::date
    LOOP
        -- Process each user separately for normalization
        FOR _user_id IN 
            SELECT DISTINCT pi.athlete_uuid
            FROM public.program_instance pi
            JOIN public.session s ON s.program_id = pi.id
            WHERE s.planned_at::date = _date
            AND s.completed_at IS NOT NULL
        LOOP
            -- Calculate raw volume per muscle for this user on this date
            WITH session_muscle_volumes AS (
                SELECT 
                    muscle_name,
                    SUM(total_volume) as raw_volume
                FROM (
                    -- Get volume from set_log (detailed tracking)
                    SELECT 
                        UNNEST(e.muscle) as muscle_name,
                        COALESCE(sl.reps * sl.load, 0) as total_volume
                    FROM public.session s
                    JOIN public.program_instance pi ON pi.id = s.program_id
                    JOIN public.set_log sl ON sl.session_id = s.id
                    JOIN public.exercise_library el ON el.id = sl.exercise_id
                    JOIN public.exercises e ON e.name = el.name
                    WHERE pi.athlete_uuid = _user_id
                    AND s.planned_at::date = _date
                    AND s.completed_at IS NOT NULL
                    AND sl.reps IS NOT NULL
                    AND sl.load IS NOT NULL
                    
                    UNION ALL
                    
                    -- Get volume from session exercises JSONB (fallback)
                    SELECT 
                        UNNEST(e.muscle) as muscle_name,
                        COALESCE(
                            (exercise_data->>'reps')::numeric * (exercise_data->>'weight')::numeric,
                            0
                        ) as total_volume
                    FROM public.session s
                    JOIN public.program_instance pi ON pi.id = s.program_id
                    CROSS JOIN LATERAL jsonb_array_elements(s.exercises) as exercise_data
                    JOIN public.exercises e ON e.name = (exercise_data->>'name')
                    WHERE pi.athlete_uuid = _user_id
                    AND s.planned_at::date = _date
                    AND s.completed_at IS NOT NULL
                    AND (exercise_data->>'reps') IS NOT NULL
                    AND (exercise_data->>'weight') IS NOT NULL
                    AND NOT EXISTS (
                        SELECT 1 FROM public.set_log sl2 WHERE sl2.session_id = s.id
                    )
                ) volume_data
                WHERE muscle_name IS NOT NULL
                GROUP BY muscle_name
            ),
            user_volume_stats AS (
                -- Get user's volume statistics for normalization within the date range
                SELECT 
                    muscle_name,
                    MIN(raw_volume) as min_volume,
                    MAX(raw_volume) as max_volume,
                    AVG(raw_volume) as avg_volume,
                    STDDEV(raw_volume) as stddev_volume
                FROM (
                    SELECT 
                        muscle_name,
                        SUM(total_volume) as raw_volume
                    FROM (
                        -- Volume from set_log for normalization period
                        SELECT 
                            s.planned_at::date as session_date,
                            UNNEST(e.muscle) as muscle_name,
                            COALESCE(sl.reps * sl.load, 0) as total_volume
                        FROM public.session s
                        JOIN public.program_instance pi ON pi.id = s.program_id
                        JOIN public.set_log sl ON sl.session_id = s.id
                        JOIN public.exercise_library el ON el.id = sl.exercise_id
                        JOIN public.exercises e ON e.name = el.name
                        WHERE pi.athlete_uuid = _user_id
                        AND s.planned_at::date >= _start_date
                        AND s.planned_at::date <= _end_date
                        AND s.completed_at IS NOT NULL
                        AND sl.reps IS NOT NULL
                        AND sl.load IS NOT NULL
                        
                        UNION ALL
                        
                        -- Volume from session exercises JSONB for normalization
                        SELECT 
                            s.planned_at::date as session_date,
                            UNNEST(e.muscle) as muscle_name,
                            COALESCE(
                                (exercise_data->>'reps')::numeric * (exercise_data->>'weight')::numeric,
                                0
                            ) as total_volume
                        FROM public.session s
                        JOIN public.program_instance pi ON pi.id = s.program_id
                        CROSS JOIN LATERAL jsonb_array_elements(s.exercises) as exercise_data
                        JOIN public.exercises e ON e.name = (exercise_data->>'name')
                        WHERE pi.athlete_uuid = _user_id
                        AND s.planned_at::date >= _start_date
                        AND s.planned_at::date <= _end_date
                        AND s.completed_at IS NOT NULL
                        AND (exercise_data->>'reps') IS NOT NULL
                        AND (exercise_data->>'weight') IS NOT NULL
                        AND NOT EXISTS (
                            SELECT 1 FROM public.set_log sl2 WHERE sl2.session_id = s.id
                        )
                    ) norm_volume_data
                    WHERE muscle_name IS NOT NULL
                    GROUP BY session_date, muscle_name
                ) daily_volumes
                GROUP BY muscle_name
            )
            
            -- Insert normalized muscle load scores
            INSERT INTO public.muscle_load_daily (user_id, date, muscle, load_score)
            SELECT 
                _user_id,
                _date,
                smv.muscle_name,
                CASE 
                    WHEN uvs.max_volume = uvs.min_volume OR uvs.max_volume IS NULL THEN 
                        CASE WHEN smv.raw_volume > 0 THEN 50.0 ELSE 0.0 END
                    ELSE 
                        GREATEST(0.0, LEAST(100.0, 
                            ((smv.raw_volume - uvs.min_volume) / (uvs.max_volume - uvs.min_volume)) * 100.0
                        ))
                END as load_score
            FROM session_muscle_volumes smv
            JOIN user_volume_stats uvs ON uvs.muscle_name = smv.muscle_name
            WHERE smv.raw_volume > 0;
            
        END LOOP;
    END LOOP;
    
    -- Log completion
    RAISE NOTICE 'Muscle load ETL completed for period: % to %', _start_date, _end_date;
END;
$$;

-- Add function comment
COMMENT ON FUNCTION public.etl_compute_muscle_load(date, date) IS 'ETL function to calculate daily muscle load scores (0-100) from session exercises data';

-- Schedule the ETL function to run daily at 02:00 UTC
SELECT cron.schedule(
    'etl-muscle-load-daily',
    '0 2 * * *',  -- Daily at 02:00 UTC
    $$SELECT public.etl_compute_muscle_load();$$
);

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.etl_compute_muscle_load(date, date) TO authenticated;

-- Create a convenience function for manual runs
CREATE OR REPLACE FUNCTION public.refresh_muscle_load_for_date(target_date date DEFAULT CURRENT_DATE)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    PERFORM public.etl_compute_muscle_load(target_date, target_date);
END;
$$;

COMMENT ON FUNCTION public.refresh_muscle_load_for_date(date) IS 'Convenience function to refresh muscle load data for a specific date';
GRANT EXECUTE ON FUNCTION public.refresh_muscle_load_for_date(date) TO authenticated;

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'ETL Muscle Load migration completed successfully';
    RAISE NOTICE 'Created table: muscle_load_daily';
    RAISE NOTICE 'Created function: etl_compute_muscle_load';
    RAISE NOTICE 'Created function: refresh_muscle_load_for_date';
    RAISE NOTICE 'Scheduled cron job: etl-muscle-load-daily (daily at 02:00 UTC)';
END $$;