-- Social Features Database Schema for Catalyft
-- This migration creates all tables needed for social features

-- User Profiles (Extended profile information)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  bio TEXT,
  profile_picture TEXT,
  cover_photo TEXT,
  location TEXT,
  website TEXT,
  is_private BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  
  -- Stats
  total_workouts INTEGER DEFAULT 0,
  total_workout_time INTEGER DEFAULT 0, -- minutes
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_calories_burned INTEGER DEFAULT 0,
  
  -- Preferences (deprecated - moved to privacy_settings)
  show_workout_stats BOOLEAN DEFAULT true,
  show_nutrition_stats BOOLEAN DEFAULT true,
  show_achievements BOOLEAN DEFAULT true,
  allow_messages TEXT DEFAULT 'everyone' CHECK (allow_messages IN ('everyone', 'following', 'none')),
  
  -- Privacy Settings (comprehensive)
  privacy_settings JSONB DEFAULT '{
    "profileVisibility": "public",
    "showWorkoutDetails": true,
    "showNutritionDetails": false,
    "showLocation": false,
    "allowTagging": true,
    "allowMessages": "followers",
    "blockedUsers": [],
    "shareWorkoutStats": true,
    "sharePersonalRecords": true,
    "shareBodyMeasurements": false,
    "shareWeight": false,
    "shareCaloriesBurned": true,
    "shareDuration": true,
    "shareExerciseDetails": true,
    "shareMealPhotos": false,
    "shareMacros": false,
    "shareCalorieIntake": false,
    "shareStreaks": true,
    "shareAchievements": true,
    "shareChallengeParticipation": true,
    "shareLeaderboardPosition": true,
    "allowFriendRequests": true,
    "showInDiscovery": true,
    "activityFeedPrivacy": "followers",
    "workoutHistoryPrivacy": "private",
    "achievementsPrivacy": "public"
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follows (User relationships)
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Activity Feed (Posts)
CREATE TABLE IF NOT EXISTS activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('workout', 'meal', 'achievement', 'challenge', 'pr', 'text', 'photo')),
  content TEXT,
  images TEXT[], -- Array of image URLs
  
  -- Type-specific data (JSONB for flexibility)
  workout_data JSONB,
  meal_data JSONB,
  achievement_data JSONB,
  challenge_data JSONB,
  pr_data JSONB,
  
  -- Metadata
  tags TEXT[],
  mentions UUID[], -- User IDs mentioned
  location TEXT,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'followers', 'private')),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For nested comments
  mentions UUID[], -- User IDs mentioned
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reactions
CREATE TABLE IF NOT EXISTS reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'fire', 'strong', 'beast', 'inspire', 'wow')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Challenges
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  
  -- Rules
  goal NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  duration INTEGER NOT NULL, -- days
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  
  -- Participation
  max_participants INTEGER,
  is_public BOOLEAN DEFAULT true,
  invite_only BOOLEAN DEFAULT false,
  entry_fee NUMERIC,
  
  -- Rewards
  rewards JSONB,
  badge_icon TEXT,
  points INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  winner_id UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Challenge Participants
CREATE TABLE IF NOT EXISTS challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  progress NUMERIC DEFAULT 0,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(challenge_id, user_id)
);

-- Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  icon TEXT,
  rarity TEXT NOT NULL CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  points INTEGER DEFAULT 0,
  requirement JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Social Notifications
