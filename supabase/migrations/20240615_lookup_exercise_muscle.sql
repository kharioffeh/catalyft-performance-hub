
-- Seed file: lookup_exercise_muscle.sql
CREATE TABLE IF NOT EXISTS public.lookup_exercise_muscle (
  id serial PRIMARY KEY,
  exercise_name text NOT NULL,
  muscles text[] NOT NULL -- e.g. ARRAY['biceps','latissimus_dorsi']
);

INSERT INTO public.lookup_exercise_muscle (exercise_name, muscles) VALUES
  ('Back Squat', ARRAY['rectus_femoris','vastus_lateralis','gluteus_maximus','erector_spinae']),
  ('Bench Press', ARRAY['pectoralis_major','triceps_brachii','anterior_deltoid']),
  ('Deadlift', ARRAY['gluteus_maximus','hamstrings','erector_spinae','trapezius']),
  ('Pull-Up', ARRAY['latissimus_dorsi','biceps_brachii','rhomboids']);

COMMENT ON TABLE public.lookup_exercise_muscle IS 'Maps canonical exercise names to primary/secondary muscles.';
