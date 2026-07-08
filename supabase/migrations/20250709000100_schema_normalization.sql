-- =============================================
-- SCHEMA NORMALIZATION: Split monolithic users table into normalized tables
-- Preserves all existing data. Adds proper RLS, triggers, indexes.
-- =============================================

-- =============================================
-- 1. Enable RLS on all existing tables
-- =============================================
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY['users','groups','group_members','events','attendance','leagues','teams','matches','announcements','friendships','stories','notifications'])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', tbl);
  END LOOP;
END $$;

-- =============================================
-- 2. Create normalized tables
-- =============================================

-- PROFILES (core identity, references auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL DEFAULT '',
  profile_code TEXT NOT NULL UNIQUE,
  avatar TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate existing data from users -> profiles
INSERT INTO profiles (id, name, username, email, phone, profile_code, avatar, cover_image, bio, joined_at, created_at)
SELECT id, name, username, email, COALESCE(phone, ''), profile_code, avatar, cover_image, bio,
  CASE
    WHEN joined_at ~ '^\d{4}-\d{2}-\d{2}' THEN joined_at::TIMESTAMPTZ
    ELSE NOW()
  END,
  created_at
FROM users
ON CONFLICT (id) DO NOTHING;

-- USER STATS (statistics, separated from profile)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  total_matches INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  attendance_rate REAL NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  win_rate REAL NOT NULL DEFAULT 0,
  weekly_activity INT[] NOT NULL DEFAULT '{0,0,0,0,0,0,0}',
  points_total INT NOT NULL DEFAULT 0,
  mvp_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate existing data from users -> user_stats
INSERT INTO user_stats (user_id, total_matches, wins, losses, attendance_rate, current_streak, longest_streak, win_rate, weekly_activity, points_total, mvp_count)
SELECT id, total_matches, wins, losses, attendance_rate, current_streak, longest_streak, win_rate, weekly_activity, points_total, mvp_count
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- USER LEVELS (xp/level system)
CREATE TABLE IF NOT EXISTS user_levels (
  user_id TEXT PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate existing data from users -> user_levels
INSERT INTO user_levels (user_id, level, xp)
SELECT id, level, xp
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- USER FAVOURITE SPORTS (normalize array)
CREATE TABLE IF NOT EXISTS user_favourite_sports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sport TEXT NOT NULL,
  UNIQUE(user_id, sport)
);

-- Migrate: expand favourite_sports arrays
INSERT INTO user_favourite_sports (user_id, sport)
SELECT u.id, unnest(u.favourite_sports)
FROM users u
WHERE array_length(u.favourite_sports, 1) > 0
ON CONFLICT DO NOTHING;

-- USER BADGES (normalize array)
CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  badge TEXT NOT NULL,
  UNIQUE(user_id, badge)
);

-- Migrate: expand badges arrays
INSERT INTO user_badges (user_id, badge)
SELECT u.id, unnest(u.badges)
FROM users u
WHERE array_length(u.badges, 1) > 0
ON CONFLICT DO NOTHING;

-- USER CREATED GROUPS (normalize array)
CREATE TABLE IF NOT EXISTS user_created_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- Migrate: expand created_groups arrays
INSERT INTO user_created_groups (user_id, group_id)
SELECT u.id, unnest(u.created_groups)
FROM users u
WHERE array_length(u.created_groups, 1) > 0
ON CONFLICT DO NOTHING;

-- USER JOINED GROUPS (normalize array)
CREATE TABLE IF NOT EXISTS user_joined_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, group_id)
);

-- Migrate: expand joined_groups arrays
INSERT INTO user_joined_groups (user_id, group_id)
SELECT u.id, unnest(u.joined_groups)
FROM users u
WHERE array_length(u.joined_groups, 1) > 0
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. Update trigger function for new users
-- =============================================

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  display_name TEXT;
  profile_code_str TEXT;
