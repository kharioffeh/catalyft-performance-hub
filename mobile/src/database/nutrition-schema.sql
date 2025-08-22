-- Nutrition Tracking System Database Schema
-- Comprehensive schema for food tracking, recipes, meal planning, and analytics

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Food items database
CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  barcode VARCHAR(100),
  serving_size DECIMAL(10, 2),
  serving_unit VARCHAR(50),
  calories DECIMAL(10, 2),
  protein DECIMAL(10, 2),
  carbs DECIMAL(10, 2),
  fat DECIMAL(10, 2),
  fiber DECIMAL(10, 2),
  sugar DECIMAL(10, 2),
  sodium DECIMAL(10, 2),
  saturated_fat DECIMAL(10, 2),
  trans_fat DECIMAL(10, 2),
  cholesterol DECIMAL(10, 2),
  potassium DECIMAL(10, 2),
  vitamin_a DECIMAL(10, 2),
  vitamin_c DECIMAL(10, 2),
  calcium DECIMAL(10, 2),
  iron DECIMAL(10, 2),
  nutritionix_id VARCHAR(100),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- for custom foods
  is_verified BOOLEAN DEFAULT false,
  image_url TEXT,
  category VARCHAR(50),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for foods table
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_barcode ON foods(barcode);
CREATE INDEX idx_foods_user_id ON foods(user_id);
CREATE INDEX idx_foods_nutritionix_id ON foods(nutritionix_id);
CREATE INDEX idx_foods_category ON foods(category);

-- User's food diary entries
CREATE TABLE IF NOT EXISTS food_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
  meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  calories DECIMAL(10, 2) NOT NULL,
  protein DECIMAL(10, 2) NOT NULL,
  carbs DECIMAL(10, 2) NOT NULL,
  fat DECIMAL(10, 2) NOT NULL,
  fiber DECIMAL(10, 2),
  sugar DECIMAL(10, 2),
  sodium DECIMAL(10, 2),
  notes TEXT,
  image_url TEXT,
  logged_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for food_logs table
CREATE INDEX idx_food_logs_user_id ON food_logs(user_id);
CREATE INDEX idx_food_logs_logged_at ON food_logs(logged_at);
CREATE INDEX idx_food_logs_meal_type ON food_logs(meal_type);
CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, logged_at);

-- User recipes
CREATE TABLE IF NOT EXISTS recipes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  servings INTEGER NOT NULL DEFAULT 1,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  total_time INTEGER, -- in minutes
  difficulty VARCHAR(20) CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine VARCHAR(100),
  meal_types TEXT[],
  instructions TEXT NOT NULL,
  image_url TEXT,
  total_calories DECIMAL(10, 2),
  total_protein DECIMAL(10, 2),
  total_carbs DECIMAL(10, 2),
  total_fat DECIMAL(10, 2),
  total_fiber DECIMAL(10, 2),
  total_sugar DECIMAL(10, 2),
  total_sodium DECIMAL(10, 2),
  is_favorite BOOLEAN DEFAULT false,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for recipes table
CREATE INDEX idx_recipes_user_id ON recipes(user_id);
CREATE INDEX idx_recipes_name ON recipes(name);
CREATE INDEX idx_recipes_is_favorite ON recipes(is_favorite);

-- Recipe ingredients
CREATE TABLE IF NOT EXISTS recipe_ingredients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for recipe_ingredients table
CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_food_id ON recipe_ingredients(food_id);

-- Meal plans
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  daily_calories_target DECIMAL(10, 2),
  protein_target DECIMAL(10, 2),
  carbs_target DECIMAL(10, 2),
  fat_target DECIMAL(10, 2),
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Indexes for meal_plans table
CREATE INDEX idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX idx_meal_plans_dates ON meal_plans(start_date, end_date);
CREATE INDEX idx_meal_plans_is_active ON meal_plans(is_active);

-- Meal plan items
CREATE TABLE IF NOT EXISTS meal_plan_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE NOT NULL,
  planned_date DATE NOT NULL,
  meal_type VARCHAR(50) NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT has_food_or_recipe CHECK (
    (food_id IS NOT NULL AND recipe_id IS NULL) OR 
    (food_id IS NULL AND recipe_id IS NOT NULL)
  )
);

-- Indexes for meal_plan_items table
CREATE INDEX idx_meal_plan_items_meal_plan_id ON meal_plan_items(meal_plan_id);
CREATE INDEX idx_meal_plan_items_planned_date ON meal_plan_items(planned_date);
CREATE INDEX idx_meal_plan_items_meal_type ON meal_plan_items(meal_type);

-- Water intake tracking
CREATE TABLE IF NOT EXISTS water_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_ml INTEGER NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for water_logs table
CREATE INDEX idx_water_logs_user_id ON water_logs(user_id);
CREATE INDEX idx_water_logs_logged_at ON water_logs(logged_at);
CREATE INDEX idx_water_logs_user_date ON water_logs(user_id, DATE(logged_at));

-- Nutrition goals
CREATE TABLE IF NOT EXISTS nutrition_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  daily_calories INTEGER,
  protein_grams INTEGER,
  carbs_grams INTEGER,
  fat_grams INTEGER,
  fiber_grams INTEGER,
  sugar_grams INTEGER,
  sodium_mg INTEGER,
  water_ml INTEGER DEFAULT 2000,
  goal_type VARCHAR(50) CHECK (goal_type IN ('weight_loss', 'weight_gain', 'maintenance', 'muscle_gain', 'performance')),
  activity_level VARCHAR(50) CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for nutrition_goals table
