-- Add default status to existing sessions that don't have one
UPDATE sessions SET status = 'planned' WHERE status IS NULL;

-- Add a NOT NULL constraint to status column
ALTER TABLE sessions ALTER COLUMN status SET DEFAULT 'planned';
ALTER TABLE sessions ALTER COLUMN status SET NOT NULL;