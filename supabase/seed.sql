-- SEED DATA FOR WHOSIN
-- Run this after schema.sql in Supabase SQL Editor

-- USERS
INSERT INTO users (id, name, username, email, phone, password, profile_code, avatar, cover_image, bio, favourite_sports, badges, total_matches, wins, losses, attendance_rate, current_streak, longest_streak, win_rate, weekly_activity, points_total, mvp_count, created_groups, joined_groups, joined_at, level, xp) VALUES
('u1', 'Mirun Raj', 'mirun', 'mirun@email.com', '1234567890', 'pass123', 'MIR001', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Mirun&backgroundColor=b6e3f4', 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', 'Love badminton and trekking!', '{badminton,trekking}', '{first_match,first_win,weekend_warrior}', 28, 20, 8, 92, 5, 8, 71, '{3,2,1,4,2,3,5}', 1240, 3, '{g1}', '{g2}', '2024-01-15', 12, 3400),
('u2', 'Sneha Patel', 'sneha', 'sneha@email.com', '9876543210', 'pass456', 'SNE002', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sneha&backgroundColor=d4a5c7', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', 'Weekend warrior!', '{badminton,cricket,football}', '{five_wins,full_attendance}', 35, 25, 10, 95, 8, 12, 71, '{4,3,2,5,3,4,6}', 1850, 5, '{}', '{g1,g2}', '2024-02-01', 18, 5200),
('u3', 'Arjun Nair', 'arjun', 'arjun@email.com', '5551234567', 'pass789', 'ARJ003', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Arjun&backgroundColor=c0aede', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', 'Cricket is life', '{cricket,football,badminton}', '{first_match,captain}', 42, 28, 14, 88, 4, 10, 67, '{2,5,3,1,4,2,3}', 2100, 4, '{g2}', '{g1}', '2024-01-20', 20, 6800),
('u4', 'Priya Sharma', 'priya', 'priya@email.com', '7778889990', 'pass000', 'PRI004', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Priya&backgroundColor=ffd5dc', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80', 'Tennis and badminton fan', '{badminton,tennis,swimming}', '{first_match,full_attendance}', 15, 10, 5, 100, 15, 15, 67, '{1,1,2,1,2,1,2}', 750, 2, '{}', '{g1}', '2024-03-01', 8, 1800),
('u5', 'Rahul Kapoor', 'rahul', 'rahul@email.com', '3334445556', 'pass111', 'RAH005', 'https://api.dicebear.com/9.x/avataaars/svg?seed=Rahul&backgroundColor=ffdfbf', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=800&q=80', 'Football forever!', '{football,badminton,volleyball}', '{first_match,first_win}', 20, 12, 8, 75, 3, 5, 60, '{2,1,0,3,1,2,4}', 980, 1, '{}', '{g2}', '2024-04-10', 10, 2200);

-- GROUPS
INSERT INTO groups (id, name, logo, banner, description, member_count, created_at, rules, is_private, tags) VALUES
('g1', 'Badminton Club', '🏸', 'https://images.unsplash.com/photo-1529590003495-b2646e2715c2?w=800&q=80', 'Weekly badminton sessions for all levels. We play every Saturday at Sportorium!', 5, '2024-01-15', '{Bring your own racket,"Be on time","Respect court bookings"}', false, '{badminton,weekend,competitive}'),
('g2', 'Weekend Warriors', '⚡', 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80', 'Multi-sport group for weekend activities. Cricket, badminton, football and more!', 4, '2024-02-01', '{No toxic behavior,"Vote on sports","Share costs equally"}', false, '{multi-sport,weekend,friendly}');

-- GROUP MEMBERS
INSERT INTO group_members (group_id, user_id, role, joined_at, matches_played, wins, losses, win_rate, attendance_rate, current_streak, points) VALUES
('g1', 'u1', 'creator', '2024-01-15', 20, 15, 5, 75, 95, 5, 890),
('g1', 'u2', 'admin', '2024-02-01', 18, 13, 5, 72, 100, 8, 780),
('g1', 'u3', 'member', '2024-02-15', 22, 14, 8, 64, 85, 3, 920),
('g1', 'u4', 'member', '2024-03-01', 12, 8, 4, 67, 100, 12, 510),
('g1', 'u5', 'member', '2024-05-01', 8, 5, 3, 63, 75, 2, 340),
('g2', 'u2', 'creator', '2024-02-01', 15, 11, 4, 73, 95, 6, 720),
('g2', 'u3', 'admin', '2024-02-01', 18, 12, 6, 67, 90, 4, 810),
('g2', 'u1', 'member', '2024-06-01', 6, 4, 2, 67, 80, 3, 280),
('g2', 'u5', 'member', '2024-06-15', 10, 6, 4, 60, 75, 2, 430);

-- EVENTS
INSERT INTO events (id, title, sport, group_id, date, time, end_time, venue, venue_address, description, cover_image, organizer, max_slots, weather_condition, weather_temp, weather_icon, weather_humidity, weather_wind, status, is_recurring, gallery, tags, rankings, mvps) VALUES
('e1', 'Saturday Smash Session', 'badminton', 'g1', '2025-07-12', '16:00', '19:00', 'Sportorium Court 2', 'Sports Complex, Level 3', 'Weekly Saturday doubles session. Bring your A-game! We usually play for 2-3 hours with rotating partners.', 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80', 'u1', 8, 'Sunny', 28, '☀️', 60, 12, 'upcoming', true, '{}', '{competitive,doubles}', '[]', '[]'),
('e2', 'Friendly Mixed Doubles', 'badminton', 'g1', '2025-07-19', '17:00', '20:00', 'Sportorium Court 1', 'Sports Complex, Level 3', 'Casual mixed doubles session. All skill levels welcome! We rotate partners every game.', 'https://images.unsplash.com/photo-1613919113640-257e0a7ebc92?w=800&q=80', 'u3', 12, 'Partly Cloudy', 26, '⛅', 55, 15, 'upcoming', false, '{}', '{friendly,mixed}', '[]', '[]'),
('e3', 'Tournament Prep', 'badminton', 'g1', '2025-06-28', '15:00', '19:00', 'Sportorium Court 3', 'Sports Complex, Level 3', 'Intense practice session for upcoming inter-club tournament. Advanced players preferred.', 'https://images.unsplash.com/photo-1586126942774-4b5e3e6a9385?w=800&q=80', 'u2', 8, 'Cool & Clear', 24, '🌤️', 45, 8, 'completed', false, '{https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=200&q=80}', '{tournament,advanced}', '[{"teamId":"t1","teamName":"Team A","wins":2,"rank":1}]', '[{"userId":"u1","name":"Mirun Raj","wins":2,"rank":1},{"userId":"u2","name":"Sneha Patel","wins":2,"rank":2},{"userId":"u3","name":"Arjun Nair","wins":0,"rank":3}]'),
('e4', 'Cricket at Central Park', 'cricket', 'g2', '2025-07-20', '07:00', '11:00', 'Central Park Ground', 'Central Park, Near Gate 3', 'Early morning cricket match. 8 overs per side. Bring your own kit if you have it.', 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=800&q=80', 'u2', 10, 'Sunny', 30, '☀️', 50, 5, 'upcoming', false, '{}', '{competitive,turf}', '[]', '[]'),
('e5', 'Badminton Night', 'badminton', 'g2', '2025-07-15', '20:00', '23:00', 'Sportorium Court 4', 'Sports Complex, Level 2', 'Night session! Good vibes, great rallies. Let us know if you need a racket.', 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&q=80', 'u2', 8, 'Clear', 27, '🌙', 55, 8, 'upcoming', false, '{}', '{night,casual}', '[]', '[]'),
('e6', 'Badminton Showdown', 'badminton', 'g1', '2025-06-22', '14:00', '17:00', 'Sportorium Court 2', 'Sports Complex, Level 3', 'Friendly competition with prizes!', 'https://images.unsplash.com/photo-1613919113640-257e0a7ebc92?w=800&q=80', 'u1', 8, 'Cloudy', 25, '☁️', 65, 18, 'completed', false, '{}', '{competition}', '[{"teamId":"t4","teamName":"Pair 1","wins":2,"rank":1}]', '[{"userId":"u1","name":"Mirun Raj","wins":2,"rank":1},{"userId":"u2","name":"Sneha Patel","wins":2,"rank":2},{"userId":"u5","name":"Rahul Kapoor","wins":0,"rank":3}]');

-- ATTENDANCE
INSERT INTO attendance (event_id, user_id, status, updated_at) VALUES
('e1', 'u1', 'coming', '2025-07-01T10:00:00Z'),
('e1', 'u2', 'coming', '2025-07-01T12:00:00Z'),
('e1', 'u3', 'coming', '2025-07-02T08:00:00Z'),
('e1', 'u4', 'not_coming', '2025-07-02T09:00:00Z'),
('e2', 'u1', 'coming', '2025-07-05T10:00:00Z'),
('e2', 'u2', 'coming', '2025-07-05T11:00:00Z'),
('e3', 'u1', 'coming', '2025-06-20T10:00:00Z'),
('e3', 'u2', 'coming', '2025-06-20T11:00:00Z'),
('e3', 'u3', 'coming', '2025-06-21T08:00:00Z'),
('e3', 'u4', 'coming', '2025-06-21T09:00:00Z'),
('e4', 'u2', 'coming', '2025-07-10T10:00:00Z'),
('e4', 'u3', 'coming', '2025-07-10T11:00:00Z'),
('e5', 'u2', 'coming', '2025-07-08T10:00:00Z'),
('e5', 'u1', 'coming', '2025-07-08T12:00:00Z'),
('e6', 'u1', 'coming', '2025-06-20T10:00:00Z'),
('e6', 'u2', 'coming', '2025-06-20T11:00:00Z'),
('e6', 'u3', 'not_coming', '2025-06-20T12:00:00Z'),
('e6', 'u4', 'coming', '2025-06-21T09:00:00Z'),
('e6', 'u5', 'coming', '2025-06-21T10:00:00Z'),
('e3', 'u5', 'coming', '2025-06-21T10:00:00Z'),
('e1', 'u5', 'coming', '2025-07-02T10:00:00Z');

-- LEAGUES
INSERT INTO leagues (id, event_id, name, format, players, status) VALUES
('l1', 'e3', 'Knockout Round', 'doubles', '{u1,u2,u3,u4,u5}', 'completed'),
('l2', 'e6', 'Round Robin', 'doubles', '{u1,u2,u3,u4,u5}', 'completed');

-- TEAMS
INSERT INTO teams (id, league_id, name, player_ids, color) VALUES
('t1', 'l1', 'Team A', '{u1,u2}', '#00ff41'),
('t2', 'l1', 'Team B', '{u3,u4}', '#7c3aed'),
('t3', 'l1', 'Team C', '{u5}', '#f59e0b'),
('t4', 'l2', 'Pair 1', '{u1,u2}', '#00ff41'),
('t5', 'l2', 'Pair 2', '{u3,u5}', '#7c3aed'),
('t6', 'l2', 'Pair 3', '{u4}', '#f59e0b');

-- MATCHES
INSERT INTO matches (id, league_id, name, is_final, team1_id, team2_id, score1, score2, winner_id, duration, notes, completed_at) VALUES
('m1', 'l1', 'Semi Final 1', false, 't1', 't2', 21, 15, 't1', 25, 'Great match!', '2025-06-28T16:00:00Z'),
('m2', 'l1', 'Final', true, 't1', 't3', 21, 18, 't1', 28, 'Championship match', '2025-06-28T17:00:00Z'),
('m3', 'l2', 'Match 1', false, 't4', 't5', 21, 12, 't4', 20, 'Opening round', '2025-06-22T14:30:00Z'),
('m4', 'l2', 'Match 2', true, 't4', 't6', 21, 8, 't4', 18, 'Final match', '2025-06-22T15:30:00Z');

-- FRIENDSHIPS
INSERT INTO friendships (id, user_id, friend_id, status, created_at, updated_at) VALUES
('f1', 'u1', 'u2', 'accepted', '2024-02-01T10:00:00Z', '2024-02-01T12:00:00Z'),
('f2', 'u1', 'u3', 'accepted', '2024-03-01T10:00:00Z', '2024-03-01T12:00:00Z'),
('f3', 'u1', 'u4', 'accepted', '2024-04-01T10:00:00Z', '2024-04-01T12:00:00Z'),
('f4', 'u2', 'u3', 'accepted', '2024-02-15T10:00:00Z', '2024-02-15T12:00:00Z'),
('f5', 'u2', 'u4', 'accepted', '2024-03-15T10:00:00Z', '2024-03-15T12:00:00Z'),
('f6', 'u2', 'u5', 'accepted', '2024-05-01T10:00:00Z', '2024-05-01T12:00:00Z');

-- NOTIFICATIONS
INSERT INTO notifications (id, user_id, type, title, body, read, action_url, avatar, timestamp) VALUES
('n1', 'u1', 'event', 'Upcoming: Saturday Smash', 'Badminton session this Saturday at 4pm!', false, '/events/e1', '📅', '2025-07-01T10:00:00Z'),
('n2', 'u1', 'attendance', 'Sneha is coming!', 'Sneha confirmed for Saturday Smash.', false, '/events/e1', '✅', '2025-07-01T12:00:00Z'),
('n3', 'u1', 'score', 'Tournament Results', 'Team A won the knockout round!', true, '/events/e3', '🏆', '2025-06-28T18:00:00Z');
