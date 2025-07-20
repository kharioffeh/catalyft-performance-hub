-- Remove the problematic template_goal_check constraint entirely
-- This will allow any goal value to be inserted

ALTER TABLE template DROP CONSTRAINT IF EXISTS template_goal_check;