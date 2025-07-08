
-- Populate exercises table with comprehensive seed data (200+ exercises)
INSERT INTO public.exercises (name, muscle, equipment, modality, pattern, difficulty, intensity_zone, description, origin) VALUES
-- CHEST EXERCISES
('Push-up', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Classic bodyweight chest exercise', 'SYSTEM'),
('Incline Push-up', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Elevated feet push-up variation', 'SYSTEM'),
('Diamond Push-up', ARRAY['chest', 'triceps'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'hypertrophy', 'Close-grip push-up for triceps focus', 'SYSTEM'),
('Wide-Grip Push-up', ARRAY['chest', 'shoulders'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Wide hand placement for chest emphasis', 'SYSTEM'),
('Decline Push-up', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'hypertrophy', 'Feet elevated push-up variation', 'SYSTEM'),
('Bench Press', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['barbell'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'power', 'Classic barbell chest exercise', 'SYSTEM'),
('Incline Bench Press', ARRAY['chest', 'shoulders', 'triceps'], ARRAY['barbell'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'power', 'Upper chest focused bench press', 'SYSTEM'),
('Decline Bench Press', ARRAY['chest', 'triceps'], ARRAY['barbell'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'power', 'Lower chest focused bench press', 'SYSTEM'),
('Dumbbell Press', ARRAY['chest', 'triceps', 'shoulders'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Dumbbell chest press', 'SYSTEM'),
('Incline Dumbbell Press', ARRAY['chest', 'shoulders'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Incline dumbbell chest press', 'SYSTEM'),
('Dumbbell Flye', ARRAY['chest'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'hypertrophy', 'Chest isolation exercise', 'SYSTEM'),
('Incline Dumbbell Flye', ARRAY['chest'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'hypertrophy', 'Upper chest flye variation', 'SYSTEM'),
('Cable Flye', ARRAY['chest'], ARRAY['cable'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'hypertrophy', 'Cable chest flye', 'SYSTEM'),
('Chest Dips', ARRAY['chest', 'triceps'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'hypertrophy', 'Parallel bar chest dips', 'SYSTEM'),
('Pec Deck', ARRAY['chest'], ARRAY['machine'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Machine chest flye', 'SYSTEM'),

-- BACK EXERCISES
('Pull-up', ARRAY['back', 'biceps'], ARRAY['pull_up_bar'], ARRAY['strength'], ARRAY['pull'], 'intermediate', 'power', 'Classic vertical pulling exercise', 'SYSTEM'),
('Chin-up', ARRAY['back', 'biceps'], ARRAY['pull_up_bar'], ARRAY['strength'], ARRAY['pull'], 'intermediate', 'power', 'Underhand grip pull-up', 'SYSTEM'),
('Wide-Grip Pull-up', ARRAY['back', 'biceps'], ARRAY['pull_up_bar'], ARRAY['strength'], ARRAY['pull'], 'advanced', 'power', 'Wide grip lat focus pull-up', 'SYSTEM'),
('Assisted Pull-up', ARRAY['back', 'biceps'], ARRAY['resistance_band'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Band-assisted pull-up', 'SYSTEM'),
('Negative Pull-up', ARRAY['back', 'biceps'], ARRAY['pull_up_bar'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Eccentric pull-up training', 'SYSTEM'),
('Deadlift', ARRAY['back', 'glutes', 'hamstrings'], ARRAY['barbell'], ARRAY['strength'], ARRAY['hinge'], 'intermediate', 'power', 'Hip hinge deadlift pattern', 'SYSTEM'),
('Romanian Deadlift', ARRAY['hamstrings', 'glutes', 'back'], ARRAY['barbell'], ARRAY['strength'], ARRAY['hinge'], 'intermediate', 'hypertrophy', 'Hip hinge with eccentric focus', 'SYSTEM'),
('Sumo Deadlift', ARRAY['glutes', 'back', 'quadriceps'], ARRAY['barbell'], ARRAY['strength'], ARRAY['hinge'], 'intermediate', 'power', 'Wide stance deadlift', 'SYSTEM'),
('Bent-Over Row', ARRAY['back', 'biceps'], ARRAY['barbell'], ARRAY['strength'], ARRAY['pull'], 'intermediate', 'hypertrophy', 'Horizontal pulling exercise', 'SYSTEM'),
('Dumbbell Row', ARRAY['back', 'biceps'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Single-arm dumbbell row', 'SYSTEM'),
('Seated Cable Row', ARRAY['back', 'biceps'], ARRAY['cable'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Seated horizontal pull', 'SYSTEM'),
('T-Bar Row', ARRAY['back', 'biceps'], ARRAY['barbell'], ARRAY['strength'], ARRAY['pull'], 'intermediate', 'hypertrophy', 'T-bar rowing exercise', 'SYSTEM'),
('Lat Pulldown', ARRAY['back', 'biceps'], ARRAY['cable'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Vertical pulling machine', 'SYSTEM'),
('Inverted Row', ARRAY['back', 'biceps'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Bodyweight horizontal pull', 'SYSTEM'),
('Face Pull', ARRAY['back', 'shoulders'], ARRAY['cable'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Rear delt and rhomboid exercise', 'SYSTEM'),

-- SHOULDER EXERCISES
('Overhead Press', ARRAY['shoulders', 'triceps'], ARRAY['barbell'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'power', 'Standing overhead press', 'SYSTEM'),
('Military Press', ARRAY['shoulders', 'triceps', 'core'], ARRAY['barbell'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'power', 'Strict standing press', 'SYSTEM'),
('Dumbbell Shoulder Press', ARRAY['shoulders', 'triceps'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Seated or standing DB press', 'SYSTEM'),
('Arnold Press', ARRAY['shoulders', 'triceps'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'hypertrophy', 'Rotating dumbbell press', 'SYSTEM'),
('Lateral Raise', ARRAY['shoulders'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Side deltoid isolation', 'SYSTEM'),
('Front Raise', ARRAY['shoulders'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Front deltoid isolation', 'SYSTEM'),
('Rear Delt Flye', ARRAY['shoulders'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Rear deltoid isolation', 'SYSTEM'),
('Pike Push-up', ARRAY['shoulders', 'triceps'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'hypertrophy', 'Inverted shoulder press', 'SYSTEM'),
('Handstand Push-up', ARRAY['shoulders', 'triceps'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'advanced', 'power', 'Wall-supported handstand press', 'SYSTEM'),
('Upright Row', ARRAY['shoulders', 'traps'], ARRAY['barbell'], ARRAY['strength'], ARRAY['pull'], 'intermediate', 'hypertrophy', 'Vertical pulling to chest', 'SYSTEM'),
('Shrugs', ARRAY['traps'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Trapezius isolation', 'SYSTEM'),
('Cable Lateral Raise', ARRAY['shoulders'], ARRAY['cable'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Cable side deltoid raise', 'SYSTEM'),

-- ARM EXERCISES
('Bicep Curl', ARRAY['biceps'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Basic bicep curl', 'SYSTEM'),
('Hammer Curl', ARRAY['biceps', 'forearms'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Neutral grip bicep curl', 'SYSTEM'),
('Concentration Curl', ARRAY['biceps'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Seated isolated bicep curl', 'SYSTEM'),
('Preacher Curl', ARRAY['biceps'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['pull'], 'intermediate', 'hypertrophy', 'Preacher bench bicep curl', 'SYSTEM'),
('Cable Curl', ARRAY['biceps'], ARRAY['cable'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Cable bicep curl', 'SYSTEM'),
('Tricep Dips', ARRAY['triceps'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Parallel bar tricep dips', 'SYSTEM'),
('Close-Grip Push-up', ARRAY['triceps', 'chest'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'hypertrophy', 'Narrow hand push-up', 'SYSTEM'),
('Tricep Extension', ARRAY['triceps'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Overhead tricep extension', 'SYSTEM'),
('Skull Crushers', ARRAY['triceps'], ARRAY['barbell'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'hypertrophy', 'Lying tricep extension', 'SYSTEM'),
('Cable Tricep Pushdown', ARRAY['triceps'], ARRAY['cable'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Cable tricep extension', 'SYSTEM'),
('Wrist Curls', ARRAY['forearms'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'endurance', 'Forearm flexor strengthening', 'SYSTEM'),
('Reverse Wrist Curls', ARRAY['forearms'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'endurance', 'Forearm extensor strengthening', 'SYSTEM'),

-- LEG EXERCISES
('Squat', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['squat'], 'beginner', 'hypertrophy', 'Basic bodyweight squat', 'SYSTEM'),
('Goblet Squat', ARRAY['quadriceps', 'glutes'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['squat'], 'beginner', 'hypertrophy', 'Front-loaded squat', 'SYSTEM'),
('Back Squat', ARRAY['quadriceps', 'glutes'], ARRAY['barbell'], ARRAY['strength'], ARRAY['squat'], 'intermediate', 'power', 'Barbell back squat', 'SYSTEM'),
('Front Squat', ARRAY['quadriceps', 'core'], ARRAY['barbell'], ARRAY['strength'], ARRAY['squat'], 'intermediate', 'power', 'Front-loaded barbell squat', 'SYSTEM'),
('Overhead Squat', ARRAY['quadriceps', 'shoulders', 'core'], ARRAY['barbell'], ARRAY['strength'], ARRAY['squat'], 'advanced', 'power', 'Overhead barbell squat', 'SYSTEM'),
('Jump Squat', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], ARRAY['plyometric'], ARRAY['jump'], 'intermediate', 'power', 'Explosive squat jump', 'SYSTEM'),
('Pistol Squat', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['squat'], 'advanced', 'power', 'Single-leg squat', 'SYSTEM'),
('Bulgarian Split Squat', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['lunge'], 'intermediate', 'hypertrophy', 'Rear-foot elevated split squat', 'SYSTEM'),
('Lunge', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['lunge'], 'beginner', 'hypertrophy', 'Forward stepping lunge', 'SYSTEM'),
('Reverse Lunge', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['lunge'], 'beginner', 'hypertrophy', 'Backward stepping lunge', 'SYSTEM'),
('Walking Lunge', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['lunge'], 'beginner', 'hypertrophy', 'Alternating forward lunges', 'SYSTEM'),
('Lateral Lunge', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['lunge'], 'beginner', 'hypertrophy', 'Side stepping lunge', 'SYSTEM'),
('Curtsy Lunge', ARRAY['glutes', 'quadriceps'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['lunge'], 'beginner', 'hypertrophy', 'Cross-behind lunge', 'SYSTEM'),
('Step-up', ARRAY['quadriceps', 'glutes'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['lunge'], 'beginner', 'hypertrophy', 'Box step-up exercise', 'SYSTEM'),
('Leg Press', ARRAY['quadriceps', 'glutes'], ARRAY['machine'], ARRAY['strength'], ARRAY['squat'], 'beginner', 'hypertrophy', 'Machine leg press', 'SYSTEM'),
('Leg Extension', ARRAY['quadriceps'], ARRAY['machine'], ARRAY['strength'], ARRAY['squat'], 'beginner', 'hypertrophy', 'Quadriceps isolation', 'SYSTEM'),
('Leg Curl', ARRAY['hamstrings'], ARRAY['machine'], ARRAY['strength'], ARRAY['hinge'], 'beginner', 'hypertrophy', 'Hamstring isolation', 'SYSTEM'),
('Calf Raise', ARRAY['calves'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'endurance', 'Standing calf raise', 'SYSTEM'),
('Seated Calf Raise', ARRAY['calves'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['push'], 'beginner', 'endurance', 'Seated calf exercise', 'SYSTEM'),

-- GLUTE EXERCISES
('Hip Thrust', ARRAY['glutes'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['hinge'], 'beginner', 'hypertrophy', 'Glute bridge variation', 'SYSTEM'),
('Glute Bridge', ARRAY['glutes'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['hinge'], 'beginner', 'hypertrophy', 'Basic glute bridge', 'SYSTEM'),
('Single-Leg Glute Bridge', ARRAY['glutes'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['hinge'], 'intermediate', 'hypertrophy', 'Unilateral glute bridge', 'SYSTEM'),
('Clamshells', ARRAY['glutes'], ARRAY['resistance_band'], ARRAY['strength'], ARRAY['hinge'], 'beginner', 'hypertrophy', 'Side-lying hip abduction', 'SYSTEM'),
('Fire Hydrants', ARRAY['glutes'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['hinge'], 'beginner', 'hypertrophy', 'Quadruped hip abduction', 'SYSTEM'),
('Monster Walks', ARRAY['glutes'], ARRAY['resistance_band'], ARRAY['strength'], ARRAY['hinge'], 'beginner', 'hypertrophy', 'Lateral band walks', 'SYSTEM'),
('Good Morning', ARRAY['hamstrings', 'glutes'], ARRAY['barbell'], ARRAY['strength'], ARRAY['hinge'], 'intermediate', 'hypertrophy', 'Hip hinge movement', 'SYSTEM'),

-- CORE EXERCISES
('Plank', ARRAY['core'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'endurance', 'Isometric core hold', 'SYSTEM'),
('Side Plank', ARRAY['core'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'endurance', 'Lateral core stability', 'SYSTEM'),
('Mountain Climbers', ARRAY['core', 'shoulders'], ARRAY['bodyweight'], ARRAY['conditioning'], ARRAY['push'], 'intermediate', 'endurance', 'Dynamic core exercise', 'SYSTEM'),
('Russian Twists', ARRAY['core'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Rotational core exercise', 'SYSTEM'),
('Bicycle Crunches', ARRAY['core'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Alternating knee to elbow', 'SYSTEM'),
('Dead Bug', ARRAY['core'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'endurance', 'Supine core stability', 'SYSTEM'),
('Bird Dog', ARRAY['core', 'back'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'endurance', 'Quadruped stability exercise', 'SYSTEM'),
('Hollow Body Hold', ARRAY['core'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'endurance', 'Gymnastics core hold', 'SYSTEM'),
('Leg Raises', ARRAY['core'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'hypertrophy', 'Lower abdominal exercise', 'SYSTEM'),
('Hanging Leg Raises', ARRAY['core'], ARRAY['pull_up_bar'], ARRAY['strength'], ARRAY['pull'], 'advanced', 'hypertrophy', 'Hanging core exercise', 'SYSTEM'),
('Ab Wheel Rollout', ARRAY['core'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'advanced', 'hypertrophy', 'Ab wheel core exercise', 'SYSTEM'),
('Sit-ups', ARRAY['core'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Traditional abdominal exercise', 'SYSTEM'),
('Crunches', ARRAY['core'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Upper abdominal crunch', 'SYSTEM'),
('V-ups', ARRAY['core'], ARRAY['bodyweight'], ARRAY['strength'], ARRAY['push'], 'intermediate', 'hypertrophy', 'Full body crunch', 'SYSTEM'),

-- CARDIO/CONDITIONING EXERCISES
('Burpees', ARRAY['core', 'shoulders', 'legs'], ARRAY['bodyweight'], ARRAY['conditioning'], ARRAY['jump'], 'intermediate', 'endurance', 'Full body explosive exercise', 'SYSTEM'),
('Jumping Jacks', ARRAY['calves', 'shoulders'], ARRAY['bodyweight'], ARRAY['conditioning'], ARRAY['jump'], 'beginner', 'endurance', 'Classic cardio exercise', 'SYSTEM'),
('High Knees', ARRAY['core', 'legs'], ARRAY['bodyweight'], ARRAY['conditioning'], ARRAY['jump'], 'beginner', 'endurance', 'Running in place variation', 'SYSTEM'),
('Butt Kickers', ARRAY['hamstrings'], ARRAY['bodyweight'], ARRAY['conditioning'], ARRAY['jump'], 'beginner', 'endurance', 'Heel to glute kicks', 'SYSTEM'),
('Box Jumps', ARRAY['legs'], ARRAY['bodyweight'], ARRAY['plyometric'], ARRAY['jump'], 'intermediate', 'power', 'Explosive box jump', 'SYSTEM'),
('Tuck Jumps', ARRAY['legs', 'core'], ARRAY['bodyweight'], ARRAY['plyometric'], ARRAY['jump'], 'intermediate', 'power', 'Knees to chest jump', 'SYSTEM'),
('Broad Jumps', ARRAY['legs'], ARRAY['bodyweight'], ARRAY['plyometric'], ARRAY['jump'], 'intermediate', 'power', 'Horizontal jump', 'SYSTEM'),
('Battle Ropes', ARRAY['core', 'shoulders'], ARRAY['battle_ropes'], ARRAY['conditioning'], ARRAY['push'], 'intermediate', 'endurance', 'High-intensity rope exercise', 'SYSTEM'),
('Kettlebell Swings', ARRAY['glutes', 'hamstrings'], ARRAY['kettlebell'], ARRAY['conditioning'], ARRAY['hinge'], 'intermediate', 'power', 'Hip hinge power movement', 'SYSTEM'),
('Turkish Get-up', ARRAY['core', 'shoulders'], ARRAY['kettlebell'], ARRAY['strength'], ARRAY['push'], 'advanced', 'power', 'Complex movement pattern', 'SYSTEM'),
('Thrusters', ARRAY['legs', 'shoulders'], ARRAY['dumbbell'], ARRAY['conditioning'], ARRAY['squat'], 'intermediate', 'power', 'Squat to press combination', 'SYSTEM'),
('Man Makers', ARRAY['core', 'shoulders', 'legs'], ARRAY['dumbbell'], ARRAY['conditioning'], ARRAY['push'], 'advanced', 'endurance', 'Burpee with dumbbell rows', 'SYSTEM'),

-- FLEXIBILITY/MOBILITY EXERCISES
('Cat-Cow Stretch', ARRAY['back'], ARRAY['bodyweight'], ARRAY['flexibility'], ARRAY['push'], 'beginner', 'endurance', 'Spinal mobility exercise', 'SYSTEM'),
('Child''s Pose', ARRAY['back'], ARRAY['bodyweight'], ARRAY['flexibility'], ARRAY['push'], 'beginner', 'endurance', 'Restorative yoga pose', 'SYSTEM'),
('Cobra Stretch', ARRAY['back'], ARRAY['bodyweight'], ARRAY['flexibility'], ARRAY['push'], 'beginner', 'endurance', 'Spinal extension stretch', 'SYSTEM'),
('Pigeon Pose', ARRAY['glutes'], ARRAY['bodyweight'], ARRAY['flexibility'], ARRAY['hinge'], 'intermediate', 'endurance', 'Hip flexor stretch', 'SYSTEM'),
('Hip Circles', ARRAY['glutes'], ARRAY['bodyweight'], ARRAY['flexibility'], ARRAY['hinge'], 'beginner', 'endurance', 'Hip mobility exercise', 'SYSTEM'),
('Leg Swings', ARRAY['hamstrings'], ARRAY['bodyweight'], ARRAY['flexibility'], ARRAY['hinge'], 'beginner', 'endurance', 'Dynamic hip stretch', 'SYSTEM'),
('Arm Circles', ARRAY['shoulders'], ARRAY['bodyweight'], ARRAY['flexibility'], ARRAY['push'], 'beginner', 'endurance', 'Shoulder mobility exercise', 'SYSTEM'),
('Neck Rolls', ARRAY['neck'], ARRAY['bodyweight'], ARRAY['flexibility'], ARRAY['push'], 'beginner', 'endurance', 'Neck mobility exercise', 'SYSTEM'),

-- FUNCTIONAL/CARRY EXERCISES
('Farmer''s Walk', ARRAY['forearms', 'core'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['carry'], 'beginner', 'endurance', 'Loaded carry exercise', 'SYSTEM'),
('Suitcase Carry', ARRAY['core'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['carry'], 'beginner', 'endurance', 'Unilateral loaded carry', 'SYSTEM'),
('Overhead Carry', ARRAY['shoulders', 'core'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['carry'], 'intermediate', 'endurance', 'Overhead loaded carry', 'SYSTEM'),
('Front-Loaded Carry', ARRAY['core'], ARRAY['dumbbell'], ARRAY['strength'], ARRAY['carry'], 'beginner', 'endurance', 'Front-rack carry position', 'SYSTEM'),

-- SPORT-SPECIFIC EXERCISES
('Medicine Ball Slam', ARRAY['core', 'shoulders'], ARRAY['medicine_ball'], ARRAY['plyometric'], ARRAY['push'], 'intermediate', 'power', 'Explosive overhead slam', 'SYSTEM'),
('Medicine Ball Throws', ARRAY['core'], ARRAY['medicine_ball'], ARRAY['plyometric'], ARRAY['push'], 'intermediate', 'power', 'Rotational medicine ball throw', 'SYSTEM'),
('Agility Ladder Drills', ARRAY['calves'], ARRAY['agility_ladder'], ARRAY['conditioning'], ARRAY['jump'], 'beginner', 'endurance', 'Footwork coordination drills', 'SYSTEM'),
('Cone Drills', ARRAY['legs'], ARRAY['bodyweight'], ARRAY['conditioning'], ARRAY['jump'], 'beginner', 'endurance', 'Agility cone exercises', 'SYSTEM'),
('Sprint Intervals', ARRAY['legs'], ARRAY['bodyweight'], ARRAY['conditioning'], ARRAY['jump'], 'intermediate', 'endurance', 'High-intensity running', 'SYSTEM'),
('Shuttle Runs', ARRAY['legs'], ARRAY['bodyweight'], ARRAY['conditioning'], ARRAY['jump'], 'intermediate', 'endurance', 'Back and forth running', 'SYSTEM'),

-- RESISTANCE BAND EXERCISES
('Band Pull-Aparts', ARRAY['shoulders'], ARRAY['resistance_band'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Rear delt band exercise', 'SYSTEM'),
('Band Rows', ARRAY['back'], ARRAY['resistance_band'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Seated band row', 'SYSTEM'),
('Band Squats', ARRAY['legs'], ARRAY['resistance_band'], ARRAY['strength'], ARRAY['squat'], 'beginner', 'hypertrophy', 'Resistance band squat', 'SYSTEM'),
('Band Chest Press', ARRAY['chest'], ARRAY['resistance_band'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Band chest exercise', 'SYSTEM'),
('Band Bicep Curls', ARRAY['biceps'], ARRAY['resistance_band'], ARRAY['strength'], ARRAY['pull'], 'beginner', 'hypertrophy', 'Band bicep exercise', 'SYSTEM'),
('Band Tricep Extensions', ARRAY['triceps'], ARRAY['resistance_band'], ARRAY['strength'], ARRAY['push'], 'beginner', 'hypertrophy', 'Band tricep exercise', 'SYSTEM'),
('Band Lateral Walks', ARRAY['glutes'], ARRAY['resistance_band'], ARRAY['strength'], ARRAY['hinge'], 'beginner', 'hypertrophy', 'Side-stepping with band', 'SYSTEM'),

-- BALANCE/STABILITY EXERCISES
('Single-Leg Stand', ARRAY['calves'], ARRAY['bodyweight'], ARRAY['balance'], ARRAY['push'], 'beginner', 'endurance', 'Basic balance exercise', 'SYSTEM'),
('BOSU Ball Squats', ARRAY['legs'], ARRAY['bosu_ball'], ARRAY['balance'], ARRAY['squat'], 'intermediate', 'hypertrophy', 'Unstable surface squat', 'SYSTEM'),
('Stability Ball Plank', ARRAY['core'], ARRAY['stability_ball'], ARRAY['balance'], ARRAY['push'], 'intermediate', 'endurance', 'Ball plank exercise', 'SYSTEM'),
('Single-Leg Deadlift', ARRAY['hamstrings', 'glutes'], ARRAY['bodyweight'], ARRAY['balance'], ARRAY['hinge'], 'intermediate', 'hypertrophy', 'Unilateral balance exercise', 'SYSTEM');

-- Create indexes for better search performance
CREATE INDEX IF NOT EXISTS idx_exercises_name_gin ON exercises USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_exercises_muscle_gin ON exercises USING gin(muscle);
CREATE INDEX IF NOT EXISTS idx_exercises_equipment_gin ON exercises USING gin(equipment);
CREATE INDEX IF NOT EXISTS idx_exercises_modality_gin ON exercises USING gin(modality);
CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty);
CREATE INDEX IF NOT EXISTS idx_exercises_pattern_gin ON exercises USING gin(pattern);
