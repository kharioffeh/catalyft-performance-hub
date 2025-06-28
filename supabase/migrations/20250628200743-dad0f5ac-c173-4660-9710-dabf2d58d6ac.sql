
-- Create ARIA conversation storage tables and RLS policies
-- This enables persistent chat threads and message history

------------------------
-- Tables
------------------------
CREATE TABLE public.aria_threads (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users ON DELETE CASCADE,
  title        text NOT NULL DEFAULT 'New Chat',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

CREATE TYPE public.aria_role AS ENUM ('user', 'assistant', 'system');

CREATE TABLE public.aria_messages (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  thread_id   uuid REFERENCES public.aria_threads ON DELETE CASCADE,
  role        public.aria_role NOT NULL,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

------------------------
-- RLS Policies
------------------------
ALTER TABLE public.aria_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aria_messages ENABLE ROW LEVEL SECURITY;

-- Users can only access their own threads
CREATE POLICY "Users can manage own threads" ON public.aria_threads
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Users can only access messages from their own threads
CREATE POLICY "Users can manage own thread messages" ON public.aria_messages
FOR ALL TO authenticated
USING (
  thread_id IN (
    SELECT id FROM public.aria_threads WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  thread_id IN (
    SELECT id FROM public.aria_threads WHERE user_id = auth.uid()
  )
);

------------------------
-- Helper Views
------------------------
CREATE OR REPLACE VIEW public.v_aria_thread_last AS
SELECT
  t.*,
  (SELECT content FROM public.aria_messages m
   WHERE m.thread_id = t.id
   ORDER BY m.created_at DESC
   LIMIT 1) as last_message,
  (SELECT COUNT(*) FROM public.aria_messages m
   WHERE m.thread_id = t.id) as message_count
FROM public.aria_threads t;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.aria_threads TO authenticated;
GRANT SELECT ON public.v_aria_thread_last TO authenticated;
GRANT SELECT, INSERT ON public.aria_messages TO authenticated;
