-- Create whoop_tokens table for storing Whoop access tokens per athlete
CREATE TABLE IF NOT EXISTS public.whoop_tokens (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create whoop_recovery table for storing daily recovery data
CREATE TABLE IF NOT EXISTS public.whoop_recovery (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  recovery_date DATE NOT NULL,
  recovery_score INTEGER NOT NULL,
  resting_heart_rate INTEGER NOT NULL,
  hrv_rmssd_milli NUMERIC(10,2) NOT NULL,
  spo2_percentage NUMERIC(5,2) NOT NULL,
  skin_temp_celsius NUMERIC(5,2) NOT NULL,
  user_calibrating BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, recovery_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_whoop_tokens_expires_at ON public.whoop_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_whoop_recovery_date ON public.whoop_recovery(recovery_date);
CREATE INDEX IF NOT EXISTS idx_whoop_recovery_user_date ON public.whoop_recovery(user_id, recovery_date);

-- Enable RLS on both tables
ALTER TABLE public.whoop_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whoop_recovery ENABLE ROW LEVEL SECURITY;

-- RLS policies for whoop_tokens (users can only access their own tokens)
CREATE POLICY "Users can view their own whoop tokens" ON public.whoop_tokens
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own whoop tokens" ON public.whoop_tokens
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own whoop tokens" ON public.whoop_tokens
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own whoop tokens" ON public.whoop_tokens
  FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for whoop_recovery (users can only access their own recovery data)
CREATE POLICY "Users can view their own whoop recovery" ON public.whoop_recovery
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own whoop recovery" ON public.whoop_recovery
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own whoop recovery" ON public.whoop_recovery
  FOR UPDATE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whoop_tokens TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.whoop_recovery TO authenticated;

-- Grant service role full access for the Edge Function
GRANT ALL ON public.whoop_tokens TO service_role;
GRANT ALL ON public.whoop_recovery TO service_role;