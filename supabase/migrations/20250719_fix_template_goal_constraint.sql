-- Update template goal constraint to accept more goal values
-- This allows the existing frontend goal values to work without requiring immediate redeployment

ALTER TABLE template DROP CONSTRAINT IF EXISTS template_goal_check;

ALTER TABLE template ADD CONSTRAINT template_goal_check 
CHECK (goal IN (
  'strength', 
  'power', 
  'hypertrophy', 
  'endurance', 
  'rehab',
  -- Additional values that frontend might send
  'max_strength',
  'muscle',
  'speed_power',
  'in-season_maint',
  'fat_loss',
  'general_fitness',
  'sport_specific',
  'rehabilitation'
));