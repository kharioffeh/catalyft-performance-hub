-- Fix program_templates origin constraint
-- Remove the constraint that's blocking ARIA program generation

ALTER TABLE program_templates DROP CONSTRAINT IF EXISTS program_templates_origin_check;