CREATE TABLE IF NOT EXISTS social_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT,
  message TEXT,
  data JSONB,
  
  -- Related entities
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES activity_feed(id) ON DELETE CASCADE,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
  
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_activity_feed_user ON activity_feed(user_id);
CREATE INDEX idx_activity_feed_created ON activity_feed(created_at DESC);
CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_reactions_post ON reactions(post_id);
CREATE INDEX idx_challenge_participants_challenge ON challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_user ON challenge_participants(user_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_social_notifications_user ON social_notifications(user_id);
CREATE INDEX idx_social_notifications_unread ON social_notifications(user_id, is_read) WHERE is_read = false;

-- Row Level Security (RLS) Policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_notifications ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON user_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Follows Policies
CREATE POLICY "Follows are viewable by everyone"
  ON follows FOR SELECT
  USING (true);

CREATE POLICY "Users can create follows"
  ON follows FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON follows FOR DELETE
  USING (auth.uid() = follower_id);

-- Activity Feed Policies
CREATE POLICY "Public posts are viewable by everyone"
  ON activity_feed FOR SELECT
  USING (visibility = 'public' OR user_id = auth.uid() OR 
         (visibility = 'followers' AND EXISTS (
           SELECT 1 FROM follows WHERE follower_id = auth.uid() AND following_id = activity_feed.user_id
         )));

CREATE POLICY "Users can create own posts"
  ON activity_feed FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON activity_feed FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON activity_feed FOR DELETE
  USING (auth.uid() = user_id);

-- Comments Policies
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- Reactions Policies
CREATE POLICY "Reactions are viewable by everyone"
  ON reactions FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reactions"
  ON reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions"
  ON reactions FOR DELETE
  USING (auth.uid() = user_id);

-- Challenges Policies
CREATE POLICY "Public challenges are viewable by everyone"
  ON challenges FOR SELECT
  USING (is_public = true OR creator_id = auth.uid() OR 
         EXISTS (
           SELECT 1 FROM challenge_participants 
           WHERE challenge_id = challenges.id AND user_id = auth.uid()
         ));

CREATE POLICY "Authenticated users can create challenges"
  ON challenges FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own challenges"
  ON challenges FOR UPDATE
  USING (auth.uid() = creator_id);

-- Challenge Participants Policies
CREATE POLICY "Challenge participants are viewable"
  ON challenge_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join challenges"
  ON challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation"
  ON challenge_participants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can leave challenges"
  ON challenge_participants FOR DELETE
  USING (auth.uid() = user_id);

-- Achievements Policies
CREATE POLICY "Achievements are viewable by everyone"
  ON achievements FOR SELECT
  USING (true);

-- User Achievements Policies
CREATE POLICY "User achievements are viewable by everyone"
  ON user_achievements FOR SELECT
  USING (true);

CREATE POLICY "System can create user achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Social Notifications Policies
CREATE POLICY "Users can view own notifications"
  ON social_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON social_notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON social_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activity_feed_updated_at BEFORE UPDATE ON activity_feed
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get suggested users
CREATE OR REPLACE FUNCTION get_suggested_users(
  current_user_id UUID,
  limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  profile_picture TEXT,
  bio TEXT,
  followers_count BIGINT,
  is_following BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    up.id,
    up.user_id,
    up.username,
    up.full_name,
    up.profile_picture,
    up.bio,
    COUNT(DISTINCT f.id) as followers_count,
    EXISTS(
      SELECT 1 FROM follows 
      WHERE follower_id = current_user_id AND following_id = up.user_id
    ) as is_following
  FROM user_profiles up
  LEFT JOIN follows f ON f.following_id = up.user_id
  WHERE up.user_id != current_user_id
    AND NOT EXISTS(
      SELECT 1 FROM follows 
      WHERE follower_id = current_user_id AND following_id = up.user_id
    )
  GROUP BY up.id, up.user_id, up.username, up.full_name, up.profile_picture, up.bio
  ORDER BY followers_count DESC, up.created_at DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get global leaderboard
CREATE OR REPLACE FUNCTION get_global_leaderboard(
  category_param TEXT,
  timeframe_param TEXT
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  profile_picture TEXT,
  value NUMERIC,
  unit TEXT
) AS $$
BEGIN
  -- Implementation would vary based on category and timeframe
  -- This is a simplified version
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY up.total_workouts DESC) as rank,
    up.user_id,
    up.username,
    up.full_name,
    up.profile_picture,
    up.total_workouts::NUMERIC as value,
    'workouts' as unit
  FROM user_profiles up
  ORDER BY up.total_workouts DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;

-- Function to get friends leaderboard
CREATE OR REPLACE FUNCTION get_friends_leaderboard(
  user_ids UUID[],
  category_param TEXT,
  timeframe_param TEXT
)
RETURNS TABLE (
  rank BIGINT,
  user_id UUID,
  username TEXT,
  full_name TEXT,
  profile_picture TEXT,
  value NUMERIC,
  unit TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROW_NUMBER() OVER (ORDER BY up.total_workouts DESC) as rank,
    up.user_id,
    up.username,
    up.full_name,
    up.profile_picture,
    up.total_workouts::NUMERIC as value,
    'workouts' as unit
  FROM user_profiles up
  WHERE up.user_id = ANY(user_ids)
  ORDER BY up.total_workouts DESC;
END;
$$ LANGUAGE plpgsql;

-- Insert default achievements
INSERT INTO achievements (name, description, category, icon, rarity, points, requirement) VALUES
  ('First Workout', 'Complete your first workout', 'workout', '🏃', 'common', 10, '{"type": "workout_count", "target": 1, "description": "Complete 1 workout"}'::jsonb),
  ('Week Warrior', 'Complete 7 workouts in a week', 'workout', '💪', 'rare', 50, '{"type": "weekly_workouts", "target": 7, "description": "Complete 7 workouts in a week"}'::jsonb),
  ('Streak Master', 'Maintain a 30-day workout streak', 'streak', '🔥', 'epic', 100, '{"type": "streak", "target": 30, "description": "30-day workout streak"}'::jsonb),
  ('Social Butterfly', 'Get 100 followers', 'social', '🦋', 'rare', 50, '{"type": "followers", "target": 100, "description": "Get 100 followers"}'::jsonb),
  ('Challenge Champion', 'Win 5 challenges', 'challenge', '🏆', 'legendary', 200, '{"type": "challenge_wins", "target": 5, "description": "Win 5 challenges"}'::jsonb),
  ('Nutrition Ninja', 'Log 100 meals', 'nutrition', '🥗', 'rare', 50, '{"type": "meal_count", "target": 100, "description": "Log 100 meals"}'::jsonb),
  ('Calorie Crusher', 'Burn 10,000 calories', 'milestone', '🔥', 'epic', 100, '{"type": "calories_burned", "target": 10000, "description": "Burn 10,000 calories"}'::jsonb),
  ('Early Bird', 'Complete 20 morning workouts', 'workout', '🌅', 'common', 25, '{"type": "morning_workouts", "target": 20, "description": "Complete 20 workouts before 9 AM"}'::jsonb),
  ('Night Owl', 'Complete 20 evening workouts', 'workout', '🌙', 'common', 25, '{"type": "evening_workouts", "target": 20, "description": "Complete 20 workouts after 8 PM"}'::jsonb),
  ('PR Hunter', 'Set 10 personal records', 'milestone', '📈', 'rare', 75, '{"type": "personal_records", "target": 10, "description": "Set 10 personal records"}'::jsonb)
ON CONFLICT DO NOTHING;