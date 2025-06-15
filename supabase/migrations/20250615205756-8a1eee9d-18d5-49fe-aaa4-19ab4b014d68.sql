
-- Insert the mock athlete "Sarah Johnson" with the corrected sex value "female"
INSERT INTO public.athletes (id, name, sex, dob, coach_uuid, created_at, updated_at)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Sarah Johnson',
  'female',
  '1996-02-14',
  (SELECT id FROM public.coaches LIMIT 1),
  now(),
  now()
);

-- Insert mock muscle load data for "Sarah Johnson" to visualize all heatmap color zones
INSERT INTO public.muscle_load_daily (athlete_id, day, muscle, acute_load, chronic_load, acwr)
VALUES
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'rectus_femoris', 20, 25, 0.80),
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'vastus_lateralis', 15, 20, 0.75),
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'gluteus_maximus', 30, 22, 1.36),
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'hamstrings', 17, 17, 1.00),
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'pectoralis_major', 12, 16, 0.75),
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'latissimus_dorsi', 25, 19, 1.32),
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'anterior_deltoid', 10, 13, 0.77),
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'biceps_brachii', 14, 14, 1.00),
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'erector_spinae', 18, 17, 1.06),
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 'rectus_abdominis', 11, 9, 1.22);
