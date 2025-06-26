
-- Add wearable_connected flag to athletes table
ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS wearable_connected boolean DEFAULT false;

-- Create unified wearable_tokens table (extend from existing whoop_tokens structure)
CREATE TABLE IF NOT EXISTS public.wearable_tokens (
  athlete_uuid uuid references public.athletes(id) on delete cascade,
  provider text check (provider in ('whoop','apple')) not null,
  access_token text not null,
  refresh_token text,
  expires_at timestamptz,
  token_type text default 'Bearer',
  scope text,
  primary key (athlete_uuid, provider),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Migrate existing whoop_tokens data to new structure
INSERT INTO public.wearable_tokens (
  athlete_uuid, 
  provider, 
  access_token, 
  refresh_token, 
  expires_at, 
  token_type, 
  scope,
  created_at, 
  updated_at
)
SELECT 
  athlete_uuid, 
  'whoop', 
  access_token, 
  refresh_token, 
  expires_at, 
  token_type, 
  scope,
  created_at, 
  updated_at
FROM public.whoop_tokens
WHERE NOT EXISTS (
  SELECT 1 FROM public.wearable_tokens 
  WHERE wearable_tokens.athlete_uuid = whoop_tokens.athlete_uuid 
  AND wearable_tokens.provider = 'whoop'
);
