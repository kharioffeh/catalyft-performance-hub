
-- Update workout_blocks table to support solo programs
ALTER TABLE workout_blocks 
ADD COLUMN IF NOT EXISTS coach_uuid uuid,
ADD COLUMN IF NOT EXISTS name text,
ADD COLUMN IF NOT EXISTS duration_weeks integer;

-- Make coach_uuid nullable for solo users
ALTER TABLE workout_blocks 
ALTER COLUMN coach_uuid DROP NOT NULL;

-- Create RPC function for solo program creation
CREATE OR REPLACE FUNCTION solo_create_block(
  p_name text,
  p_duration_weeks int,
  p_block jsonb
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_block_id uuid;
BEGIN
  -- Insert the workout block for the authenticated user
  INSERT INTO workout_blocks (coach_uuid, athlete_uuid, name, duration_weeks, data)
  VALUES (null, auth.uid(), p_name, p_duration_weeks, p_block)
  RETURNING id INTO v_block_id;
  
  RETURN v_block_id;
END $$;

-- Enable RLS on workout_blocks if not already enabled
ALTER TABLE workout_blocks ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Solo athletes can manage own programs" ON workout_blocks;
DROP POLICY IF EXISTS "Coaches can manage athlete programs" ON workout_blocks;

-- Create policy for solo athletes to manage their own programs
CREATE POLICY "Solo athletes can manage own programs"
ON workout_blocks
FOR ALL 
USING (athlete_uuid = auth.uid());

-- Create policy for coaches to manage their athletes' programs  
CREATE POLICY "Coaches can manage athlete programs"
ON workout_blocks
FOR ALL
USING (coach_uuid = auth.uid());
