-- WHOSIN FULL SCHEMA

-- USERS
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  profile_code TEXT NOT NULL UNIQUE,
  avatar TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  bio TEXT NOT NULL DEFAULT '',
  favourite_sports TEXT[] NOT NULL DEFAULT '{}',
  badges TEXT[] NOT NULL DEFAULT '{}',
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
  created_groups TEXT[] NOT NULL DEFAULT '{}',
  joined_groups TEXT[] NOT NULL DEFAULT '{}',
  joined_at TEXT NOT NULL,
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- GROUPS
CREATE TABLE IF NOT EXISTS groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT NOT NULL DEFAULT '🎯',
  banner TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  member_count INT NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  rules TEXT[] NOT NULL DEFAULT '{}',
  is_private BOOLEAN NOT NULL DEFAULT false,
  tags TEXT[] NOT NULL DEFAULT '{}',
  upcoming_events INT NOT NULL DEFAULT 0,
  total_events INT NOT NULL DEFAULT 0
);

-- GROUP MEMBERS
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('creator', 'admin', 'member')),
  joined_at TEXT NOT NULL,
  matches_played INT NOT NULL DEFAULT 0,
  wins INT NOT NULL DEFAULT 0,
  losses INT NOT NULL DEFAULT 0,
  win_rate REAL NOT NULL DEFAULT 0,
  attendance_rate REAL NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  points INT NOT NULL DEFAULT 0,
  UNIQUE(group_id, user_id)
);

-- EVENTS
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  sport TEXT NOT NULL DEFAULT 'badminton',
  group_id TEXT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  end_time TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  venue_address TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  cover_image TEXT NOT NULL DEFAULT '',
  organizer TEXT NOT NULL REFERENCES users(id),
  max_slots INT NOT NULL DEFAULT 12,
  weather_condition TEXT NOT NULL DEFAULT 'TBD',
  weather_temp REAL NOT NULL DEFAULT 28,
  weather_icon TEXT NOT NULL DEFAULT '☀️',
  weather_humidity INT NOT NULL DEFAULT 60,
  weather_wind INT NOT NULL DEFAULT 10,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'paused', 'completed', 'cancelled')),
  is_recurring BOOLEAN NOT NULL DEFAULT false,
  recurring_pattern TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  gallery TEXT[] NOT NULL DEFAULT '{}',
  rankings JSONB DEFAULT '[]',
  mvps JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ATTENDANCE
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('coming', 'not_coming')),
  updated_at TEXT NOT NULL,
  UNIQUE(event_id, user_id)
);

-- LEAGUES
CREATE TABLE IF NOT EXISTS leagues (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  format TEXT DEFAULT 'doubles' CHECK (format IN ('single', 'doubles')),
  players TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ongoing', 'completed'))
);

-- TEAMS
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  player_ids TEXT[] NOT NULL DEFAULT '{}',
  color TEXT NOT NULL DEFAULT '#7c3aed'
);

-- MATCHES
CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  league_id TEXT NOT NULL REFERENCES leagues(id) ON DELETE CASCADE,
  name TEXT DEFAULT '',
  is_final BOOLEAN DEFAULT false,
  team1_id TEXT NOT NULL REFERENCES teams(id),
  team2_id TEXT NOT NULL REFERENCES teams(id),
  score1 INT NOT NULL DEFAULT 0,
  score2 INT NOT NULL DEFAULT 0,
  winner_id TEXT REFERENCES teams(id),
  duration INT NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  completed_at TEXT
);

-- ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  author_id TEXT NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false
);

-- FRIENDSHIPS
CREATE TABLE IF NOT EXISTS friendships (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(user_id, friend_id)
);

-- STORIES
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('event', 'attendance', 'score', 'achievement', 'announcement', 'reminder')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  avatar TEXT,
  timestamp TEXT NOT NULL
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_events_group_id ON events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_attendance_event ON attendance(event_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_user ON friendships(user_id);
CREATE INDEX IF NOT EXISTS idx_friendships_friend ON friendships(friend_id);
CREATE INDEX IF NOT EXISTS idx_stories_user ON stories(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
