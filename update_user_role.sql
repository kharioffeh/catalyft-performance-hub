-- Update user role to 'coach' for the specified UUID
-- UUID: 0a575abb-e3ba-4898-94a2-b16c54a13a29

-- First, check the current user data
SELECT id, email, full_name, role, created_at 
FROM public.profiles 
WHERE id = '0a575abb-e3ba-4898-94a2-b16c54a13a29';

-- Update the user's role to 'coach'
UPDATE public.profiles 
SET role = 'coach'
WHERE id = '0a575abb-e3ba-4898-94a2-b16c54a13a29';

-- Verify the update
SELECT id, email, full_name, role, updated_at 
FROM public.profiles 
WHERE id = '0a575abb-e3ba-4898-94a2-b16c54a13a29';