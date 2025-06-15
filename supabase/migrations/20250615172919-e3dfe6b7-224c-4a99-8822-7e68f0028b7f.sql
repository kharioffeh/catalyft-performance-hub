
-- Migration: 20240615_merge_ai_tables.sql

-- 1. Create ai_insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_uuid uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  coach_uuid uuid NOT NULL REFERENCES coaches(id) ON DELETE CASCADE,
  source_type text CHECK (source_type in ('readiness','workout','chat')),
  json jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Copy from kai_live_prompts (as 'chat')
INSERT INTO public.ai_insights (athlete_uuid, coach_uuid, source_type, json, created_at)
SELECT
  athlete_uuid,
  coach_uuid,
  'chat' AS source_type,
  to_jsonb(t) - 'coach_uuid' - 'athlete_uuid' || jsonb_build_object('prompt_text', t.prompt_text, 'metric', t.metric, 'adjustment_value', t.adjustment_value, 'session_uuid', t.session_uuid),
  created_at
FROM kai_live_prompts t;

-- 2. Copy from insight_log (as 'readiness')
INSERT INTO public.ai_insights (athlete_uuid, coach_uuid, source_type, json, created_at)
SELECT
    COALESCE(l.athlete_uuid, a.id) AS athlete_uuid,
    a.coach_uuid,
    'readiness' AS source_type,
    jsonb_build_object(
      'message', l.message,
      'metric', l.metric,
      'severity', l.severity,
      'source', l.source
    ),
    l.created_at
FROM insight_log l
JOIN athletes a ON a.id = l.athlete_uuid;

-- 3. Create views for backward compatibility
CREATE OR REPLACE VIEW public.kai_insights_v AS
SELECT * FROM public.ai_insights WHERE source_type = 'chat';

CREATE OR REPLACE VIEW public.aria_insights_v AS
SELECT * FROM public.ai_insights WHERE source_type = 'readiness';

-- 4. Enable Row Level Security
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- 4.1 Security definer function for current user id
CREATE OR REPLACE FUNCTION public.is_coach_or_athlete(uuid, uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    auth.uid() = $1 OR auth.uid() = $2
$$;

-- 4.2. Policy: Allow select if current user is coach or athlete
CREATE POLICY "Allow select if coach or athlete (kai/aria back-compat)" ON public.ai_insights
FOR SELECT
USING (public.is_coach_or_athlete(athlete_uuid, coach_uuid));

-- 4.3. Policy: Allow insert if current user is coach or athlete
CREATE POLICY "Allow insert if coach or athlete (kai/aria back-compat)" ON public.ai_insights
FOR INSERT
WITH CHECK (public.is_coach_or_athlete(athlete_uuid, coach_uuid));

-- 4.4. Policy: Allow update if current user is coach or athlete
CREATE POLICY "Allow update if coach or athlete (kai/aria back-compat)" ON public.ai_insights
FOR UPDATE
USING (public.is_coach_or_athlete(athlete_uuid, coach_uuid));

-- 4.5. Policy: Allow delete if current user is coach or athlete
CREATE POLICY "Allow delete if coach or athlete (kai/aria back-compat)" ON public.ai_insights
FOR DELETE
USING (public.is_coach_or_athlete(athlete_uuid, coach_uuid));
