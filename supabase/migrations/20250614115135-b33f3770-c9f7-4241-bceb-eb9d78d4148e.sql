
-- Insert missing coaches, skipping any with a duplicate email
INSERT INTO coaches (id, email)
SELECT p.id, p.email
FROM profiles p
WHERE p.role = 'coach'
  AND p.id NOT IN (SELECT id FROM coaches)
  AND p.email IS NOT NULL
  AND p.email NOT IN (SELECT email FROM coaches);