CREATE INDEX idx_nutrition_goals_user_id ON nutrition_goals(user_id);

-- Favorite foods for quick access
CREATE TABLE IF NOT EXISTS favorite_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_food_favorite UNIQUE (user_id, food_id)
);

-- Indexes for favorite_foods table
CREATE INDEX idx_favorite_foods_user_id ON favorite_foods(user_id);
CREATE INDEX idx_favorite_foods_food_id ON favorite_foods(food_id);

-- Recent foods cache for quick access
CREATE TABLE IF NOT EXISTS recent_foods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
  last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  use_count INTEGER DEFAULT 1,
  CONSTRAINT unique_user_food_recent UNIQUE (user_id, food_id)
);

-- Indexes for recent_foods table
CREATE INDEX idx_recent_foods_user_id ON recent_foods(user_id);
CREATE INDEX idx_recent_foods_last_used ON recent_foods(last_used);

-- Shopping list items
CREATE TABLE IF NOT EXISTS shopping_list_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  quantity DECIMAL(10, 2),
  unit VARCHAR(50),
  category VARCHAR(50),
  is_checked BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for shopping_list_items table
CREATE INDEX idx_shopping_list_items_user_id ON shopping_list_items(user_id);
CREATE INDEX idx_shopping_list_items_meal_plan_id ON shopping_list_items(meal_plan_id);
CREATE INDEX idx_shopping_list_items_is_checked ON shopping_list_items(is_checked);

-- Barcode scan history
CREATE TABLE IF NOT EXISTS barcode_scan_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  barcode VARCHAR(100) NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
  scanned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for barcode_scan_history table
CREATE INDEX idx_barcode_scan_history_user_id ON barcode_scan_history(user_id);
CREATE INDEX idx_barcode_scan_history_barcode ON barcode_scan_history(barcode);
CREATE INDEX idx_barcode_scan_history_scanned_at ON barcode_scan_history(scanned_at);

-- Meal suggestions
CREATE TABLE IF NOT EXISTS meal_suggestions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  meal_type VARCHAR(50) CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  total_calories DECIMAL(10, 2),
  total_protein DECIMAL(10, 2),
  total_carbs DECIMAL(10, 2),
  total_fat DECIMAL(10, 2),
  tags TEXT[],
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Meal suggestion items
CREATE TABLE IF NOT EXISTS meal_suggestion_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  suggestion_id UUID REFERENCES meal_suggestions(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES foods(id) ON DELETE CASCADE NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit VARCHAR(50) NOT NULL
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_foods_updated_at BEFORE UPDATE ON foods
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_logs_updated_at BEFORE UPDATE ON food_logs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON recipes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_goals_updated_at BEFORE UPDATE ON nutrition_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shopping_list_items_updated_at BEFORE UPDATE ON shopping_list_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE recent_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE barcode_scan_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for foods table
CREATE POLICY "Users can view all verified foods" ON foods
  FOR SELECT USING (is_verified = true OR user_id = auth.uid());

CREATE POLICY "Users can create their own foods" ON foods
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own foods" ON foods
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own foods" ON foods
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for food_logs table
CREATE POLICY "Users can view their own food logs" ON food_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own food logs" ON food_logs
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own food logs" ON food_logs
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own food logs" ON food_logs
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for recipes table
CREATE POLICY "Users can view their own recipes" ON recipes
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own recipes" ON recipes
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own recipes" ON recipes
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own recipes" ON recipes
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for water_logs table
CREATE POLICY "Users can manage their own water logs" ON water_logs
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for nutrition_goals table
CREATE POLICY "Users can manage their own nutrition goals" ON nutrition_goals
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for meal_plans table
CREATE POLICY "Users can manage their own meal plans" ON meal_plans
  FOR ALL USING (user_id = auth.uid());

-- RLS Policies for other user-specific tables
CREATE POLICY "Users can manage their own favorite foods" ON favorite_foods
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own recent foods" ON recent_foods
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own shopping list" ON shopping_list_items
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own barcode scan history" ON barcode_scan_history
  FOR ALL USING (user_id = auth.uid());

-- Create views for common queries
CREATE OR REPLACE VIEW daily_nutrition_summary AS
SELECT 
  fl.user_id,
  fl.logged_at as date,
  SUM(fl.calories) as total_calories,
  SUM(fl.protein) as total_protein,
  SUM(fl.carbs) as total_carbs,
  SUM(fl.fat) as total_fat,
  SUM(fl.fiber) as total_fiber,
  SUM(fl.sugar) as total_sugar,
  SUM(fl.sodium) as total_sodium,
  COUNT(DISTINCT fl.id) as total_entries,
  COUNT(DISTINCT fl.meal_type) as meals_logged
FROM food_logs fl
GROUP BY fl.user_id, fl.logged_at;

-- Create view for water intake summary
CREATE OR REPLACE VIEW daily_water_summary AS
SELECT 
  user_id,
  DATE(logged_at) as date,
  SUM(amount_ml) as total_water_ml,
  COUNT(*) as log_count
FROM water_logs
GROUP BY user_id, DATE(logged_at);

-- Grant permissions for views
GRANT SELECT ON daily_nutrition_summary TO authenticated;
GRANT SELECT ON daily_water_summary TO authenticated;