BEGIN
  display_name := COALESCE(new.raw_user_meta_data ->> 'name', SPLIT_PART(new.email, '@', 1));
  profile_code_str := UPPER(SPLIT_PART(display_name, ' ', 1)) || LPAD(CAST(FLOOR(RANDOM() * 99999)::int AS TEXT), 5, '0');

  -- Insert into profiles
  INSERT INTO public.profiles (id, name, username, email, phone, profile_code, avatar, cover_image, bio, joined_at)
  VALUES (new.id, display_name, LOWER(REPLACE(display_name, ' ', '')), new.email,
    COALESCE(new.raw_user_meta_data ->> 'phone', ''), profile_code_str,
    'https://api.dicebear.com/9.x/avataaars/svg?seed=' || REPLACE(display_name, ' ', '%20') || '&backgroundColor=b6e3f4',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', '', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Also insert into old users table so existing FK constraints still work
  INSERT INTO public.users (id, name, username, email, phone, password, profile_code, avatar, cover_image, bio,
    favourite_sports, badges, total_matches, wins, losses, attendance_rate, current_streak, longest_streak, win_rate,
    weekly_activity, points_total, mvp_count, created_groups, joined_groups, joined_at, level, xp)
  VALUES (new.id, display_name, LOWER(REPLACE(display_name, ' ', '')), new.email,
    COALESCE(new.raw_user_meta_data ->> 'phone', ''), '', profile_code_str,
    'https://api.dicebear.com/9.x/avataaars/svg?seed=' || REPLACE(display_name, ' ', '%20') || '&backgroundColor=b6e3f4',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', '',
    '{}', '{}', 0, 0, 0, 0, 0, 0, 0, '{0,0,0,0,0,0,0}', 0, 0, '{}', '{}',
    CURRENT_DATE, 1, 0)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_stats (user_id) VALUES (new.id) ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_levels (user_id) VALUES (new.id) ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- =============================================
-- 4. RLS Policies for new tables
-- =============================================

-- PROFILES
DO $$
BEGIN
  DROP POLICY IF EXISTS profiles_select_anon ON profiles;
  CREATE POLICY profiles_select_anon ON profiles FOR SELECT TO anon USING (true);
  DROP POLICY IF EXISTS profiles_select_auth ON profiles;
  CREATE POLICY profiles_select_auth ON profiles FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS profiles_insert_own ON profiles;
  CREATE POLICY profiles_insert_own ON profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid()::TEXT);
  DROP POLICY IF EXISTS profiles_update_own ON profiles;
  CREATE POLICY profiles_update_own ON profiles FOR UPDATE TO authenticated USING (id = auth.uid()::TEXT) WITH CHECK (id = auth.uid()::TEXT);
END $$;

-- USER STATS
DO $$
BEGIN
  DROP POLICY IF EXISTS user_stats_select_anon ON user_stats;
  CREATE POLICY user_stats_select_anon ON user_stats FOR SELECT TO anon USING (true);
  DROP POLICY IF EXISTS user_stats_select_auth ON user_stats;
  CREATE POLICY user_stats_select_auth ON user_stats FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS user_stats_insert_own ON user_stats;
  CREATE POLICY user_stats_insert_own ON user_stats FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::TEXT);
  DROP POLICY IF EXISTS user_stats_update_own ON user_stats;
  CREATE POLICY user_stats_update_own ON user_stats FOR UPDATE TO authenticated USING (user_id = auth.uid()::TEXT) WITH CHECK (user_id = auth.uid()::TEXT);
END $$;

-- USER LEVELS
DO $$
BEGIN
  DROP POLICY IF EXISTS user_levels_select_anon ON user_levels;
  CREATE POLICY user_levels_select_anon ON user_levels FOR SELECT TO anon USING (true);
  DROP POLICY IF EXISTS user_levels_select_auth ON user_levels;
  CREATE POLICY user_levels_select_auth ON user_levels FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS user_levels_insert_own ON user_levels;
  CREATE POLICY user_levels_insert_own ON user_levels FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid()::TEXT);
  DROP POLICY IF EXISTS user_levels_update_own ON user_levels;
  CREATE POLICY user_levels_update_own ON user_levels FOR UPDATE TO authenticated USING (user_id = auth.uid()::TEXT) WITH CHECK (user_id = auth.uid()::TEXT);
END $$;

-- USER FAVOURITE SPORTS
DO $$
BEGIN
  DROP POLICY IF EXISTS ufs_select_anon ON user_favourite_sports;
  CREATE POLICY ufs_select_anon ON user_favourite_sports FOR SELECT TO anon USING (true);
  DROP POLICY IF EXISTS ufs_select_auth ON user_favourite_sports;
  CREATE POLICY ufs_select_auth ON user_favourite_sports FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS ufs_manage_own ON user_favourite_sports;
  CREATE POLICY ufs_manage_own ON user_favourite_sports FOR ALL TO authenticated USING (user_id = auth.uid()::TEXT) WITH CHECK (user_id = auth.uid()::TEXT);
