
-- Fix coach ID alignment with profiles table
-- This migration ensures coaches table uses the same IDs as profiles table

-- Step 1: First, insert missing coaches using the correct profile IDs
-- This ensures all coach profiles have corresponding rows in coaches table
INSERT INTO coaches (id, email)
SELECT p.id, p.email
FROM profiles p
LEFT JOIN coaches c ON c.id = p.id
WHERE p.role = 'coach'
  AND c.id IS NULL
  AND p.email IS NOT NULL;

-- Step 2: Update all foreign key references to use the correct coach IDs from profiles
-- Update athletes table
UPDATE athletes a
SET coach_uuid = p.id
FROM profiles p
JOIN coaches c ON c.email = p.email
WHERE a.coach_uuid = c.id
  AND c.id != p.id
  AND p.role = 'coach';

-- Update sessions table
UPDATE sessions s
SET coach_uuid = p.id
FROM profiles p
JOIN coaches c ON c.email = p.email
WHERE s.coach_uuid = c.id
  AND c.id != p.id
  AND p.role = 'coach';

-- Update program_templates table
UPDATE program_templates pt
SET coach_uuid = p.id
FROM profiles p
JOIN coaches c ON c.email = p.email
WHERE pt.coach_uuid = c.id
  AND c.id != p.id
  AND p.role = 'coach';

-- Update workout_templates table
UPDATE workout_templates wt
SET coach_uuid = p.id
FROM profiles p
JOIN coaches c ON c.email = p.email
WHERE wt.coach_uuid = c.id
  AND c.id != p.id
  AND p.role = 'coach';

-- Update athlete_invites table
UPDATE athlete_invites ai
SET coach_uuid = p.id
FROM profiles p
JOIN coaches c ON c.email = p.email
WHERE ai.coach_uuid = c.id
  AND c.id != p.id
  AND p.role = 'coach';

-- Update coach_usage table
UPDATE coach_usage cu
SET coach_uuid = p.id
FROM profiles p
JOIN coaches c ON c.email = p.email
WHERE cu.coach_uuid = c.id
  AND c.id != p.id
  AND p.role = 'coach';

-- Update injury_risk_forecast table
UPDATE injury_risk_forecast irf
SET coach_uuid = p.id
FROM profiles p
JOIN coaches c ON c.email = p.email
WHERE irf.coach_uuid = c.id
  AND c.id != p.id
  AND p.role = 'coach';

-- Update biomech_alerts table
UPDATE biomech_alerts ba
SET coach_uuid = p.id
FROM profiles p
JOIN coaches c ON c.email = p.email
WHERE ba.coach_uuid = c.id
  AND c.id != p.id
  AND p.role = 'coach';

-- Update kai_live_prompts table
UPDATE kai_live_prompts klp
SET coach_uuid = p.id
FROM profiles p
JOIN coaches c ON c.email = p.email
WHERE klp.coach_uuid = c.id
  AND c.id != p.id
  AND p.role = 'coach';

-- Update assigned_workouts table
UPDATE assigned_workouts aw
SET coach_uuid = p.id
FROM profiles p
JOIN coaches c ON c.email = p.email
WHERE aw.coach_uuid = c.id
  AND c.id != p.id
  AND p.role = 'coach';

-- Step 3: Finally, delete the old/incorrect coach rows (those with mismatched IDs)
-- This is done last to avoid breaking foreign key constraints
DELETE FROM coaches c
USING profiles p
WHERE c.email = p.email
  AND c.id != p.id
  AND p.role = 'coach';

