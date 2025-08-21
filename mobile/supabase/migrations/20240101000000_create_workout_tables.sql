-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Exercise library table
CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100), -- strength, cardio, flexibility, balance
  muscle_group VARCHAR(100), -- chest, back, legs, shoulders, arms, core, full_body
  equipment VARCHAR(100), -- barbell, dumbbell, machine, bodyweight, cable, kettlebell, bands
  instructions TEXT,
  image_url TEXT,
  video_url TEXT,
  is_custom BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for exercise queries
CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group);
CREATE INDEX idx_exercises_equipment ON exercises(equipment);
CREATE INDEX idx_exercises_name ON exercises(name);

-- User workouts
CREATE TABLE IF NOT EXISTS workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name VARCHAR(255),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  total_volume DECIMAL,
  total_sets INTEGER DEFAULT 0,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for workout queries
CREATE INDEX idx_workouts_user_id ON workouts(user_id);
CREATE INDEX idx_workouts_started_at ON workouts(started_at);
CREATE INDEX idx_workouts_completed_at ON workouts(completed_at);

-- Workout exercises (exercises in a workout)
CREATE TABLE IF NOT EXISTS workout_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID REFERENCES exercises(id),
  order_index INTEGER,
  notes TEXT,
  is_superset BOOLEAN DEFAULT false,
  superset_group INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for workout exercise queries
CREATE INDEX idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);

-- Individual sets
CREATE TABLE IF NOT EXISTS sets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workout_exercise_id UUID REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_number INTEGER,
  weight DECIMAL,
  reps INTEGER,
  distance_meters DECIMAL, -- For cardio exercises
  duration_seconds INTEGER, -- For time-based exercises
  rest_seconds INTEGER,
  rpe INTEGER, -- Rate of Perceived Exertion (1-10)
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for set queries
CREATE INDEX idx_sets_workout_exercise_id ON sets(workout_exercise_id);
CREATE INDEX idx_sets_completed ON sets(completed);

-- Workout templates
CREATE TABLE IF NOT EXISTS workout_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  exercises JSONB, -- Store template structure
  is_public BOOLEAN DEFAULT false,
  category VARCHAR(100), -- push/pull/legs, upper/lower, full_body, custom
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for template queries
CREATE INDEX idx_workout_templates_user_id ON workout_templates(user_id);
CREATE INDEX idx_workout_templates_is_public ON workout_templates(is_public);
CREATE INDEX idx_workout_templates_category ON workout_templates(category);

-- Personal records
CREATE TABLE IF NOT EXISTS personal_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  weight DECIMAL,
  reps INTEGER,
  one_rep_max DECIMAL,
  volume DECIMAL, -- weight * reps
  achieved_at TIMESTAMP WITH TIME ZONE,
  workout_id UUID REFERENCES workouts(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- Create indexes for personal record queries
CREATE INDEX idx_personal_records_user_id ON personal_records(user_id);
CREATE INDEX idx_personal_records_exercise_id ON personal_records(exercise_id);
CREATE INDEX idx_personal_records_achieved_at ON personal_records(achieved_at);

-- User exercise favorites
CREATE TABLE IF NOT EXISTS user_exercise_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  exercise_id UUID REFERENCES exercises(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, exercise_id)
);

-- Create indexes for favorite queries
CREATE INDEX idx_user_exercise_favorites_user_id ON user_exercise_favorites(user_id);

-- Workout goals
CREATE TABLE IF NOT EXISTS workout_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  exercise_id UUID REFERENCES exercises(id),
  goal_type VARCHAR(50), -- weight, reps, one_rep_max, volume
  target_value DECIMAL,
  current_value DECIMAL,
  deadline DATE,
  achieved BOOLEAN DEFAULT false,
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for goal queries
CREATE INDEX idx_workout_goals_user_id ON workout_goals(user_id);
CREATE INDEX idx_workout_goals_achieved ON workout_goals(achieved);

-- Row Level Security (RLS) Policies
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_exercise_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_goals ENABLE ROW LEVEL SECURITY;

-- Exercises policies (public read, authenticated write for custom)
CREATE POLICY "Exercises are viewable by everyone" ON exercises
  FOR SELECT USING (true);

CREATE POLICY "Users can create custom exercises" ON exercises
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their custom exercises" ON exercises
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their custom exercises" ON exercises
  FOR DELETE USING (auth.uid() = created_by);

-- Workouts policies (users can only see their own)
CREATE POLICY "Users can view their own workouts" ON workouts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workouts" ON workouts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts" ON workouts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workouts" ON workouts
  FOR DELETE USING (auth.uid() = user_id);

-- Workout exercises policies (users can manage their workout exercises)
CREATE POLICY "Users can view their workout exercises" ON workout_exercises
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create workout exercises" ON workout_exercises
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their workout exercises" ON workout_exercises
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their workout exercises" ON workout_exercises
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workouts 
      WHERE workouts.id = workout_exercises.workout_id 
      AND workouts.user_id = auth.uid()
    )
  );

-- Sets policies (users can manage their sets)
CREATE POLICY "Users can view their sets" ON sets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE we.id = sets.workout_exercise_id 
      AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create sets" ON sets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE we.id = sets.workout_exercise_id 
      AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their sets" ON sets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE we.id = sets.workout_exercise_id 
      AND w.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their sets" ON sets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE we.id = sets.workout_exercise_id 
      AND w.user_id = auth.uid()
    )
  );

-- Templates policies (users can see public templates and their own)
CREATE POLICY "Users can view public templates and their own" ON workout_templates
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create their own templates" ON workout_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own templates" ON workout_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own templates" ON workout_templates
  FOR DELETE USING (auth.uid() = user_id);

-- Personal records policies (users can only see their own)
CREATE POLICY "Users can view their own personal records" ON personal_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own personal records" ON personal_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personal records" ON personal_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own personal records" ON personal_records
  FOR DELETE USING (auth.uid() = user_id);

-- Favorites policies (users can only manage their own)
CREATE POLICY "Users can view their own favorites" ON user_exercise_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own favorites" ON user_exercise_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON user_exercise_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- Goals policies (users can only manage their own)
CREATE POLICY "Users can view their own goals" ON workout_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" ON workout_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON workout_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON workout_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_exercises_updated_at BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_templates_updated_at BEFORE UPDATE ON workout_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_goals_updated_at BEFORE UPDATE ON workout_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();