END $$;

-- USER BADGES
DO $$
BEGIN
  DROP POLICY IF EXISTS ub_select_anon ON user_badges;
  CREATE POLICY ub_select_anon ON user_badges FOR SELECT TO anon USING (true);
  DROP POLICY IF EXISTS ub_select_auth ON user_badges;
  CREATE POLICY ub_select_auth ON user_badges FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS ub_manage_own ON user_badges;
  CREATE POLICY ub_manage_own ON user_badges FOR ALL TO authenticated USING (user_id = auth.uid()::TEXT) WITH CHECK (user_id = auth.uid()::TEXT);
END $$;

-- USER CREATED GROUPS
DO $$
BEGIN
  DROP POLICY IF EXISTS ucg_select_anon ON user_created_groups;
  CREATE POLICY ucg_select_anon ON user_created_groups FOR SELECT TO anon USING (true);
  DROP POLICY IF EXISTS ucg_select_auth ON user_created_groups;
  CREATE POLICY ucg_select_auth ON user_created_groups FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS ucg_manage_own ON user_created_groups;
  CREATE POLICY ucg_manage_own ON user_created_groups FOR ALL TO authenticated USING (user_id = auth.uid()::TEXT) WITH CHECK (user_id = auth.uid()::TEXT);
END $$;

-- USER JOINED GROUPS
DO $$
BEGIN
  DROP POLICY IF EXISTS ujg_select_anon ON user_joined_groups;
  CREATE POLICY ujg_select_anon ON user_joined_groups FOR SELECT TO anon USING (true);
  DROP POLICY IF EXISTS ujg_select_auth ON user_joined_groups;
  CREATE POLICY ujg_select_auth ON user_joined_groups FOR SELECT TO authenticated USING (true);
  DROP POLICY IF EXISTS ujg_manage_own ON user_joined_groups;
  CREATE POLICY ujg_manage_own ON user_joined_groups FOR ALL TO authenticated USING (user_id = auth.uid()::TEXT) WITH CHECK (user_id = auth.uid()::TEXT);
END $$;

-- =============================================
-- 5. Indexes
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_code ON profiles(profile_code);
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_levels_user_id ON user_levels(user_id);
CREATE INDEX IF NOT EXISTS idx_ufs_user_id ON user_favourite_sports(user_id);
CREATE INDEX IF NOT EXISTS idx_ub_user_id ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_ucg_user_id ON user_created_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_ucg_group_id ON user_created_groups(group_id);
CREATE INDEX IF NOT EXISTS idx_ujg_user_id ON user_joined_groups(user_id);
CREATE INDEX IF NOT EXISTS idx_ujg_group_id ON user_joined_groups(group_id);

-- Update existing notifications type check to include new types
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('event', 'attendance', 'score', 'achievement', 'announcement', 'reminder', 'friend_request', 'group_join'));

-- =============================================
-- 6. Create helpful views for backward compat
-- =============================================

CREATE OR REPLACE VIEW user_profiles_full AS
SELECT
  p.*,
  COALESCE(s.total_matches, 0) AS total_matches,
  COALESCE(s.wins, 0) AS wins,
  COALESCE(s.losses, 0) AS losses,
  COALESCE(s.attendance_rate, 0) AS attendance_rate,
  COALESCE(s.current_streak, 0) AS current_streak,
  COALESCE(s.longest_streak, 0) AS longest_streak,
  COALESCE(s.win_rate, 0) AS win_rate,
  COALESCE(s.weekly_activity, '{0,0,0,0,0,0,0}') AS weekly_activity,
  COALESCE(s.points_total, 0) AS points_total,
  COALESCE(s.mvp_count, 0) AS mvp_count,
  COALESCE(l.level, 1) AS level,
  COALESCE(l.xp, 0) AS xp,
  COALESCE(ARRAY(SELECT sport FROM user_favourite_sports WHERE user_id = p.id), '{}') AS favourite_sports,
  COALESCE(ARRAY(SELECT badge FROM user_badges WHERE user_id = p.id), '{}') AS badges,
  COALESCE(ARRAY(SELECT group_id FROM user_created_groups WHERE user_id = p.id), '{}') AS created_groups,
  COALESCE(ARRAY(SELECT group_id FROM user_joined_groups WHERE user_id = p.id), '{}') AS joined_groups
FROM profiles p
LEFT JOIN user_stats s ON s.user_id = p.id
LEFT JOIN user_levels l ON l.user_id = p.id;
